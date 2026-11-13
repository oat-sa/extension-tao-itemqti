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

namespace oat\taoQtiItem\test\unit\model\qti\metadata\ontology;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\Lists\Business\Domain\Value;
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\qti\metadata\ontology\MappedMetadataInjector;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class MappedMetadataInjectorTest extends TestCase
{
    private const FORBIDDEN_PROPERTY_URI = 'http://example.com/forbidden-property';
    private const ALLOWED_PROPERTY_URI = 'http://example.com/allowed-property';

    /** @var ListService|MockObject */
    private ListService $listServiceMock;

    /** @var Ontology|MockObject */
    private Ontology $ontologyMock;

    private MappedMetadataInjector $subject;

    public function setUp(): void
    {
        $this->listServiceMock = $this->createMock(ListService::class);
        $this->ontologyMock = $this->createMock(Ontology::class);

        $this->subject = new MappedMetadataInjector($this->listServiceMock);
        $this->subject->setModel($this->ontologyMock);
    }

    public function testInject(): void
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $simpleMetadataValue = $this->createMock(SimpleMetadataValue::class);
        $classMock = $this->createMock(core_kernel_classes_Class::class);
        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $valueMock = $this->createMock(Value::class);
        $widgetPropertyMock = $this->createMock(core_kernel_classes_Property::class);

        $mappedProperties = [
            'mappedPath1' => $propertyMock,
            'mappedPath2' => $propertyMock,
            'mappedPath3' => $propertyMock,
        ];
        $metadataValues = [
            $simpleMetadataValue,
            $simpleMetadataValue,
        ];

        $simpleMetadataValue
            ->method('getPath')
            ->willReturn(['mappedPath1', 'mappedPath2']);

        $this->listServiceMock
            ->method('getListElements')
            ->willReturn([$valueMock, $valueMock, $valueMock]);

        $propertyMock
            ->method('getRange')
            ->willReturn($classMock);

        $propertyMock
            ->method('getWidget')
            ->willReturn($widgetPropertyMock);

        $widgetPropertyMock
            ->method('getUri')
            ->willReturn('someUri');

        $valueMock
            ->method('getLabel')
            ->willReturn(
                'label',
                'valueLabel',
                'otherMatchedLabel',
                'yetAnotherLabel',
                'otherLabel',
                'otherLabel'
            );

        $this->ontologyMock
            ->method('getResource')
            ->willReturn($resourceMock);

        $resourceMock
            ->expects($this->once())
            ->method('removePropertyValues');

        $resourceMock
            ->method('getLabel')
            ->willReturn('label', 'mismatchLabel', 'otherMatchedLabel');

        $simpleMetadataValue
            ->method('getValue')
            ->willReturn('label', 'otherMismatchedLabel', 'matchedUri', 'otherMatchedLabel');

        $valueMock
            ->method('getOriginalUri')
            ->willReturn('matchedUri', 'otherUri', 'otherUri');

        $resourceMock
            ->expects($this->exactly(2))
            ->method('setPropertyValue')
            ->with($propertyMock, $resourceMock);

        $resourceMock->method('getPropertyValues')->willReturn([]);

        $this->subject->inject($mappedProperties, $metadataValues, $resourceMock);
    }

    public function testInjectSkipsForbiddenProperties(): void
    {
        $this->subject->addForbiddenProperties([self::FORBIDDEN_PROPERTY_URI]);

        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);

        $resourceMock
            ->expects($this->never())
            ->method('removePropertyValues');

        $resourceMock
            ->expects($this->never())
            ->method('setPropertyValue');

        $this->subject->inject(
            [self::FORBIDDEN_PROPERTY_URI => $this->createPropertyMock(self::FORBIDDEN_PROPERTY_URI)],
            [$this->createMetadataValueMock(self::FORBIDDEN_PROPERTY_URI)],
            $resourceMock
        );
    }

    public function testInjectSetsPropertiesThatAreNotForbidden(): void
    {
        $this->subject->addForbiddenProperties([self::FORBIDDEN_PROPERTY_URI]);

        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $resourceMock->method('getPropertyValues')->willReturn([]);

        $this->ontologyMock
            ->method('getResource')
            ->willReturn($resourceMock);

        $resourceMock
            ->expects($this->once())
            ->method('setPropertyValue');

        $this->subject->inject(
            [self::ALLOWED_PROPERTY_URI => $this->createPropertyMock(self::ALLOWED_PROPERTY_URI)],
            [$this->createMetadataValueMock(self::ALLOWED_PROPERTY_URI)],
            $resourceMock
        );
    }

    private function createPropertyMock(string $propertyUri): core_kernel_classes_Property
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $propertyMock
            ->method('getUri')
            ->willReturn($propertyUri);

        return $propertyMock;
    }

    private function createMetadataValueMock(string $propertyUri): SimpleMetadataValue
    {
        $metadataValueMock = $this->createMock(SimpleMetadataValue::class);
        $metadataValueMock
            ->method('getPath')
            ->willReturn([$propertyUri]);
        $metadataValueMock
            ->method('getValue')
            ->willReturn('value');

        return $metadataValueMock;
    }
}
