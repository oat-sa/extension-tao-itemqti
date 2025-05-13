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
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\exporter\scale;

use DOMDocument;
use DOMNodeList;
use Monolog\Logger;
use oat\oatbox\log\LoggerService;
use oat\tao\model\Lists\Business\Domain\RemoteSourceContext;
use oat\tao\model\Lists\Business\Service\RemoteSource;
use oat\taoQtiItem\model\qti\metadata\exporter\CustomPropertiesManifestScanner;
use Throwable;

class ScalePreprocessor
{
    private RemoteSource $remoteSource;
    private CustomPropertiesManifestScanner $manifestScanner;
    private ?string $remoteListScale;
    private LoggerService $loggerService;
    private array $scaleCollection;

    public function __construct(
        RemoteSource $remoteSource,
        CustomPropertiesManifestScanner $manifestScanner,
        LoggerService $loggerService,
        ?string $remoteListScale
    ) {
        $this->remoteSource = $remoteSource;
        $this->manifestScanner = $manifestScanner;
        $this->remoteListScale = $remoteListScale;
        $this->loggerService = $loggerService;
    }

    public function includeScaleObject(DomDocument $manifest, DOMDocument $testDoc): void
    {
        if (!$this->isRemoteListScaleValid()) {
            return;
        }
        //Find Outcome Declaration in testDoc
        $outcomeDeclarations = $testDoc->getElementsByTagName('outcomeDeclaration');
        //Find interpretation attribute in each outcome declaration
        foreach ($outcomeDeclarations as $outcomeDeclaration) {
            $interpretation = $outcomeDeclaration->getAttribute('interpretation');
            if ($this->isScaleInterpretation($interpretation, $this->scaleCollection)) {
                if ($this->manifestScanner->getCustomPropertyByUri($manifest, $interpretation)->length === 0) {
                    $this->addCustomProperty(
                        $manifest,
                        $this->manifestScanner->getCustomProperties($manifest),
                        array_filter($this->scaleCollection, function ($scale) use ($interpretation) {
                            return $scale['uri'] === $interpretation;
                        })
                    );
                }
            }
        }
    }

    private function isScaleInterpretation(string $interpretation, array $scales): array
    {
        //Find and return scale interpretation
        $scale = array_filter($scales, function ($scale) use ($interpretation) {
            return $scale['uri'] === $interpretation;
        });

        if (empty($scale)) {
            return [];
        }

        return reset($scale);
    }

    private function addCustomProperty(DOMDocument $manifest, DOMNodeList $customProperties, array $scale): void
    {
        $scale = reset($scale);
        $customProperties = $customProperties->item(0);
        $newProperty = $manifest->createElement('property');
        // Create and append child elements to the property
        $uriElement = $manifest->createElement('uri', $scale['uri']);
        $labelElement = $manifest->createElement('label', $scale['label']);
        $domainElement = $manifest->createElement('domain', 'http://www.tao.lu/Ontologies/TAO.rdf#Scale');
        $scaleElement = $manifest->createElement('scale', json_encode($scale['values']));
        // Append all child elements to the new property
        $newProperty->appendChild($uriElement);
        $newProperty->appendChild($labelElement);
        $newProperty->appendChild($domainElement);
        $newProperty->appendChild($scaleElement);

        $customProperties->appendChild($newProperty);
    }

    private function isRemoteListScaleValid(): bool
    {
        if (!$this->remoteListScale) {
            $this->loggerService->debug('Environment variable REMOTE_LIST_SCALE is not defined');
            return false;
        }

        $scaleCollection = iterator_to_array($this->remoteSource->fetchByContext(
            new RemoteSourceContext([
                RemoteSourceContext::PARAM_SOURCE_URL => $this->remoteListScale,
                RemoteSourceContext::PARAM_PARSER => 'scale',
            ])
        ));

        if (
            is_array($scaleCollection)
            && count($scaleCollection) > 0
            && $this->hasRequiredFields($scaleCollection)
        ) {
            $this->scaleCollection = $scaleCollection;
            return true;
        }

        $this->loggerService->warning('Remote list for scale is malformed');
        return false;
    }

    private function hasRequiredFields(array $scaleCollection): bool
    {
        foreach ($scaleCollection as $scale) {
            if (!isset($scale['uri'], $scale['label'], $scale['values'])) {
                return false;
            }
            if (!is_array($scale['values'])) {
                return false;
            }
            foreach ($scale['values'] as $value) {
                if (!is_string($value)) {
                    return false;
                }
            }

            //in values array key and value are strings
            foreach ($scale['values'] as $key => $value) {
                if (!(is_string($key) || is_int($key)) || !is_string($value)) {
                    return false;
                }
            }
        }
        return true;
    }
}
