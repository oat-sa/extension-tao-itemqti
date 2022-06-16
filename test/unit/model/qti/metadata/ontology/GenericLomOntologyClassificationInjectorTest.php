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

use oat\generis\test\TestCase;
use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMapping;
use oat\taoQtiItem\model\qti\metadata\MetadataInjectionException;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationInjector;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use oat\taoQtiItem\model\qti\metadata\guardians\ItemMetadataGuardian;
use Psr\Log\LoggerInterface;

class GenericLomOntologyClassificationInjectorTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $instanceMock;

    /** @var core_kernel_classes_Class|MockObject */
    private $classMock;

    /** @var core_kernel_classes_Property|MockObject */
    private $propertyMock;

    /** @var Ontology|MockObject */
    private $ontologyMock;

    /** @var LoggerInterface|MockObject */
    private $loggerMock;

    /** @var GenericLomOntologyClassificationInjector */
    private $sut;

    protected function setUp(): void
    {
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);
        $this->propertyMock = $this->createMock(
            core_kernel_classes_Property::class
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
        $target = $this->createMock(core_kernel_classes_Resource::class);

        $target
            ->method('getTypes')
            ->willReturn(
                [
                    $this->classMock
                ]
            );

        $this->classMock
            ->expects($this->atLeastOnce())
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->propertyMock
                ]
            );

        $this->propertyMock
            ->method('getUri')
            ->willReturn('property://1');

        $target
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $target
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
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier'
                    ],
                    'qti_v2_item_01'
                )
            ]
        ];

        $this->sut->inject($target, $values);
    }

    // @todo Logic for GenericLomOntologyClassificationInjector should be tested
    //       to check it calls setPropertyValueByLg or editPropertyValueByLg
    //       depending on properties' isMultiple() return value
}
