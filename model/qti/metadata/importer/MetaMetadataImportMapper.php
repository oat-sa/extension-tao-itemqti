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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\importer;

use core_kernel_classes_Class as kernelClass;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource;
use InvalidArgumentException;
use oat\generis\model\GenerisRdf;
use oat\taoQtiItem\model\import\ChecksumGenerator;

class MetaMetadataImportMapper
{
    private ChecksumGenerator $checksumGenerator;

    public function __construct(ChecksumGenerator $checksumGenerator)
    {
        $this->checksumGenerator = $checksumGenerator;
    }

    public function mapMetaMetadataToProperties(
        array $metaMetadataProperties,
        kernelClass $itemClass,
        kernelClass $testClass = null
    ): array {
        $matchedProperties = [];
        foreach ($metaMetadataProperties as $metaMetadataProperty) {
            if ($match = $this->matchProperty($metaMetadataProperty, $itemClass->getProperties(true))) {
                $matchedProperties['itemProperties'][$metaMetadataProperty['uri']] = $match;
            }

            if (
                $testClass &&
                $match = $this->matchProperty($metaMetadataProperty, $testClass->getProperties(true))
            ) {
                $matchedProperties['testProperties'][$metaMetadataProperty['uri']] = $match;
            }
        }
        return $matchedProperties;
    }

    public function mapMetadataToProperties(
        array $metadataProperties,
        kernelClass $itemClass,
        kernelClass $testClass = null
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

    private function matchProperty(array &$metaMetadataProperty, array $classProperties): ?Property
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
                if ($this->isSynced($classProperty, $metaMetadataProperty)) {
                    return $classProperty;
                }
            }
        }
        return null;
    }

    private function isSynced(Property $classProperty, array &$metaMetadataProperty): bool
    {
        $multiple = $classProperty->getOnePropertyValue(new Property(GenerisRdf::PROPERTY_MULTIPLE));
        try {
            $checksum = $this->checksumGenerator->getRangeChecksum($classProperty);
        } catch (InvalidArgumentException $e) {
            return false;
        }
        $metaMetadataProperty['checksum_result'] = $checksum === $metaMetadataProperty['checksum'];
        $metaMetadataProperty['widget_result'] =
            $classProperty->getWidget() && $classProperty->getWidget()->getUri() === $metaMetadataProperty['widget'];

        return $multiple instanceof core_kernel_classes_Resource
            && $multiple->getUri() === $metaMetadataProperty['multiple']
            && $checksum === $metaMetadataProperty['checksum']
            && $classProperty->getWidget() && $classProperty->getWidget()->getUri() === $metaMetadataProperty['widget'];
    }
}
