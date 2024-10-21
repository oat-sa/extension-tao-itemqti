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

namespace oat\taoQtiItem\model\import;

use core_kernel_classes_Property as Property;
use InvalidArgumentException;
use oat\taoBackOffice\model\lists\ListService;

class ChecksumGenerator
{
    private ListService $listService;

    public function __construct(ListService $listService)
    {
        $this->listService = $listService;
    }

    public function getRangeChecksum(Property $property): string
    {
        if ($property->getRange() === null) {
            throw new InvalidArgumentException(
                sprintf(
                    'Property %s does not have range set. Only properties with range can have checksum',
                    $property->getUri()
                )
            );
        }

        $labels = [];
        foreach ($this->listService->getListElements($property->getRange()) as $listEntry) {
            $labels[] = strtolower($listEntry->getLabel());
        }
        asort($labels);
        $checksum = implode('', $labels);

        return sha1(trim($checksum));
    }
}
