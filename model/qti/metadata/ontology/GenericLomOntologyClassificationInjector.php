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
 * Copyright (c) 2017-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use oat\generis\model\OntologyAwareTrait;
use oat\taoQtiItem\model\qti\metadata\MetadataInjectionException;
use oat\taoQtiItem\model\qti\metadata\MetadataInjector;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;

class GenericLomOntologyClassificationInjector implements MetadataInjector
{
    use OntologyAwareTrait;

    /**
     * Inject dynamically a metadata to an item property
     *
     * @param mixed $target
     * @param array $values
     * @throws MetadataInjectionException
     */
    public function inject($target, array $values)
    {
        $this->assertIsResource($target);

        /** @var \core_kernel_classes_Class $targetClass */
        $types = $target->getTypes();
        $targetClass = reset($types);
        $classProperties = $targetClass->getProperties(true);

        $properties = [];
        foreach ($classProperties as $property) {
            $properties[] = $property->getUri();
        }
        $properties = array_diff($properties, GenericLomOntologyClassificationExtractor::$excludedProperties);

        $newValues = $this->groupValuesByLgAndProperty($properties, $values);

        foreach ($newValues as $langCode => $perLangProperties) {
            foreach ($perLangProperties as $valuePath => $values) {
                $property = $this->getProperty($valuePath);
                foreach ($values as $value) {
                    $this->savePropertyValue($target, $property, $value, $langCode);
                }
            }
        }
    }

    private function savePropertyValue(
        \core_kernel_classes_Resource $target,
        \core_kernel_classes_Property $property,
        $value,
        $langCode
    ): void {
        $previousValues = $target->getPropertyValuesByLg($property, $langCode);

        if ($previousValues->count() > 0 && $property->isMultiple()) {
            $target->setPropertyValueByLg($property, $value, $langCode);

            return;
        }

        $target->editPropertyValueByLg($property, $value, $langCode);
    }

    private function groupValuesByLgAndProperty(
        array $propertyURIs,
        array $values
    ): array {
        $newPropertyValues = [];

        foreach ($values as $metadataValues) {
            /** @var MetadataValue $metadataValue */
            foreach ($metadataValues as $metadataValue) {
                $lang = $metadataValue->getLanguage() ?: DEFAULT_LANG;
                $path = $metadataValue->getPath();
                $valuePath = trim((string)end($path));

                if (in_array($valuePath, $propertyURIs)) {
                    if (!isset($newPropertyValues[$lang])) {
                        $newPropertyValues[$lang] = [];
                    }

                    if (!isset($newPropertyValues[$lang][$valuePath])) {
                        $newPropertyValues[$lang][$valuePath] = [];
                    }

                    $newPropertyValues[$lang][$valuePath][] = $metadataValue->getValue();
                }
            }
        }

        return $newPropertyValues;
    }

    /**
     * @throws MetadataInjectionException
     */
    private function assertIsResource($target): void
    {
        if (!$target instanceof \core_kernel_classes_Resource) {
            throw new MetadataInjectionException(
                'The given target is not an instance of core_kernel_classes_Resource.'
            );
        }
    }
}
