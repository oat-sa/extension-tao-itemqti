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

namespace oat\taoQtiItem\test\unit\model\import;

use core_kernel_classes_Class as ClassResource;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource as Resource;
use InvalidArgumentException;
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\import\ChecksumGenerator;
use PHPUnit\Framework\TestCase;

class ChecksumGeneratorTest extends TestCase
{
    public function setUp(): void
    {
        $this->propertyMock = $this->createMock(Property::class);
        $this->listServiceMock = $this->createMock(ListService::class);
        $this->checksumGenerator = new ChecksumGenerator($this->listServiceMock);
    }

    public function testGetRangeChecksum(): void
    {
        $classMock = $this->createMock(ClassResource::class);
        $resourceMock = $this->createMock(Resource::class);

        $classMock->method('getNestedResources')->willReturn(
            [
                [
                    'id' => 'id',
                    'isclass' => 1,
                ],
                [
                    'id' => 'non_class_id',
                    'isclass' => 0,
                ],
                [
                    'id' => 'non_class_id_2',
                    'isclass' => 0,
                ]
            ]
        );

        $resourceMock->expects($this->exactly(2))
            ->method('getLabel')
            ->willReturn('label');

        $this->propertyMock->method('getRange')->willReturn($classMock);

        $this->listServiceMock->method('getListElements')->willReturn([$resourceMock, $resourceMock]);

        $this->assertEquals(
            'c315a4bd4fa0f4479b1ea4b5998aa548eed3b670',
            $this->checksumGenerator->getRangeChecksum($this->propertyMock)
        );
    }

    public function testThrowExceptionOnPropertyWithoutRange(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage(
            'Property propertyUri does not have range set. Only properties with range can have checksum'
        );
        $this->propertyMock->method('getRange')->willReturn(null);
        $this->propertyMock->method('getUri')->willReturn('propertyUri');

        $this->checksumGenerator->getRangeChecksum($this->propertyMock);
    }
}
