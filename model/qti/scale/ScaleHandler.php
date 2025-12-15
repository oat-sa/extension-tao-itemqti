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

class ScaleHandler
{
    private ScaleStorageService $storageService;
    private ScalePreprocessor $scalePreprocessor;
    private LoggerService $loggerService;

    /**
     * @var array<string, array>
     */
    private array $scaleIndex = [];

    public function __construct(
        ScaleStorageService $storageService,
        ScalePreprocessor $scalePreprocessor,
        LoggerService $loggerService
    ) {
        $this->storageService = $storageService;
        $this->scalePreprocessor = $scalePreprocessor;
        $this->loggerService = $loggerService;
    }

    /**
     * Persist scale metadata and adjust the QTI XML before saving the item.
     *
     * @throws JsonException
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

            $path = $this->storageService->storeScaleData($item, $relativePath, $payload);
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

    private function removeAuthoringAttributes(DOMElement $outcome): void
    {
        if ($outcome->hasAttribute('scale')) {
            $outcome->removeAttribute('scale');
        }

        if ($outcome->hasAttribute('rubric')) {
            $outcome->removeAttribute('rubric');
        }
    }

    private function resolveScaleDefinition(string $scaleUri): array
    {
        if (empty($this->scaleIndex)) {
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

    private function buildScaleIndex(): void
    {
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
