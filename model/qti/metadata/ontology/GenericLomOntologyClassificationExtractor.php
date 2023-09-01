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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use oat\generis\model\OntologyAwareTrait;
use oat\generis\model\OntologyRdf;
use oat\generis\model\OntologyRdfs;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationEntryMetadataValue;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationMetadataValue;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationSourceMetadataValue;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractor;
use taoItems_models_classes_ItemsService;
use taoTests_models_classes_TestsService;

class GenericLomOntologyClassificationExtractor implements MetadataExtractor
{
    use OntologyAwareTrait;

    public static $excludedProperties = [
        OntologyRdf::RDF_TYPE,
        taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT,
        taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL,
        taoTests_models_classes_TestsService::PROPERTY_TEST_TESTMODEL,
        taoTests_models_classes_TestsService::PROPERTY_TEST_CONTENT,
    ];

    /**
     * Extract resource metadata and transform it to ClassificationMetadataValue
     *
     * @param \core_kernel_classes_Resource $resource
     *
     * @return array
     *
     * @throws MetadataExtractionException
     * @throws \oat\tao\model\metadata\exception\writer\MetadataWriterException
     */
    public function extract($resource)
    {
        if (! $resource instanceof \core_kernel_classes_Resource) {
            throw new MetadataExtractionException(
                __('The given target is not an instance of core_kernel_classes_Resource')
            );
        }

        $identifier = \tao_helpers_Uri::getUniqueId($resource->getUri());
        $metadata = [$identifier => []];

        $triples = $resource->getRdfTriples();


        /** @var \core_kernel_classes_Triple $triple */
        foreach ($triples->getIterator() as $triple) {

            /** @var \core_kernel_classes_Resource $property */
            $property = $this->getResource($triple->predicate);
            $value = $triple->object;

            if (
                trim($value) != ''
                && $property->isProperty()
                && !in_array($property->getUri(), self::$excludedProperties)
            ) {
                $metadata[$identifier][] = new ClassificationMetadataValue(
                    new ClassificationSourceMetadataValue($resource->getUri(), $property->getUri()),
                    [new ClassificationEntryMetadataValue($resource->getUri(), $value)]
                );
            }
        }

        if (empty($metadata[$identifier])) {
            return [];
        }

        return $metadata;
    }
}
