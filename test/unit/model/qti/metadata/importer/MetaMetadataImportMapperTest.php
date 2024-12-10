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
use InvalidArgumentException;
use oat\taoQtiItem\model\import\ChecksumGenerator;
use oat\taoQtiItem\model\qti\metadata\importer\MetaMetadataImportMapper;
use PHPUnit\Framework\TestCase;

class MetaMetadataImportMapperTest extends TestCase
{
    private ChecksumGenerator $checksumGeneratorMock;
    private MetaMetadataImportMapper $subject;

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
                'multiple' => 'http://resource.uri/false',
                'widget' => 'http://widget.uri'
            ],
            [
                'uri' => 'http://example.com/uri2',
                'label' => 'label2',
                'alias' => 'alias2',
                'checksum' => '4321qwerty',
                'multiple' => 'http://resource.uri/false',
                'widget' => 'http://widget.uri'
            ],
            [
                'uri' => 'http://example.com/uri3',
                'label' => 'label3',
                'alias' => 'alias3',
                'checksum' => '4321qwerty',
                'multiple' => 'http://resource.uri/false',
                'widget' => 'http://widget.uri'
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
            ->willReturn(
                'http://example.com/uri1',
                'http://widget.uri',
                'http://some-other-uri',
                'http://widget.uri',
                'http://some-other-uri',
                'http://widget.uri',
                'http://some-other-uri',
                'http://widget.uri',
                'http://example.com/uri1',
                'http://widget.uri',
                'http://some-other-uri',
                'http://widget.uri',
                'http://some-other-uri',
                'http://widget.uri',
                'http://some-other-uri',
                'http://widget.uri',
            );
        $propertyMock->method('getLabel')
            ->willReturn('label2', 'some-other-label', 'some-other-other-label');
        $propertyMock->method('getAlias')
            ->willReturn('alias2', 'alias3', 'some-other-other-alias');
        $propertyMock->method('getOnePropertyValue')
            ->willReturn($resourceMock);
        $propertyMock->method('getWidget')
            ->willReturn($propertyMock);
        $this->checksumGeneratorMock->method('getRangeChecksum')
            ->willReturn('4321qwerty');

        $resourceMock->method('getUri')
            ->willReturn('http://resource.uri/false', 'http://resource.uri/false');


        $result = $this->subject->mapMetaMetadataToProperties($metaMetadataProperties, $itemClass, $testClass);
        self::assertNotNull($result);
        self::assertEquals(1, count($result['itemProperties']));
    }

    public function testMapMetadataToProperties(): void
    {
        $metadataProperty = $this->getMockBuilder(\stdClass::class)
            ->addMethods(['getPath'])
            ->getMock();
        $metadataProperty->method('getPath')->willReturn(['somePath', 'http://example.com/uri1']);

        $metadataProperties = [[$metadataProperty]];

        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);

        $itemClass->method('getProperties')->willReturn([$propertyMock]);
        $propertyMock->method('getUri')->willReturn('http://example.com/uri1');
        $propertyMock->method('getOnePropertyValue')->willReturn($resourceMock);
        $propertyMock->method('getWidget')->willReturn($propertyMock);

        $resourceMock->method('getUri')->willReturn('http://resource.uri/false');

        $this->checksumGeneratorMock->method('getRangeChecksum')->willReturn('qwerty1234');

        $result = $this->subject->mapMetadataToProperties($metadataProperties, $itemClass);

        $this->assertArrayHasKey('itemProperties', $result);
        $this->assertInstanceOf(
            core_kernel_classes_Property::class,
            $result['itemProperties']['http://example.com/uri1']
        );
    }

    public function testHandlesInvalidArgumentExceptionInIsSynced(): void
    {
        $metaMetadataProperties = [
            [
                'uri' => 'http://example.com/uri1',
                'label' => 'label1',
                'alias' => 'alias1',
                'checksum' => 'qwerty1234',
                'multiple' => 'http://resource.uri/false',
                'widget' => 'http://widget.uri'
            ]
        ];

        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);

        $itemClass->method('getProperties')->willReturn([$propertyMock]);
        $propertyMock->method('getLabel')->willReturn('label1');

        $this->checksumGeneratorMock->method('getRangeChecksum')
            ->willThrowException(new InvalidArgumentException());

        $result = $this->subject->mapMetaMetadataToProperties($metaMetadataProperties, $itemClass);

        $this->assertEmpty($result);
    }
}
