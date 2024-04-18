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

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use core_kernel_classes_Class;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource as Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class MappedMetadataInjector
{
    use OntologyAwareTrait;

    public function inject(array $mappedProperties, array $metadataValues, Resource $resource): void
    {
        /** @var SimpleMetadataValue $metadataValue */
        foreach ($metadataValues as $metadataValue) {
            foreach ($metadataValue->getPath() as $mappedPath) {
                if(isset($mappedProperties[$mappedPath]) && $mappedProperties[$mappedPath] instanceof Property) {
                    /** @var core_kernel_classes_Class $rangeClass */
                    $rangeClass = $mappedProperties[$mappedPath]->getRange();
                    /** @var Resource $nestedResource */
                    foreach ($rangeClass->getNestedResources() as $nestedResource) {
                        if(
                            $nestedResource['isclass'] !== 1
                            && $this->getResource($nestedResource['id'])->getLabel() === $metadataValue->getValue()
                        ) {
                            $resource->setPropertyValue($mappedProperties[$mappedPath], $this->getResource($nestedResource['id']));
                        }
                    }
                }
            }
        }
    }
}
