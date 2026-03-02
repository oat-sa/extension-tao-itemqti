<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation, Inc.,
 * 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\scale;

use core_kernel_classes_Resource;
use DOMDocument;
use DOMElement;
use DOMXPath;
use JsonException;
use oat\oatbox\log\LoggerService;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScalePreprocessor;
use RuntimeException;
use Throwable;

/**
 * Service for handling scale persistence for QTI item outcome declarations.
 *
 * This handler processes XML-based QTI item documents to extract scale references from outcome
 * declarations, save scale metadata as JSON files in the item's scales directory, and transform
 * outcome declarations to reference stored scales via longInterpretation attributes.
 *
 * Key responsibilities:
 * - Parse QTI XML with namespace handling
 * - Extract scale and rubric data from outcomeDeclaration elements
 * - Save scale metadata to item's scales directory
 * - Transform outcomeDeclaration elements to use longInterpretation references
 * - Remove authoring-only attributes (scale, rubric)
 * - Clean up unused scale files
 * - Cache scale definitions for performance
 *
 * Architecture Note:
 * This handler is separate from taoQtiTest\models\classes\scale\ScaleHandler because:
 * - Processes XML (QTI item) vs JSON (test model)
 * - Uses DOM/XPath for XML manipulation vs array operations
 * - Uses ScaleStorageService for directory access vs QtiTestService
 * - Handles XML namespaces and preserves document structure
 * - Optimized for item authoring context vs test authoring
 *
 * Processing Flow:
 * 1. Parse XML document with namespace detection
 * 2. Query for outcomeDeclaration elements (XPath or getElementsByTagName)
 * 3. For each outcome declaration:
 *    - Check if scale is removed (empty scale attribute)
 *    - Delete old scale file if needed
 *    - Resolve scale definition from remote list (with caching)
 *    - Save scale metadata to file
 *    - Transform XML attributes
 *    - Track used paths
 * 4. Clean up unused scale files
 * 5. Return modified XML document
 *
 * @see \oat\taoQtiTest\models\classes\scale\ScaleHandler for test-level scale handling
 * @see \oat\taoQtiItem\model\qti\scale\ScaleStorageService for storage operations
 * @see /tao/taoQtiItem/.notes/ScaleHandler-documentation.md for detailed documentation
 *
 * @author Open Assessment Technologies SA
 * @package oat\taoQtiItem\model\qti\scale
 */
class ScaleHandler
{
    private ScaleStorageService $storageService;
    private ScalePreprocessor $scalePreprocessor;
    private LoggerService $loggerService;

    /**
     * @var array<string, array>
     */
    private array $scaleIndex = [];
    private bool $scaleIndexInitialized = false;

    public function __construct(
        ScaleStorageService $storageService,
        ScalePreprocessor $scalePreprocessor,
        LoggerService $loggerService
    ) {
        $this->storageService = $storageService;
        $this->scalePreprocessor = $scalePreprocessor;
        $this->loggerService = $loggerService;
        $this->scaleIndexInitialized = false;
    }

    /**
     * Persist scale metadata and adjust the QTI XML before saving the item.
     *
     * Processing flow:
     * 1. Parse XML document with namespace detection
     * 2. Query for outcomeDeclaration elements using XPath (with namespace) or getElementsByTagName
     * 3. For each outcome declaration:
     *    - Extract scale, rubric, longInterpretation, and identifier attributes
     *    - If scale removed: delete stored file and remove longInterpretation
     *    - If scale present: resolve definition, save to file, update attributes
     *    - Remove authoring-only attributes (scale, rubric)
     * 4. Clean up any scale files not referenced by current declarations
     * 5. Return modified XML with preserved structure and whitespace
     *
     * XML Transformation Example:
     * Input:
     * ```xml
     * <outcomeDeclaration
     *     identifier="SCORE"
     *     cardinality="single"
     *     baseType="float"
     *     scale="http://example.org/scales/cefr"
     *     rubric="Award A1 for basic phrases..."/>
     * ```
     *
     * Output:
     * ```xml
     * <outcomeDeclaration
     *     identifier="SCORE"
     *     cardinality="single"
     *     baseType="float"
     *     longInterpretation="scales/SCORE_a1b2c3d4.json"/>
     * ```
     *
     * Created file (scales/SCORE_a1b2c3d4.json):
     * ```json
     * {
     *   "identifier": "SCORE",
     *   "rubric": "Award A1 for basic phrases...",
     *   "scale": {
     *     "uri": "http://example.org/scales/cefr",
     *     "label": "CEFR A1-C2",
     *     "values": {"1": "A1", "2": "A2", ...}
     *   }
     * }
     * ```
     *
     * @param string $xml QTI XML document containing outcome declarations
     * @param core_kernel_classes_Resource $item The item resource being processed
     * @return string Modified QTI XML with scale references updated and authoring attributes removed
     * @throws JsonException If scale metadata JSON encoding fails
     * @throws RuntimeException if XML serialization fails
     */
    public function process(string $xml, core_kernel_classes_Resource $item): string
    {
        $document = new DOMDocument('1.0', 'UTF-8');
        $document->preserveWhiteSpace = true;
        $document->formatOutput = false;
        $document->loadXML($xml);

        $xpath = new DOMXPath($document);
        $namespace = $document->documentElement->namespaceURI ?? '';
        if ($namespace) {
            $xpath->registerNamespace('qti', $namespace);
            $nodes = $xpath->query('//qti:outcomeDeclaration');
        } else {
            $nodes = $document->getElementsByTagName('outcomeDeclaration');
        }

        if (!$nodes || $nodes->length === 0) {
            return $xml;
        }

        $usedPaths = [];

        /** @var DOMElement $outcome */
        foreach ($nodes as $outcome) {
            $scaleUri = trim((string)$outcome->getAttribute('scale'));
            $rubric = htmlspecialchars(
                trim((string)$outcome->getAttribute('rubric')),
                ENT_XML1 | ENT_QUOTES,
                'UTF-8'
            );
            $longInterpretation = (string)$outcome->getAttribute('longInterpretation');
            $identifier = (string)$outcome->getAttribute('identifier');

            $storedPath = $this->storageService->isScalePath($longInterpretation) ? $longInterpretation : null;

            if ($scaleUri === '') {
                if ($storedPath !== null) {
                    $this->storageService->deleteScale($item, $storedPath);
                    $outcome->removeAttribute('longInterpretation');
                }
                $this->removeAuthoringAttributes($outcome);
                continue;
            }

            $relativePath = $storedPath ?? $this->storageService->generateRelativePath($identifier);
            $payload = [
                'identifier' => $identifier,
                'scale' => $this->resolveScaleDefinition($scaleUri),
                'rubric' => $rubric,
            ];

            $path = $this->storageService->storeScaleData(
                $item,
                $relativePath,
                $payload
            );

            $outcome->setAttribute('longInterpretation', $path);
            $this->removeAuthoringAttributes($outcome);
            $usedPaths[] = $path;
        }

        $this->storageService->cleanupScales($item, $usedPaths);

        $result = $document->saveXML();
        if ($result === false) {
            throw new RuntimeException(
                sprintf(
                    'Failed to serialize XML document for item %s: DOMDocument::saveXML() returned false',
                    $item->getUri()
                )
            );
        }

        return $result;
    }

