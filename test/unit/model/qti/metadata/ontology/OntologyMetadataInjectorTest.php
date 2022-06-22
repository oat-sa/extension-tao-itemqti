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

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\oatbox\event\EventManager;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\event\MetadataModified;
use oat\taoQtiItem\model\qti\metadata\MetadataInjectionException;
use oat\taoQtiItem\model\qti\metadata\ontology\OntologyMetadataInjector;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use InvalidArgumentException;
use oat\generis\test\TestCase;

class OntologyMetadataInjectorTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $resourceMock;

    /** @var core_kernel_classes_Class|MockObject */
    private $classMock;

    /** @var EventManager|MockObject */
    private $eventManager;

    /** @var OntologyMetadataInjector */
    private $sut;

    protected function setUp(): void
    {
        $this->eventManager = $this->createMock(EventManager::class);
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);
        $this->resourceMock = $this->createMock(
            core_kernel_classes_Resource::class
        );

        ServiceManager::setServiceManager($this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $this->eventManager
        ]));

        $this->sut = new OntologyMetadataInjector($this->eventManager);
    }

    public function testInjectNonResourceThrowsException()
    {
        $this->expectException(MetadataInjectionException::class);

        $this->sut->inject((object)[], []);
    }

    public function testInjectWithNoInjectionRulesDoesDoesNothing()
    {
        $this->resourceMock
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $this->resourceMock
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $this->eventManager
            ->expects($this->never())
            ->method('trigger');

        $metadataValue = new SimpleMetadataValue(
            'choice',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            'qti_v2_item_01'
        );

        $this->eventManager
            ->expects($this->never())
            ->method('trigger');

        $this->sut->inject($this->resourceMock, ['choice' => [$metadataValue]]);
    }

    public function testAddInjectionRuleWithEmptyPathThrowsException()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage(
            'The path argument must be a non-empty array.'
        );

        $this->sut->addInjectionRule([], 'property://1');
    }

    /**
     * @dataProvider injectDataProvider
     */
    public function testInject(
        string $injectionRuleValue,
        string $injectionRuleOntologyValue,
        string $metadataValueLiteral,
        string $propertyValueLiteral
    ): void {
        $this->sut->addInjectionRule(
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            'property://1',
            $injectionRuleValue,
            $injectionRuleOntologyValue
        );

        $metadataValue = new SimpleMetadataValue(
            'property://1',
            [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            $metadataValueLiteral,
            'en-US'
        );

        $this->resourceMock
            ->expects($this->once())
            ->method('removePropertyValueByLg')
            ->with(new core_kernel_classes_Property('property://1'), 'en-US');

        $this->resourceMock
            ->expects($this->once())
            ->method('setPropertyValueByLg')
            ->with(
                new core_kernel_classes_Property('property://1'),
                $propertyValueLiteral,
                'en-US'
            );

        $this->eventManager
            ->expects($this->once())
            ->method('trigger')
            ->with(
                new MetadataModified(
                    $this->resourceMock,
                    'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
                    $metadataValueLiteral
                )
            );

        $this->sut->inject($this->resourceMock, ['choice' => [$metadataValue]]);
    }

    public function injectDataProvider(): array
    {
        return [
            'Inject by value' => [
                'injectionRuleValue'         => 'SMV value',
                'injectionRuleOntologyValue' => 'ontologyValue',
                'metadataValueLiteral'       => 'SMV value',
                'propertyValueLiteral'       => 'ontologyValue',
            ],
            'Inject by path' => [
                'injectionRuleValue'         => 'value',
                'injectionRuleOntologyValue' => 'ontologyValue',
                'metadataValueLiteral'       => 'SMV value',
                'propertyValueLiteral'       => 'SMV value',
            ],
        ];
    }
}
