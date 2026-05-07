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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\metadata\importer;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\qti\metadata\importer\PropertyImportCompatibilityChecker;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class PropertyImportCompatibilityCheckerTest extends TestCase
{
    private ListService|MockObject $listServiceMock;
    private PropertyImportCompatibilityChecker $subject;

    protected function setUp(): void
    {
        $this->listServiceMock = $this->createMock(ListService::class);
        $this->subject = new PropertyImportCompatibilityChecker($this->listServiceMock);
    }

    public function testHasMatchingImportedListValuesReturnsTrueWhenNoMetadataValuesProvided(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $this->listServiceMock->expects($this->never())->method('getListElements');

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            []
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesReturnsTrueWhenNoMatchingPropertyUri(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $this->listServiceMock->expects($this->never())->method('getListElements');
        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/different-uri'],
                    'value1'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesReturnsFalseWhenPropertyHasNoRange(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $propertyMock->method('getRange')->willReturn(null);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertFalse($result);
    }

    public function testHasMatchingImportedListValuesReturnsFalseWhenImportedValueNotInRange(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('allowed-value-1', 'http://uri/1'),
                $this->createListEntry('allowed-value-2', 'http://uri/2'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'not-allowed-value'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertFalse($result);
    }

    public function testHasMatchingImportedListValuesReturnsTrueWhenValueMatchesByLabel(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('allowed-value', 'http://uri/1'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'allowed-value'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesReturnsTrueWhenValueMatchesByOriginalUri(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('some-label', 'http://uri/allowed-value'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'http://uri/allowed-value'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesReturnsTrueWhenValueMatchesByEntryUri(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('some-label', 'http://uri/original', 'http://uri/current'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'http://uri/current'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesReturnsTrueWhenAllValuesMatch(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('value1', 'http://uri/1'),
                $this->createListEntry('value2', 'http://uri/2'),
                $this->createListEntry('value3', 'http://uri/3'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value2'
                ),
            ],
            [
                new SimpleMetadataValue(
                    'item-2',
                    ['metadata', 'http://example.com/property-uri'],
                    'value3'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesReturnsFalseWhenAtLeastOneValueDoesNotMatch(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('value1', 'http://uri/1'),
                $this->createListEntry('value2', 'http://uri/2'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'invalid-value'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertFalse($result);
    }

    public function testHasMatchingImportedListValuesHandlesDuplicateValues(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('value1', 'http://uri/1'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
            ],
            [
                new SimpleMetadataValue(
                    'item-2',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesIgnoresNonSimpleMetadataValues(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('value1', 'http://uri/1'),
            ]);

        $nonSimpleMetadataValue = $this->getMockBuilder(\stdClass::class)
            ->addMethods(['getPath', 'getValue'])
            ->getMock();
        $nonSimpleMetadataValue->method('getPath')->willReturn(['metadata', 'http://example.com/property-uri']);
        $nonSimpleMetadataValue->method('getValue')->willReturn('value1');

        $metadataValues = [
            [
                $nonSimpleMetadataValue,
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    public function testHasMatchingImportedListValuesWithMixedPropertyPaths(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $rangeMock = $this->createMock(core_kernel_classes_Class::class);

        $propertyMock->method('getRange')->willReturn($rangeMock);

        $this->listServiceMock->method('getListElements')
            ->with($rangeMock)
            ->willReturn([
                $this->createListEntry('value1', 'http://uri/1'),
            ]);

        $metadataValues = [
            [
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/property-uri'],
                    'value1'
                ),
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata', 'http://example.com/other-property-uri'],
                    'other-value'
                ),
                new SimpleMetadataValue(
                    'item-1',
                    ['metadata'],
                    'short-path-value'
                ),
            ],
        ];

        $result = $this->subject->hasMatchingImportedListValues(
            $propertyMock,
            'http://example.com/property-uri',
            $metadataValues
        );

        $this->assertTrue($result);
    }

    private function createListEntry(string $label, string $originalUri, ?string $uri = null): object
    {
        $entry = $this->getMockBuilder(\stdClass::class)
            ->addMethods(['getLabel', 'getOriginalUri', 'getUri'])
            ->getMock();
        $entry->method('getLabel')->willReturn($label);
        $entry->method('getOriginalUri')->willReturn($originalUri);
        $entry->method('getUri')->willReturn($uri ?? $originalUri);

        return $entry;
    }
}
