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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use oat\taoQtiItem\model\qti\metadata\extractors\LomMetadataExtractor;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractor;
use core_kernel_classes_Resource;

class OntologyMetadataExtractor extends OntologyMetadataRules implements MetadataExtractor
{
    public function extract($resource)
    {
        if (! $resource instanceof core_kernel_classes_Resource) {
            throw new MetadataExtractionException(
                __('The given target is not an instance of core_kernel_classes_Resource')
            );
        }

        $metadataValues = [];

        /** @var LomMetadataExtractor $rule */
        foreach ($this->rules as $rules) {
            foreach ($rules as $rule) {
                $values = $rule->extract($resource);

                if (empty($values)) {
                    continue;
                }
                $identifier = \tao_helpers_Uri::getUniqueId($resource->getUri());
                $path = $this->serializePath($rule->getPath());
                if (! isset($metadataValues[$path])) {
                    $metadataValues[$identifier] = $values;
                } else {
                    $metadataValues[$identifier] = array_merge($metadataValues[$identifier], $values);
                }
            }
        }

        return $metadataValues;
    }
}
