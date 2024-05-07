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
use oat\taoQtiItem\model\qti\metadata\ontology\MappedMetadataInjector;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\TestCase;

class MappedMetadataInjectorTest extends TestCase
{
    public function setUp(): void
    {
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->subject = new MappedMetadataInjector();
        $this->subject->setModel($this->ontologyMock);
    }

    public function testInject()
    {
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $simpleMetadataValue = $this->createMock(SimpleMetadataValue::class);
        $classMock = $this->createMock(core_kernel_classes_Class::class);
        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);

        $mappedProperties = [
            'mappedPath1' => $propertyMock,
            'mappedPath2' => $propertyMock,
            'mappedPath3' => $propertyMock,
        ];
        $metadataValues = [
            $simpleMetadataValue,
            $simpleMetadataValue,
            $simpleMetadataValue,
        ];

        $propertyMock->method('getRange')
            ->willReturn($classMock);

        $classMock->method('getNestedResources')
            ->willReturn([
                ['isclass' => 1],
                ['isclass' => 0, 'id' => 1]
            ]);

        $this->ontologyMock->method('getResource')
            ->willReturn($resourceMock);

        $resourceMock->method('getLabel')
            ->willReturn('label', 'mismatchLabel', 'otherMatchLabel');

        $simpleMetadataValue->method('getValue')
            ->willReturn('label', 'otherLabel', 'otherMatchLabel');

        $resourceMock
            ->expects(self::exactly(8))
            ->method('setPropertyValue')
            ->with($propertyMock, $resourceMock);

        $simpleMetadataValue
            ->method('getPath')
            ->willReturn(['mappedPath1', 'mappedPath2', 'mappedPath3']);

        $this->subject->inject($mappedProperties, $metadataValues, $resourceMock);
    }
}
