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

namespace oat\taoQtiItem\model\qti\metadata\imsManifest;

use oat\generis\model\GenerisRdf;
use oat\taoQtiTest\models\classes\metadata\ChecksumGenerator;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Class as RdfClass;

class MetaMetadataValidator
{
    private ChecksumGenerator $checksumGenerator;

    public function __construct(ChecksumGenerator $checksumGenerator)
    {
        $this->checksumGenerator = $checksumGenerator;
    }

    public function validateClass(RdfClass $itemClass, array $metaMedataValues): void
    {
        if (empty($metaMedataValues)) {
            return;
        }

        $props = $itemClass->getProperties();

        if (empty($props)) {
            throw new MetaMetadataException('No properties found for class where import requires it.');
        }
        foreach ($props as $prop) {
            $label = $prop->getLabel();
            $foundMetadata = array_filter($metaMedataValues, function ($metadataItem) use ($label) {
                return $metadataItem['label'] === $label;
            });
            if (empty($foundMetadata)) {
                throw new MetaMetadataException(sprintf('No metadata found for class property "%s"', $label));
            }
            if (count($foundMetadata) > 1) {
                throw new MetaMetadataException(
                    sprintf('Duplicate metadata name found for class property "%s"', $label)
                );
            }
            $foundMetadata = reset($foundMetadata);
            if (strlen($foundMetadata['multiple']) > 0) {
                $multiple = $prop->getOnePropertyValue(new Property(GenerisRdf::PROPERTY_MULTIPLE));
                if ($multiple instanceof Property && $multiple->getUri() !== $foundMetadata['multiple']) {
                    throw new MetaMetadataException(
                        sprintf('Multiple property mismatch for class property "%s"', $label)
                    );
                }
            }

            if (
                strlen($foundMetadata['checksum']) > 0 &&
                $this->checksumGenerator->getRangeChecksum($prop) !== $foundMetadata['checksum']
            ) {
                throw new MetaMetadataException(sprintf('Checksum mismatch for class property "%s"', $label));
            }
        }
    }
}
