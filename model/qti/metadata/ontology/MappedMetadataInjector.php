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

use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource as Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use tao_helpers_form_elements_Readonly as ReadOnlyWidget;

class MappedMetadataInjector
{
    use OntologyAwareTrait;

    private ListService $listService;

    public function __construct(ListService $listService)
    {
        $this->listService = $listService;
    }

    public function inject(array $mappedProperties, array $metadataValues, Resource $resource): void
    {
        /** @var SimpleMetadataValue $metadataValue */
        foreach ($metadataValues as $metadataValue) {
            foreach ($metadataValue->getPath() as $mappedPath) {
                if ($this->isInjectableProperty($mappedProperties, $mappedPath) === false) {
                    continue;
                }
                $currentValue = $resource->getPropertyValues($mappedProperties[$mappedPath]);
                if (is_array($currentValue) && count($currentValue) > 0) {
                    $currentValue = reset($currentValue);
                }
                if ($currentValue && $currentValue === $metadataValue->getValue()) {
                    continue;
                }
                if (
                    $mappedProperties[$mappedPath]->getWidget()
                    && $mappedProperties[$mappedPath]->getWidget()->getUri() === ReadOnlyWidget::WIDGET_ID
                ) {
                    continue;
                }
                if (
                    $mappedProperties[$mappedPath]->getRange()
                    && $mappedProperties[$mappedPath]->getRange()->getUri() === RDFS_LITERAL
                ) {
                    // If resource already has property value, remove it.
                    if ($resource->getPropertyValuesCollection($mappedProperties[$mappedPath])->count() > 0) {
                        $propertyValue = $resource->getUniquePropertyValue($mappedProperties[$mappedPath]);
                        $resource->removePropertyValue($mappedProperties[$mappedPath], $propertyValue);
                    }

                    $resource->setPropertyValue($mappedProperties[$mappedPath], $metadataValue->getValue());
                    break;
                }

                if ($mappedProperties[$mappedPath]->getRange() !== null) {
                    $this->setListValue($mappedProperties[$mappedPath], $resource, $metadataValue);
                    break;
                }

                if ($mappedProperties[$mappedPath]->getRange() === null) {
                    $resource->setPropertyValue(
                        $mappedProperties[$mappedPath],
                        $this->getResource($metadataValue->getValue())
                    );
                    break;
                }
            }
        }
    }

    private function isInjectableProperty(array $mappedProperties, string $mappedPath): bool
    {
        return isset($mappedProperties[$mappedPath]) && $mappedProperties[$mappedPath] instanceof Property;
    }

    private function setListValue(Property $property, Resource $resource, SimpleMetadataValue $metadataValue): void
    {
        $list = $this->listService->getListElements($property->getRange());
        foreach ($list as $listElement) {
            if (
                $listElement->getLabel() === $metadataValue->getValue()
                || $listElement->getOriginalUri() === $metadataValue->getValue()
            ) {
                $resource->setPropertyValue(
                    $property,
                    $this->getResource($listElement->getUri())
                );

                if ($property->isMultiple() === false) {
                    break;
                }
            }
        }
    }
}
