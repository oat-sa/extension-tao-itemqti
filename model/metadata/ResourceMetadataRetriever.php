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

namespace oat\taoQtiItem\model\metadata;

use core_kernel_classes_Resource as Resource;
use core_kernel_classes_Triple as Triple;
use oat\generis\model\data\Ontology;
use oat\generis\model\OntologyRdf;
use oat\generis\model\OntologyRdfs;
use oat\taoItems\model\TaoItemOntology;

class ResourceMetadataRetriever
{
    private const IGNORED_PROPERTIES = [
        TaoItemOntology::PROPERTY_ITEM_CONTENT,
        TaoItemOntology::PROPERTY_ITEM_MODEL,
        OntologyRdf::RDF_TYPE,
        OntologyRdfs::RDFS_LABEL
    ];
    private Ontology $ontology;

    public function __construct(Ontology $ontology)
    {
        $this->ontology = $ontology;
    }

    /**
     * Will retrieve properties and their values for a given resource
     */
    public function getProperties(Resource $resource): array
    {
        $properties = [];

        /** @var Triple $triple */
        foreach ($resource->getRdfTriples() as $triple) {
            if (in_array($triple->predicate, self::IGNORED_PROPERTIES)) {
                continue;
            }

            $property = $this->ontology->getProperty($triple->predicate);

            if ($property->isProperty() !== true) {
                continue;
            }

            $properties[$property->getLabel()] = $this->getPropertyValues($resource->getPropertyValues($property));
        }

        return $properties;
    }

    private function getPropertyValues(array $propertyValues): array
    {
        $values = [];
        foreach ($propertyValues as $propertyValue) {
            $values[] = $this->ontology->getResource($propertyValue)->exists()
                ? $this->ontology->getResource($propertyValue)->getLabel()
                : $propertyValue;
        }
        return $values;
    }
}
