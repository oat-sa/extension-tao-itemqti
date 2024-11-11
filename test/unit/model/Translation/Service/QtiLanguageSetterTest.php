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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\Translation\Service;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use Exception;
use oat\generis\model\data\Ontology;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\container\ContainerItemBody;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\Translation\Service\QtiLanguageSetter;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use tao_models_classes_LanguageService;

class QtiLanguageSetterTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $item;

    /** @var Service|MockObject */
    private Service $qtiItemService;

    /** @var LoggerInterface|MockObject */
    private LoggerInterface $logger;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    private QtiLanguageSetter $sut;

    /** @var tao_models_classes_LanguageService|MockObject */
    private tao_models_classes_LanguageService $languageService;

    protected function setUp(): void
    {
        $this->item = $this->createMock(core_kernel_classes_Resource::class);
        $this->item
            ->method('getUri')
            ->willReturn('itemUri');

        $this->qtiItemService = $this->createMock(Service::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->languageService = $this->createMock(tao_models_classes_LanguageService::class);

        $this->sut = new QtiLanguageSetter(
            $this->qtiItemService,
            $this->logger,
            $this->ontology,
            $this->languageService
        );
    }

    public function testSetter(): void
    {
        $itemData = $this->createMock(Item::class);
        $body = $this->createMock(ContainerItemBody::class);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn($itemData);

        $this->logger
            ->expects($this->never())
            ->method($this->anything());

        $property = $this->createMock(core_kernel_classes_Property::class);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_LANGUAGE)
            ->willReturn($property);

        $this->languageService
            ->expects($this->once())
            ->method('isRtlLanguage')
            ->willReturn(true);

        $propertyValue = $this->createMock(core_kernel_classes_Resource::class);

        $this->item
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($property)
            ->willReturn($propertyValue);

        $propertyValue
            ->expects($this->once())
            ->method('getUri')
            ->willReturn(TaoOntology::LANGUAGE_PREFIX . 'ar-arb');

        $itemData
            ->expects($this->once())
            ->method('getBody')
            ->willReturn($body);

        $itemData
            ->expects($this->once())
            ->method('setAttribute')
            ->with('xml:lang', 'ar-arb');

        $body
            ->expects($this->once())
            ->method('setAttribute')
            ->with('dir', 'rtl');

        $this->qtiItemService
            ->expects($this->once())
            ->method('saveDataItemToRdfItem')
            ->with($itemData, $this->item);

        $this->assertEquals($this->item, $this->sut->__invoke($this->item));
    }

    public function testInvalidItemData(): void
    {
        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willThrowException(new Exception('Invalid item data'));

        $this->logger
            ->expects($this->once())
            ->method('error');

        $this->expectException(Exception::class);

        $this->sut->__invoke($this->item);
    }

    public function testNoItemData(): void
    {
        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn(null);

        $this->logger
            ->expects($this->never())
            ->method('error');

        $this->logger
            ->expects($this->once())
            ->method('info')
            ->with('There is no item data for item itemUri.');

        $this->assertEquals($this->item, $this->sut->__invoke($this->item));
    }

    public function testNoLanguage(): void
    {
        $itemData = $this->createMock(Item::class);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn($itemData);

        $property = $this->createMock(core_kernel_classes_Property::class);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_LANGUAGE)
            ->willReturn($property);

        $this->item
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($property)
            ->willReturn(null);

        $this->logger
            ->expects($this->once())
            ->method('info')
            ->with('There is no language for item itemUri.');

        $itemData
            ->expects($this->never())
            ->method('setAttribute');

        $this->qtiItemService
            ->expects($this->never())
            ->method('saveDataItemToRdfItem');

        $this->assertEquals($this->item, $this->sut->__invoke($this->item));
    }
}
