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
 * Copyright (c) 2024-2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\importer;

use core_kernel_classes_Class as kernelClass;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource;
use oat\generis\model\GenerisRdf;

class MetaMetadataImportMapper
{
    private const RDF_LIST = 'http://www.tao.lu/Ontologies/TAO.rdf#List';

    private PropertyImportCompatibilityChecker $propertyImportCompatibilityChecker;

    public function __construct(PropertyImportCompatibilityChecker $propertyImportCompatibilityChecker)
    {
        $this->propertyImportCompatibilityChecker = $propertyImportCompatibilityChecker;
    }

    public function mapMetaMetadataToProperties(
        array $metaMetadataProperties,
        kernelClass $itemClass,
        ?kernelClass $testClass = null,
        array $metadataValues = []
    ): array {
        $matchedProperties = [];
        foreach ($metaMetadataProperties as $metaMetadataProperty) {
            if ($match = $this->matchProperty($metaMetadataProperty, $itemClass->getProperties(true), $metadataValues)) {
                $matchedProperties['itemProperties'][$metaMetadataProperty['uri']] = $match;
            }

            if (
                $testClass &&
                $match = $this->matchProperty($metaMetadataProperty, $testClass->getProperties(true), $metadataValues)
            ) {
                $matchedProperties['testProperties'][$metaMetadataProperty['uri']] = $match;
            }
        }
        return $matchedProperties;
    }

    public function mapMetadataToProperties(
        array $metadataProperties,
        kernelClass $itemClass,
        ?kernelClass $testClass = null
    ): array {
        $parsedMetadataProperties = [];
        foreach ($metadataProperties as $metadataProperty) {
            foreach ($metadataProperty as $property) {
                $parsedMetadataProperties[] = [
                    'uri' => $property->getPath()[1],
                ];
            }
        }
        return $this->mapMetaMetadataToProperties($parsedMetadataProperties, $itemClass, $testClass);
    }

    private function matchProperty(array &$metaMetadataProperty, array $classProperties, array $metadataValues = []): ?Property
    {
        /** @var Property $itemClassProperty */
        foreach ($classProperties as $classProperty) {
            if (
                $classProperty->getUri() === $metaMetadataProperty['uri']
            ) {
                return $classProperty;
            }
            if (
                $classProperty->getLabel() === $metaMetadataProperty['label']
                || $classProperty->getAlias() === $metaMetadataProperty['alias']
            ) {
                if ($this->isSynced($classProperty, $metaMetadataProperty, $metadataValues)) {
                    return $classProperty;
                }
            }
        }
        return null;
    }

    private function isSynced(Property $classProperty, array &$metaMetadataProperty, array $metadataValues = []): bool
    {
        $rangeClass = $classProperty->getRange();
        $listClass = new kernelClass(self::RDF_LIST);
        if ($rangeClass && !$rangeClass->isSubClassOf($listClass)) {
            return true;
        }
        $multiple = $classProperty->getOnePropertyValue(new Property(GenerisRdf::PROPERTY_MULTIPLE));
        $widget = $classProperty->getWidget();
        $metaMetadataProperty['widget_result'] =
            $widget && $widget->getUri() === $metaMetadataProperty['widget'];

        if (
            !($multiple instanceof core_kernel_classes_Resource)
            || $multiple->getUri() !== $metaMetadataProperty['multiple']
            || !$widget
            || $widget->getUri() !== $metaMetadataProperty['widget']
        ) {
            return false;
        }

        return $this->propertyImportCompatibilityChecker->hasMatchingImportedListValues(
            $classProperty,
            $metaMetadataProperty['uri'],
            $metadataValues
        );
    }
}
