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

namespace oat\taoQtiItem\model\qti\metadata\extractors\ontology;

use oat\generis\model\OntologyAwareTrait;
use oat\taoQtiItem\model\qti\metadata\extractors\LomMetadataExtractor;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class LiteralPropertyExtractor extends LomMetadataExtractor
{
    use OntologyAwareTrait;

    protected $path;
    protected $property;

    public function __construct(array $path, $property)
    {
        if (count($path) === 0) {
            throw new \InvalidArgumentException(__('The path argument for extractor must be a non-empty array.'));
        }
        $this->path     = $path;
        $this->property = is_string($property) ? $this->getProperty($property) : $property;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function extract($resource)
    {
        if (! $resource instanceof \core_kernel_classes_Resource) {
            throw new MetadataExtractionException(
                __('The given target is not an instance of core_kernel_classes_Resource')
            );
        }

        $value = $resource->getOnePropertyValue($this->property)->literal;
        if (is_null($value)) {
            return [];
        }

        return [
            new SimpleMetadataValue($resource->getUri(), $this->path, $value)
        ];
    }
}
