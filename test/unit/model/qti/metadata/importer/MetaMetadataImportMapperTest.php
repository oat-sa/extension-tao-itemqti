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
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\qti\metadata\importer\MetaMetadataImportMapper;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class MetaMetadataImportMapperTest extends TestCase
{
    private ListService|MockObject $listServiceMock;
    private MetaMetadataImportMapper $subject;

    public function setUp(): void
    {
        $this->listServiceMock = $this->createMock(ListService::class);
        $this->subject = new MetaMetadataImportMapper($this->listServiceMock);
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

        $result = $this->subject->mapMetadataToProperties($metadataProperties, $itemClass);

        $this->assertArrayHasKey('itemProperties', $result);
        $this->assertInstanceOf(
            core_kernel_classes_Property::class,
            $result['itemProperties']['http://example.com/uri1']
        );
    }

    public function testRejectsListPropertyWithoutRange(): void
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
        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);

        $itemClass->method('getProperties')->willReturn([$propertyMock]);
        $propertyMock->method('getUri')->willReturn('http://example.com/destination-uri');
        $propertyMock->method('getLabel')->willReturn('label1');
        $propertyMock->method('getAlias')->willReturn('alias1');
        $propertyMock->method('getRange')->willReturn(null);
        $propertyMock->method('getOnePropertyValue')->willReturn($resourceMock);
        $propertyMock->method('getWidget')->willReturn($propertyMock);
        $resourceMock->method('getUri')->willReturn('http://resource.uri/false');

        $result = $this->subject->mapMetaMetadataToProperties($metaMetadataProperties, $itemClass);

        $this->assertEmpty($result);
    }

    public function testMatchesListPropertyWhenImportedValueExistsInDestinationRange(): void
    {
        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createSyncableListPropertyMock('destination-label', 'destination-alias');

        $itemClass->method('getProperties')->willReturn([$propertyMock]);
        $this->expectRangeLookup([$propertyMock], ['allowed-value']);

        $result = $this->subject->mapMetaMetadataToProperties(
            [$this->createMetaMetadataProperty()],
            $itemClass,
            null,
            [
                'item-1' => [
                    new SimpleMetadataValue('item-1', ['metadata', 'http://example.com/source-uri'], 'allowed-value'),
                ],
            ]
        );

        $this->assertSame($propertyMock, $result['itemProperties']['http://example.com/source-uri']);
    }

    public function testMatchesListPropertyWhenChecksumDiffersButImportedValueExistsInDestinationRange(): void
    {
        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createSyncableListPropertyMock('destination-label', 'destination-alias');

        $itemClass->method('getProperties')->willReturn([$propertyMock]);
        $this->expectRangeLookup([$propertyMock], ['allowed-value']);

        $result = $this->subject->mapMetaMetadataToProperties(
            [$this->createMetaMetadataProperty()],
            $itemClass,
            null,
            [
                'item-1' => [
                    new SimpleMetadataValue('item-1', ['metadata', 'http://example.com/source-uri'], 'allowed-value'),
                ],
            ]
        );

        $this->assertSame($propertyMock, $result['itemProperties']['http://example.com/source-uri']);
    }

    public function testRejectsListPropertyWhenImportedValueDoesNotExistInDestinationRange(): void
    {
        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createSyncableListPropertyMock('destination-label', 'destination-alias');

        $itemClass->method('getProperties')->willReturn([$propertyMock]);
        $this->expectRangeLookup([$propertyMock], []);

        $result = $this->subject->mapMetaMetadataToProperties(
            [$this->createMetaMetadataProperty()],
            $itemClass,
            null,
            [
                'item-1' => [
                    new SimpleMetadataValue('item-1', ['metadata', 'http://example.com/source-uri'], 'missing-value'),
                ],
            ]
        );

        $this->assertEmpty($result);
    }

    public function testMatchesPropertyByUriWithoutSyncCheck(): void
    {
        $itemClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);

        $itemClass->method('getProperties')->willReturn([$propertyMock]);
        $propertyMock
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('http://example.com/source-uri');
        $propertyMock->expects($this->never())->method('getLabel');
        $propertyMock->expects($this->never())->method('getAlias');
        $this->listServiceMock->expects($this->never())->method('getListElements');

        $result = $this->subject->mapMetaMetadataToProperties(
            [$this->createMetaMetadataProperty()],
            $itemClass
        );

        $this->assertSame($propertyMock, $result['itemProperties']['http://example.com/source-uri']);
    }

    private function createMetaMetadataProperty(): array
    {
        return [
            'uri' => 'http://example.com/source-uri',
            'label' => 'destination-label',
            'alias' => 'destination-alias',
            'checksum' => 'source-checksum',
            'multiple' => 'http://resource.uri/false',
            'widget' => 'http://widget.uri',
        ];
    }

    private function createSyncableListPropertyMock(string $label, string $alias): Property|MockObject
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);
        $multipleMock = $this->createMock(core_kernel_classes_Resource::class);
        $widgetMock = $this->createMock(core_kernel_classes_Property::class);

        $propertyMock->method('getUri')->willReturn('http://example.com/destination-uri');
        $propertyMock->method('getLabel')->willReturn($label);
        $propertyMock->method('getAlias')->willReturn($alias);
        $propertyMock->method('getRange')->willReturn($rangeMock);
        $propertyMock->method('getOnePropertyValue')->willReturn($multipleMock);
        $propertyMock->method('getWidget')->willReturn($widgetMock);

        $rangeMock->method('isSubClassOf')->willReturn(true);
        $multipleMock->method('getUri')->willReturn('http://resource.uri/false');
        $widgetMock->method('getUri')->willReturn('http://widget.uri');

        return $propertyMock;
    }

    private function expectRangeLookup(array $properties, array $matchingValues): void
    {
        $rangeLookup = [];

        foreach ($properties as $property) {
            $range = $property->getRange();
            if ($range instanceof core_kernel_classes_Class) {
                $rangeLookup[spl_object_hash($range)] = $this->buildListEntries($matchingValues);
            }
        }

        $this->listServiceMock->method('getListElements')
            ->willReturnCallback(
                static fn (core_kernel_classes_Class $range): array => $rangeLookup[spl_object_hash($range)] ?? []
            );
    }

    private function buildListEntries(array $matchingValues): array
    {
        $entries = [];

        foreach ($matchingValues as $value) {
            $entry = $this->getMockBuilder(\stdClass::class)
                ->addMethods(['getLabel', 'getOriginalUri'])
                ->getMock();
            $entry->method('getLabel')->willReturn($value);
            $entry->method('getOriginalUri')->willReturn($value);
            $entries[] = $entry;
        }

        return $entries;
    }
}
