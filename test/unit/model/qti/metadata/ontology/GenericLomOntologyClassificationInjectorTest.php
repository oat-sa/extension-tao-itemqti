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

namespace oat\taoQtiItem\test\unit\model\qti\metadata;

use oat\generis\model\OntologyRdf;
use PHPUnit\Framework\TestCase;
use core_kernel_classes_Class;
use core_kernel_classes_ContainerCollection;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\taoQtiItem\model\qti\metadata\MetadataInjectionException;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationInjector;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;

class GenericLomOntologyClassificationInjectorTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $resourceMock;

    /** @var core_kernel_classes_Class|MockObject */
    private $classMock;

    /** @var core_kernel_classes_Property|MockObject */
    private $property1Mock;

    /** @var core_kernel_classes_Property|MockObject */
    private $property2Mock;

    /** @var core_kernel_classes_Property|MockObject */
    private $excludedPropertyMock;

    /** @var Ontology|MockObject */
    private $ontologyMock;

    /** @var core_kernel_classes_ContainerCollection|MockObject */
    private $previousValuesMock;

    /** @var GenericLomOntologyClassificationInjector */
    private $sut;

    protected function setUp(): void
    {
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);
        $this->property1Mock = $this->createMock(
            core_kernel_classes_Property::class
        );
        $this->property2Mock = $this->createMock(
            core_kernel_classes_Property::class
        );
        $this->excludedPropertyMock = $this->createMock(
            core_kernel_classes_Property::class
        );
        $this->resourceMock = $this->createMock(
            core_kernel_classes_Resource::class
        );

        $this->resourceMock
            ->method('getTypes')
            ->willReturn(
                [
                    $this->classMock
                ]
            );

        $this->property1Mock
            ->method('getUri')
            ->willReturn('property://1');

        $this->property2Mock
            ->method('getUri')
            ->willReturn('property://2');

        $this->excludedPropertyMock
            ->method('getUri')
            ->willReturn(OntologyRdf::RDF_TYPE);

        $this->previousValuesMock = $this->createMock(
            core_kernel_classes_ContainerCollection::class
        );

        $this->sut = new GenericLomOntologyClassificationInjector();

        $this->sut->setModel($this->ontologyMock);
    }

    public function testInjectNonResourceThrowsException(): void
    {
        $this->expectException(MetadataInjectionException::class);
        $this->sut->inject((object)[], []);
    }

    public function testInjectWithNoInjectionRulesDoesNothing(): void
    {
        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->property1Mock
                ]
            );

        $this->resourceMock
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $this->resourceMock
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $this->ontologyMock
            ->expects($this->never())
            ->method('getProperty')
            ->with('http://www.imsglobal.org/xsd/imsmd_v1p2#lom');

        $this->ontologyMock
            ->expects($this->never())
            ->method('getProperty')
            ->with('http://www.imsglobal.org/xsd/imsmd_v1p2#general');

        $this->ontologyMock
            ->expects($this->never())
            ->method('getProperty')
            ->with('http://www.imsglobal.org/xsd/imsmd_v1p2#identifier');

        $metadataValue = new SimpleMetadataValue(
            'choice',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            'qti_v2_item_01'
        );

        $this->sut->inject($this->resourceMock, ['choice' => [$metadataValue]]);
    }

    public function testInjectPathWithSpacesShouldTrimSpaces(): void
    {
        $this->setupOntologyMock(1, ['property://1' => $this->property1Mock]);
        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->property1Mock
                ]
            );

        $this->previousValuesMock
            ->expects($this->once())
            ->method('count')
            ->willReturn(1);

        $this->resourceMock
            ->expects($this->once())
            ->method('getPropertyValuesByLg')
            ->with($this->property1Mock, 'en-US')
            ->willReturn($this->previousValuesMock);

        $this->resourceMock
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('editPropertyValueByLg')
            ->with($this->property1Mock, 'qti_v2_item_01', 'en-US');

        $this->ontologyMock
            ->expects($this->once())
            ->method('getProperty')
            ->with('property://1');

        $metadataValue = new SimpleMetadataValue(
            'choice',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                PHP_EOL . '   property://1   ' . PHP_EOL,
            ],
            'qti_v2_item_01'
        );

        $this->sut->inject($this->resourceMock, ['choice' => [$metadataValue]]);
    }




    public function testInjectMappedMultiValuePropertyWithPreviousValue(): void
    {
        $this->setupOntologyMock(1, ['property://1' => $this->property1Mock]);

        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->property1Mock,
                    $this->excludedPropertyMock
                ]
            );

        $this->property1Mock
            ->expects($this->once())
            ->method('isMultiple')
            ->willReturn(true);

        $this->previousValuesMock
            ->expects($this->once())
            ->method('count')
            ->willReturn(1);

        $this->resourceMock
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('getPropertyValuesByLg')
            ->with($this->property1Mock, 'es-ES')
            ->willReturn($this->previousValuesMock);

        $this->resourceMock
            ->expects($this->never())
            ->method('editPropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('setPropertyValueByLg')
            ->with($this->property1Mock, 'property1Value', 'es-ES');

        $metadataValue1 = new SimpleMetadataValue(
            'choice1',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            'qti_v2_item_01'
        );

        $metadataValue2 = new SimpleMetadataValue(
            'choice2',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                'property://1',
            ],
            'property1Value',
            'es-ES'
        );

        $this->sut->inject(
            $this->resourceMock,
            [
                'choice' => [$metadataValue1, $metadataValue2]
            ]
        );
    }

    public function testInjectMappedMultiValuePropertyWithoutPreviousValue(): void
    {
        $this->setupOntologyMock(1, ['property://1' => $this->property1Mock]);

        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->property1Mock,
                    $this->excludedPropertyMock
                ]
            );

        $this->property1Mock
            ->method('isMultiple')
            ->willReturn(true);

        $this->previousValuesMock
            ->expects($this->once())
            ->method('count')
            ->willReturn(0);

        $this->resourceMock
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('getPropertyValuesByLg')
            ->with($this->property1Mock, 'es-ES')
            ->willReturn($this->previousValuesMock);

        $this->resourceMock
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('editPropertyValueByLg')
            ->with($this->property1Mock, 'property1Value', 'es-ES');

        $metadataValue = new SimpleMetadataValue(
            'choice2',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                'property://1',
            ],
            'property1Value',
            'es-ES'
        );

        $this->sut->inject($this->resourceMock, ['choice' => [$metadataValue]]);
    }

    public function testInjectMappedMonoValuePropertyWithPreviousValue(): void
    {
        $this->setupOntologyMock(1, ['property://1' => $this->property1Mock]);

        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->property1Mock,
                    $this->excludedPropertyMock
                ]
            );

        $this->property1Mock
            ->expects($this->once())
            ->method('isMultiple')
            ->willReturn(false);

        $this->previousValuesMock
            ->expects($this->once())
            ->method('count')
            ->willReturn(1);

        $this->resourceMock
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('getPropertyValuesByLg')
            ->with($this->property1Mock, 'es-ES')
            ->willReturn($this->previousValuesMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('editPropertyValueByLg')
            ->with($this->property1Mock, 'property1Value', 'es-ES');

        $this->resourceMock
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $metadataValue1 = new SimpleMetadataValue(
            'choice1',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            'qti_v2_item_01'
        );

        $metadataValue2 = new SimpleMetadataValue(
            'choice2',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                'property://1',
            ],
            'property1Value',
            'es-ES'
        );

        $this->sut->inject(
            $this->resourceMock,
            [
                'choice' => [$metadataValue1, $metadataValue2]
            ]
        );
    }

    public function testInjectMappedMonoValuePropertyWithoutPreviousValue(): void
    {
        $this->setupOntologyMock(1, ['property://1' => $this->property1Mock]);

        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->property1Mock,
                    $this->excludedPropertyMock
                ]
            );

        $this->property1Mock
            ->expects($this->atMost(1))
            ->method('isMultiple')
            ->willReturn(false);

        $this->previousValuesMock
            ->expects($this->once())
            ->method('count')
            ->willReturn(0);

        $this->resourceMock
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('getPropertyValuesByLg')
            ->with($this->property1Mock, 'es-ES')
            ->willReturn($this->previousValuesMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('editPropertyValueByLg')
            ->with($this->property1Mock, 'property1Value', 'es-ES');

        $this->resourceMock
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $metadataValue1 = new SimpleMetadataValue(
            'choice1',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            'qti_v2_item_01'
        );

        $metadataValue2 = new SimpleMetadataValue(
            'choice2',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                'property://1',
            ],
            'property1Value',
            'es-ES'
        );

        $this->sut->inject(
            $this->resourceMock,
            [
                'choice' => [$metadataValue1, $metadataValue2]
            ]
        );
    }

    public function testInjectWithMixedMatchingRules(): void
    {
        $this->setupOntologyMock(1, ['property://1' => $this->property1Mock]);

        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->property1Mock,
                    $this->property2Mock,
                    $this->excludedPropertyMock
                ]
            );

        $this->property1Mock
            ->expects($this->atMost(1))
            ->method('isMultiple')
            ->willReturn(false);

        $this->previousValuesMock
            ->expects($this->once())
            ->method('count')
            ->willReturn(0);

        $this->resourceMock
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $this->resourceMock
            ->expects($this->once())
            ->method('getPropertyValuesByLg')
            ->with($this->property1Mock, 'es-ES')
            ->willReturn($this->previousValuesMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('editPropertyValueByLg')
            ->with($this->property1Mock, 'property1Value', 'es-ES');

        $this->resourceMock
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $metadataValue1 = new SimpleMetadataValue(
            'choice1',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            'qti_v2_item_01'
        );

        $metadataValue2 = new SimpleMetadataValue(
            'choice2',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                'property://1',
            ],
            'property1Value',
            'es-ES'
        );

        $this->sut->inject(
            $this->resourceMock,
            [
                'choice' => [$metadataValue1, $metadataValue2]
            ]
        );
    }

    private function setupOntologyMock(int $times, array $properties): void
    {
        $this->ontologyMock
            ->expects($this->exactly($times))
            ->method('getProperty')
            ->willReturnCallback(function (string $uri) use ($properties) {
                if (isset($properties[$uri])) {
                    return $properties[$uri];
                }

                $this->fail("Unexpected call to getProperty('{$uri}')");
            });
    }
}
