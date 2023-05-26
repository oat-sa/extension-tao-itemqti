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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Metadata;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use oat\generis\model\GenerisRdf;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\tao\helpers\form\ElementMapFactory;
use oat\taoQtiItem\model\import\ParsedMetadatum;
use oat\taoQtiItem\model\import\Validator\AggregatedValidationException;
use oat\taoQtiItem\model\import\Validator\ErrorValidationException;

class MetadataResolver extends ConfigurableService
{
    use OntologyAwareTrait;

    private const MAX_CACHE_SIZE = 1000;

    /** @var array */
    private $cache = [];

    /**
     * @param ParsedMetadatum[] $metadata
     *
     * @return ParsedMetadatum[]
     *
     * @throws AggregatedValidationException
     */
    public function resolve(core_kernel_classes_Class $class, array $metadata): array
    {
        $result = [];
        $aliasProperty = $this->getProperty(GenerisRdf::PROPERTY_ALIAS);
        $classProperties = $class->getProperties(true);
        $classUri = $class->getUri();
        $metaDataWithAlias = $this->getMetadataWithAlias($metadata);
        $errors = [];

        if (empty($metaDataWithAlias)) {
            return $metadata;
        }

        foreach ($classProperties as $property) {
            $aliasName = (string)$property->getOnePropertyValue($aliasProperty);

            if (empty($aliasName)) {
                continue;
            }

            foreach ($metaDataWithAlias as $metaDataItem) {
                if ($metaDataItem->getAlias() === $aliasName) {
                    $propertyUri = $this->getPropertyUri($property, $classUri, $aliasName);
                    $metaDataItem->setPropertyUri($propertyUri);
                    $errors = $this->validate($property, $aliasName, $metaDataItem->getValue(), $errors);
                    $result[$propertyUri] = $metaDataItem->getValue();
                    break;
                }
            }
        }

        if (empty($errors)) {
            return $result;
        }

        $messages = [];

        foreach ($errors as $alias => $message) {
            $messages[] = '"' . $alias . '" ' . $message;
        }

        //@TODO In the future, create one separate error for each metadata. Requires new translations
        throw new AggregatedValidationException(
            [
                new ErrorValidationException(
                    'Metadata are not correct: %s',
                    [
                        implode('. ', $messages)
                    ]
                )
            ],
            []
        );
    }

    private function validate(
        core_kernel_classes_Property $property,
        string $alias,
        string $value,
        array $errors
    ): array {
        $element = $this->getElementMapFactory()->create($property);
        $element->setValue($value);

        if (!$element->validate()) {
            $errors[$alias] = $element->getError();
        }

        return $errors;
    }

    private function isEmptyAlias(ParsedMetadatum $metadata): bool
    {
        return empty($metadata->getPropertyUri());
    }

    /**
     * @param ParsedMetadatum[] $metadata
     *
     * @return ParsedMetadatum[]
     */
    private function getMetadataWithAlias(array $metadata): array
    {
        return array_filter($metadata, [$this, 'isEmptyAlias']);
    }

    private function add(string $classUri, string $aliasName, string $aliasUri): void
    {
        $this->cache[$classUri . $aliasName] = $aliasUri;

        if (count($this->cache) > self::MAX_CACHE_SIZE) {
            array_shift($this->cache);
        }
    }

    private function getCached(string $classUri, string $aliasName): ?string
    {
        return $this->cache[$classUri . $aliasName] ?? null;
    }

    private function getPropertyUri(
        core_kernel_classes_Property $property,
        string $classUri,
        string $aliasName
    ): ?string {
        $cachedPropertyUri = $this->getCached($classUri, $aliasName);

        if (null !== $cachedPropertyUri) {
            return $cachedPropertyUri;
        }

        $this->add($classUri, $aliasName, $property->getUri());

        return $property->getUri();
    }

    private function getElementMapFactory(): ElementMapFactory
    {
        return $this->getServiceManager()->get(ElementMapFactory::class);
    }
}
