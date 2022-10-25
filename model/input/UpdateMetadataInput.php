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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\input;

use core_kernel_classes_Resource;
use JsonSerializable;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class UpdateMetadataInput implements JsonSerializable
{
    public const PROPERTY_URI = 'propertyUri';
    public const RESOURCE_URI = 'resourceUri';
    public const VALUE = 'value';

    public const VALID_PROPERTIES = [
        UpdateMetadataInput::PROPERTY_URI,
        UpdateMetadataInput::RESOURCE_URI,
        UpdateMetadataInput::VALUE,
    ];

    private core_kernel_classes_Resource $resource;
    private SimpleMetadataValue $metadata;

    public function __construct(core_kernel_classes_Resource $resource, SimpleMetadataValue $metadata)
    {
        $this->resource = $resource;
        $this->metadata = $metadata;
    }

    public function getResource(): core_kernel_classes_Resource
    {
        return $this->resource;
    }

    public function getMetadata(): SimpleMetadataValue
    {
        return $this->metadata;
    }

    public function jsonSerialize(): array
    {
        $path = $this->metadata->getPath();

        return [
            self::RESOURCE_URI => $this->resource->getUri(),
            self::PROPERTY_URI => end($path),
            self::VALUE => $this->getMetadata()->getValue(),
        ];
    }
}
