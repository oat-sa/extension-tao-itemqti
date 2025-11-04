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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti;

use core_kernel_classes_Resource;
use Exception;
use InvalidArgumentException;
use oat\oatbox\service\ConfigurableService;
use common_Logger;
use common_Utils;

/**
 * Retrieves MAXSCORE (maximum achievable points) from QTI items.
 */
class ItemMaxScoreService extends ConfigurableService
{
    public const SERVICE_ID = 'taoQtiItem/ItemMaxScoreService';

    /**
     * Get MAXSCORE for a single item
     *
     * Retrieves the maximum achievable score for a single item.
     *
     * Behavior:
     * - Returns 0.0 for items with missing MAXSCORE outcomeDeclaration
     * - Returns 0.0 for items that fail to parse (with error logged)
     * - Handles external-scored items (returns manual MAXSCORE if set)
     *
     * @param string $itemUri - Valid TAO resource URI (e.g., 'http://tao.dev/ontology.rdf#item123')
     * @return float
     * @throws InvalidArgumentException if $itemUri is empty or not a valid URI
     */
    public function getItemMaxScore(string $itemUri): float
    {
        if (empty($itemUri) || !common_Utils::isUri($itemUri)) {
            throw new InvalidArgumentException(
                sprintf(
                    'Invalid item URI provided: "%s". Expected a valid TAO resource URI.',
                    $itemUri
                )
            );
        }

        try {
            $item = new core_kernel_classes_Resource($itemUri);

            /** @var Service $qtiService */
            $qtiService = $this->getServiceLocator()->get(Service::class);

            /** @var Item $qtiItem */
            $qtiItem = $qtiService->getDataItemByRdfItem($item);

            return $this->extractMaxScore($qtiItem);
        } catch (Exception $e) {
            common_Logger::w(
                'Failed to retrieve MAXSCORE for item ' . $itemUri . ': ' . $e->getMessage()
            );
            return 0.0;
        }
    }

    /**
     * Retrieve MAXSCORE default values for multiple items
     *
     * This method retrieves the maximum achievable score for each item
     * by processing each URI individually. While this requires N file reads
     * (one qti.xml per item), it enables a single HTTP request instead of N
     * separate API calls from the frontend.
     *
     * @param array $itemUris
     * @return array<string, float>
     * @throws Exception
     */
    public function getItemsMaxScores(array $itemUris): array
    {
        $itemUris = array_filter($itemUris, 'is_string');

        if (empty($itemUris)) {
            return [];
        }

        $result = [];

        try {
            /** @var Service $qtiService */
            $qtiService = $this->getServiceLocator()->get(Service::class);
        } catch (Exception $e) {
            common_Logger::e('Failed to retrieve QTI service: ' . $e->getMessage());
            throw new Exception('QTI service unavailable: ' . $e->getMessage());
        }

        foreach ($itemUris as $uri) {
            try {
                if (empty($uri) || !common_Utils::isUri($uri)) {
                    common_Logger::w(
                        sprintf('Invalid item URI provided: "%s". Skipping.', $uri)
                    );
                    $result[$uri] = 0.0;
                    continue;
                }

                $item = new core_kernel_classes_Resource($uri);
                /** @var Item $qtiItem */
                $qtiItem = $qtiService->getDataItemByRdfItem($item);
                $result[$uri] = $this->extractMaxScore($qtiItem);
            } catch (Exception $e) {
                common_Logger::w(
                    'Failed to retrieve MAXSCORE for item ' . $uri . ': ' . $e->getMessage()
                );
                $result[$uri] = 0.0;
            }
        }

        return $result;
    }

    /**
     * Extract MAXSCORE value from parsed QTI item
     *
     * Searches through the item's outcome declarations to find the one with
     * identifier="MAXSCORE" and returns its defaultValue.
     *
     * @param Item|null $qtiItem - Parsed QTI item object
     * @return float - The maximum score value, or 0.0 if not found
     */
    private function extractMaxScore(?Item $qtiItem): float
    {
        if (!$qtiItem) {
            return 0.0;
        }

        $outcomes = $qtiItem->getOutcomes();

        foreach ($outcomes as $outcome) {
            if ($outcome->getIdentifier() === 'MAXSCORE') {
                $defaultValue = $outcome->getDefaultValue();

                if ($defaultValue !== null && $defaultValue !== '') {
                    return (float)$defaultValue;
                }

                return 0.0;
            }
        }

        common_Logger::d(
            'No MAXSCORE outcomeDeclaration found for item ' . ($qtiItem->getIdentifier() ?? 'unknown')
        );

        return 0.0;
    }
}
