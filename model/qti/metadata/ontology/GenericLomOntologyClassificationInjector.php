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
use common_Logger;
use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use Psr\Log\LoggerInterface;

class GenericLomOntologyClassificationInjector implements MetadataInjector
{
    use OntologyAwareTrait;

    /** @var LoggerInterface */
    private $logger;

    public function __construct(LoggerInterface $logger = null)
    {
        $this->logger = ($logger ?? common_Logger::singleton()->getLogger());
    }

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
        $this->debug(
            'Inject target=%s values=%s',
            $target->getUri(),
            var_export($values, true)
        );

        /** @var core_kernel_classes_Class $targetClass */
        $types = $target->getTypes();
        $targetClass = reset($types);
        $classProperties = $targetClass->getProperties(true);

        $propertyURIs = [];
        foreach ($classProperties as $property) {
            $propertyURIs[] = $property->getUri();
        }
        $propertyURIs = array_diff(
            $propertyURIs,
            GenericLomOntologyClassificationExtractor::$excludedProperties
        );

        $this->debug('properties = %s', var_export($propertyURIs, true));

        $newPropertyValues = $this->mapPropertiesToValues($propertyURIs, $values);

        foreach ($newPropertyValues as $langCode => $properties) {
            foreach ($properties as $valuePath => $values) {
                $propertyInstance = $this->getProperty($valuePath);
                foreach ($values as $value) {
                    // Prevent duplicating values when we should not (for example, resource IDs)
                    //
                    $numPreviousValues = $target->getPropertyValuesByLg($propertyInstance, $langCode)->count();

                    if (($numPreviousValues > 0) && $propertyInstance->isMultiple()) {
                        $target->setPropertyValueByLg($propertyInstance, $value, $langCode); // append
                    } else {
                        $target->editPropertyValueByLg($propertyInstance, $value, $langCode);
                    }
                }
            }
        }
    }

    /**
     * Builds a multidimensional array grouping the values by language code and
     * property URI (also known as "valuePath").
     *
     * Properties whose URI is not present in the $propertyURIs parameter are
     * ignored. The format for the array returned is as follows:
     *
     *      [
     *          langCode => [
     *              valuePath1 => [metadataValue1, metadataValue2, ...],
     *              valuePath2 => [metadataValue1, metadataValue2, ...],
     *              ....
     *          ],
     *          langCode => [
     *              valuePath1 => [metadataValue1, metadataValue2, ...],
     *              valuePath2 => [metadataValue1, metadataValue2, ...],
     *              ....
     *          ],
     *          ....
     *      ]
     *
     * @param string[] $propertyURIs
     * @param MetadataValue[] $values
     *
     * @return MetadataValue[][]
     */
    private function mapPropertiesToValues(
        array $propertyURIs,
        array $values
    ): array {
        $newPropertyValues = [];

        foreach ($values as $metadataValues) {
            /** @var MetadataValue $metadataValue */
            foreach ($metadataValues as $metadataValue) {
                $lang = $metadataValue->getLanguage() ?: DEFAULT_LANG;
                $path = $metadataValue->getPath();
                $valuePath = end($path);

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
        if (!$target instanceof core_kernel_classes_Resource) {
            throw new MetadataInjectionException(
                'The given target is not an instance of core_kernel_classes_Resource.'
            );
        }
    }

    private function debug(string $message, ...$replacements): void
    {
        $this->logger->info(__CLASS__ . ': ' . vsprintf($message, $replacements));
    }
}