    /**
     * Remove authoring-only attributes from an outcome declaration element.
     *
     * The scale and rubric attributes are used during authoring but should not appear
     * in the final QTI XML. They are replaced by the longInterpretation reference to
     * the stored scale file.
     *
     * @param DOMElement $outcome The outcomeDeclaration element to clean
     * @return void
     */
    private function removeAuthoringAttributes(DOMElement $outcome): void
    {
        if ($outcome->hasAttribute('scale')) {
            $outcome->removeAttribute('scale');
        }

        if ($outcome->hasAttribute('rubric')) {
            $outcome->removeAttribute('rubric');
        }
    }

    /**
     * Resolve a scale URI to its full definition from the remote scale list.
     *
     * Uses an internal cache (scaleIndex) for performance. The cache is built on first
     * call via buildScaleIndex(). If the scale URI is not found in the remote list,
     * returns a fallback structure with the URI and empty values.
     *
     * Fallback structure ensures processing continues even when scale is not in remote list.
     *
     * @param string $scaleUri The URI of the scale to resolve (e.g., "http://example.org/scales/cefr")
     * @return array Scale definition with keys: uri, label, values
     *               Example: ['uri' => '...', 'label' => 'CEFR A1-C2', 'values' => ['1' => 'A1', ...]]
     *               Fallback: ['uri' => $scaleUri, 'label' => $scaleUri, 'values' => []]
     */
    private function resolveScaleDefinition(string $scaleUri): array
    {
        if (!$this->scaleIndexInitialized) {
            $this->buildScaleIndex();
        }

        if (isset($this->scaleIndex[$scaleUri])) {
            return $this->scaleIndex[$scaleUri];
        }

        return [
            'uri' => $scaleUri,
            'label' => $scaleUri,
            'values' => [],
        ];
    }

    /**
     * Build an internal cache of scale definitions indexed by URI.
     *
     * Fetches the remote scale list via ScalePreprocessor and creates a lookup map
     * indexed by scale URI for O(1) access during processing. This cache is used by
     * resolveScaleDefinition() to avoid repeated iterations over the remote list.
     *
     * Error Handling:
     * If the remote list cannot be loaded (network error, service unavailable, etc.),
     * logs a warning and sets an empty index. Processing continues with fallback scale
     * definitions.
     *
     * Performance:
     * - Single remote list fetch per process() invocation
     * - O(n) to build index, O(1) for subsequent lookups
     * - Index persists for duration of process() call only
     *
     * @return void
     */
    private function buildScaleIndex(): void
    {
        $this->scaleIndexInitialized = true;

        try {
            $remoteList = $this->scalePreprocessor->getScaleRemoteList();
            foreach ($remoteList as $scale) {
                if (!isset($scale['uri'])) {
                    continue;
                }
                $this->scaleIndex[$scale['uri']] = $scale;
            }
        } catch (Throwable $exception) {
            $this->loggerService->warning(
                sprintf('Unable to load remote scale definitions: %s', $exception->getMessage())
            );
            $this->scaleIndex = [];
        }
    }
}
