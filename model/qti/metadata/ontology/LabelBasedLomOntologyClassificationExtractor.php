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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use core_kernel_classes_Resource as Resource;
use core_kernel_classes_Triple as Triple;
use oat\generis\model\OntologyAwareTrait;
use oat\generis\model\OntologyRdf;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationEntryMetadataValue;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationMetadataValue;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationSourceMetadataValue;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractor;
use tao_helpers_Uri;
use taoTests_models_classes_TestsService;
use oat\taoItems\model\TaoItemOntology;

class LabelBasedLomOntologyClassificationExtractor implements MetadataExtractor
{
    use OntologyAwareTrait;

    public const EXCLUDED_PROPERTIES = [
        OntologyRdf::RDF_TYPE,
        TaoItemOntology::PROPERTY_ITEM_CONTENT,
        TaoItemOntology::PROPERTY_ITEM_MODEL,
        taoTests_models_classes_TestsService::PROPERTY_TEST_TESTMODEL,
        taoTests_models_classes_TestsService::PROPERTY_TEST_CONTENT,
    ];

    /**
     * Extract resource metadata and transform it to ClassificationMetadataValue
     *
     * @param Resource $resource
     *
     * @return array
     *
     * @throws MetadataExtractionException
     * @throws \oat\tao\model\metadata\exception\writer\MetadataWriterException
     */
    public function extract($resource): array
    {
        if (!$resource instanceof Resource) {
            throw new MetadataExtractionException(
                __('The given target is not an instance of core_kernel_classes_Resource')
            );
        }

        $resourceUri = $resource->getUri();
        $identifier = tao_helpers_Uri::getUniqueId($resourceUri);
        $metadata = [
            $identifier => []
        ];

        /** @var Triple $triple */
        foreach ($resource->getRdfTriples() as $triple) {
            $property = $this->getProperty($triple->predicate);
            $value = $this->getResourceValue($triple);
            $propertyUri = $property->getUri();

            if (
                trim($value) !== ''
                && $property->isProperty()
                && !in_array($propertyUri, self::EXCLUDED_PROPERTIES)
            ) {
                $metadata[$identifier][] = new ClassificationMetadataValue(
                    new ClassificationSourceMetadataValue($resourceUri, $propertyUri),
                    [
                        new ClassificationEntryMetadataValue($resourceUri, $value)
                    ]
                );
            }
        }

        if (empty($metadata[$identifier])) {
            return [];
        }

        return $metadata;
    }

    private function getResourceValue(Triple $triple): string
    {
        if ($triple->object === null) {
            return '';
        }

        if (
            !empty($triple->object) &&
            $this->getResource($triple->object)->exists() &&
            $this->getResource($triple->object)->getLabel() !== ''
        ) {
            return $this->getResource($triple->object)->getLabel();
        }

        return $triple->object;
    }
}
