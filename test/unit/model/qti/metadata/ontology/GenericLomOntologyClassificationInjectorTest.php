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
use oat\generis\test\TestCase;
use core_kernel_classes_Class;
use core_kernel_classes_ContainerCollection;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\taoQtiItem\model\qti\metadata\MetadataInjectionException;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationInjector;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

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

    /** @var LoggerInterface|MockObject */
    private $loggerMock;

    /** @var GenericLomOntologyClassificationInjector */
    private $sut;

    protected function setUp(): void
    {
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);
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

        $this->sut = new GenericLomOntologyClassificationInjector(
            $this->loggerMock
        );

        $this->sut->setModel($this->ontologyMock);
    }

    public function testInjectNonResourceThrowsException()
    {
        $this->expectException(MetadataInjectionException::class);
        $this->sut->inject((object)[], []);
    }

    public function testInjectWithNoInjectionRulesDoesDoesNothing()
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

        $values = [
            'choice' => [
                new SimpleMetadataValue(
                    'choice',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                    ],
                    'qti_v2_item_01'
                )
            ]
        ];

        $this->sut->inject($this->resourceMock, $values);
    }

    public function testInjectMappedMultiValuePropertyWithPreviousValue(): void
    {
        $this->ontologyMock = $this->getOntologyMock(
            1,
            ['property://1' => $this->property1Mock]
        );

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


        // @todo Test behavior of getPropertyValuesByLg + setPropertyValueByLg/editPropertyValueByLg

        $values = [
            'choice' => [
                new SimpleMetadataValue(
                    'choice1',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                    ],
                    'qti_v2_item_01'
                ),
                new SimpleMetadataValue(
                    'choice2',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                        'property://1',
                    ],
                    'property1Value',
                    'es-ES'
                )
            ]
        ];

        $this->sut->inject($this->resourceMock, $values);
    }

    public function testInjectMappedMultiValuePropertyWithoutPreviousValue(): void
    {
        $this->ontologyMock = $this->getOntologyMock(
            1,
            ['property://1' => $this->property1Mock]
        );

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
            ->method('setPropertyValueByLg')
            ;

        $this->resourceMock
            ->expects($this->once())
            ->method('editPropertyValueByLg')
            ->with($this->property1Mock, 'property1Value', 'es-ES');

        $values = [
            'choice' => [
                new SimpleMetadataValue(
                    'choice2',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                        'property://1',
                    ],
                    'property1Value',
                    'es-ES'
                )
            ]
        ];

        $this->sut->inject($this->resourceMock, $values);
    }

    public function testInjectMappedMonoValuePropertyWithPreviousValue(): void
    {
        $this->ontologyMock = $this->getOntologyMock(
            1,
            ['property://1' => $this->property1Mock]
        );

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

        $values = [
            'choice' => [
                new SimpleMetadataValue(
                    'choice1',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                    ],
                    'qti_v2_item_01'
                ),
                new SimpleMetadataValue(
                    'choice2',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                        'property://1',
                    ],
                    'property1Value',
                    'es-ES'
                )
            ]
        ];

        $this->sut->inject($this->resourceMock, $values);
    }

    public function testInjectMappedMonoValuePropertyWithoutPreviousValue(): void
    {
        $this->ontologyMock = $this->getOntologyMock(
            1,
            ['property://1' => $this->property1Mock]
        );

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

        $values = [
            'choice' => [
                new SimpleMetadataValue(
                    'choice1',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                    ],
                    'qti_v2_item_01'
                ),
                new SimpleMetadataValue(
                    'choice2',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                        'property://1',
                    ],
                    'property1Value',
                    'es-ES'
                )
            ]
        ];

        $this->sut->inject($this->resourceMock, $values);
    }

    public function testInjectWithMixedMatchingRules(): void
    {
        $this->ontologyMock = $this->getOntologyMock(
            1,
            ['property://1' => $this->property1Mock]
        );

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

        $values = [
            'choice' => [
                new SimpleMetadataValue(
                    'choice1',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                    ],
                    'qti_v2_item_01'
                ),
                new SimpleMetadataValue(
                    'choice2',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                        'property://1',
                    ],
                    'property1Value',
                    'es-ES'
                )
            ]
        ];

        $this->sut->inject($this->resourceMock, $values);
    }

    private function getOntologyMock(int $times, array $properties)
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
