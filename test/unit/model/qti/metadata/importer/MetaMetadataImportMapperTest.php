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

namespace oat\taoQtiItem\test\unit\model\qti\metadata\importer;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\taoQtiItem\model\qti\metadata\importer\MetaMetadataImportMapper;
use oat\taoQtiItem\model\qti\metadata\importer\PropertyDoesNotExistException;
use oat\taoQtiTest\models\classes\metadata\ChecksumGenerator;
use PHPUnit\Framework\TestCase;

class MetaMetadataImportMapperTest extends TestCase
{
    public function setUp(): void
    {
        $this->checksumGeneratorMock = $this->createMock(ChecksumGenerator::class);
        $this->subject = new MetaMetadataImportMapper($this->checksumGeneratorMock);
    }

    public function testMapMetaMetadataToProperties(): void
    {
        $metaMetadataProperties = [
            [
                'uri' => 'http://example.com/uri1',
                'label' => 'label1',
                'alias' => 'alias1',
                'checksum' => 'qwerty1234',
                'multiple' => 'http://resource.uri/false'
            ],
            [
                'uri' => 'http://example.com/uri2',
                'label' => 'label2',
                'alias' => 'alias2',
                'checksum' => '4321qwerty',
                'multiple' => 'http://resource.uri/false'
            ],
            [
                'uri' => 'http://example.com/uri3',
                'label' => 'label3',
                'alias' => 'alias3',
                'checksum' => '4321qwerty',
                'multiple' => 'http://resource.uri/false'
            ],
        ];

        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $testClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);

        $itemClass->method('getProperties')
            ->willReturn([$propertyMock, $propertyMock, $propertyMock]);
        $testClass->method('getProperties')
            ->willReturn([$propertyMock, $propertyMock, $propertyMock]);
        $propertyMock->method('getUri')
            ->willReturn('http://example.com/uri1', 'http://some-other-uri', 'http://some-other-uri', 'http://some-other-uri');
        $propertyMock->method('getLabel')
            ->willReturn('label2', 'some-other-label', 'some-other-other-label');
        $propertyMock->method('getAlias')
            ->willReturn('alias2', 'alias3', 'some-other-other-alias');
        $propertyMock->method('getOnePropertyValue')
            ->willReturn($resourceMock);
        $this->checksumGeneratorMock->method('getRangeChecksum')
            ->willReturn('4321qwerty');

        $resourceMock->method('getUri')
            ->willReturn('http://resource.uri/false', 'http://resource.uri/false');


        $result = $this->subject->mapMetaMetadataToProperties($metaMetadataProperties, $itemClass, $testClass);
        self::assertNotNull($result);
        self::assertEquals(3, count($result['itemProperties']));
    }

    public function testMapMetaMetadataToPropertiesThrowErrorWhenCannotMapProperty(): void
    {
        $this->expectException(PropertyDoesNotExistException::class);
        $metaMetadataProperties = [
            [
                'uri' => 'http://example.com/uri1',
                'label' => 'label1',
                'alias' => 'alias1',
                'checksum' => 'qwerty1234',
                'multiple' => 'http://resource.uri/false'
            ]
        ];

        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $testClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);

        $itemClass->method('getProperties')
            ->willReturn([$propertyMock, $propertyMock, $propertyMock]);
        $testClass->method('getProperties')
            ->willReturn([$propertyMock, $propertyMock, $propertyMock]);
        $result = $this->subject->mapMetaMetadataToProperties($metaMetadataProperties, $itemClass, $testClass);
        self::assertNotNull($result);
    }
}
