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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\importer;

use core_kernel_classes_Property as Property;
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class PropertyImportCompatibilityChecker
{
    private ListService $listService;

    public function __construct(ListService $listService)
    {
        $this->listService = $listService;
    }

    public function hasMatchingImportedListValues(
        Property $classProperty,
        string $propertyUri,
        array $metadataValues
    ): bool {
        $importedValues = $this->extractImportedValues($propertyUri, $metadataValues);

        if ($importedValues === []) {
            return true;
        }

        foreach ($importedValues as $importedValue) {
            if (!$this->hasRangeValue($classProperty, $importedValue)) {
                return false;
            }
        }

        return true;
    }

    private function hasRangeValue(Property $property, string $value): bool
    {
        $range = $property->getRange();

        if ($range === null) {
            return false;
        }

        $normalizedValue = trim($value);

        foreach ($this->listService->getListElements($range) as $listEntry) {
            $entryLabel = trim((string) $listEntry->getLabel());
            $entryOriginalUri = trim((string) $listEntry->getOriginalUri());
            $entryUri = method_exists($listEntry, 'getUri') ? trim((string) $listEntry->getUri()) : '';

            if (
                $entryLabel === $normalizedValue
                || $entryOriginalUri === $normalizedValue
                || $entryUri === $normalizedValue
            ) {
                return true;
            }
        }

        return false;
    }

    private function extractImportedValues(string $propertyUri, array $metadataValues): array
    {
        $importedValues = [];

        foreach ($metadataValues as $metadataValueCollection) {
            foreach ($metadataValueCollection as $metadataValue) {
                if (!$metadataValue instanceof SimpleMetadataValue) {
                    continue;
                }

                if (($metadataValue->getPath()[1] ?? null) !== $propertyUri) {
                    continue;
                }

                $importedValues[] = $metadataValue->getValue();
            }
        }

        return array_values(array_unique($importedValues));
    }
}
