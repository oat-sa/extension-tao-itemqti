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

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Entity\ResourceTranslatableStatus;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\Translation\Service\ResourceTranslatableStatusHandler;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class ResourceTranslatableStatusHandlerTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $item;

    /** @var Service|MockObject */
    private Service $qtiItemService;

    /** @var LoggerInterface|MockObject */
    private LoggerInterface $logger;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    private ResourceTranslatableStatus $status;
    private ResourceTranslatableStatusHandler $sut;

    protected function setUp(): void
    {
        $this->item = $this->createMock(core_kernel_classes_Resource::class);
        $this->item
            ->method('getUri')
            ->willReturn('itemUri');

        $this->qtiItemService = $this->createMock(Service::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->ontology = $this->createMock(Ontology::class);

        $this->status = new ResourceTranslatableStatus(
            'itemUri',
            TaoOntology::CLASS_URI_ITEM,
            'languageUri',
            true,
            true
        );

        $this->sut = new ResourceTranslatableStatusHandler(
            $this->qtiItemService,
            $this->logger,
            $this->ontology
        );
    }

    public function testWillSetEmptyToFalseIfItemHasContent(): void
    {
        $itemData = $this->createMock(Item::class);
        $itemData
            ->expects($this->once())
            ->method('isEmpty')
            ->willReturn(false);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('itemUri')
            ->willReturn($this->item);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn($itemData);

        $this->assertTrue($this->status->isEmpty());

        $this->sut->__invoke($this->status);

        $this->assertFalse($this->status->isEmpty());
    }

    public function testWillSetEmptyToTrueIfItemHasEmptyContentSaved(): void
    {
        $itemData = $this->createMock(Item::class);
        $itemData
            ->expects($this->once())
            ->method('isEmpty')
            ->willReturn(true);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('itemUri')
            ->willReturn($this->item);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn($itemData);

        $this->sut->__invoke($this->status);

        $this->assertTrue($this->status->isEmpty());
    }

    public function testWillSetEmptyToTrueIfItemHasNoContent(): void
    {
        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('itemUri')
            ->willReturn($this->item);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn(null);

        $this->sut->__invoke($this->status);

        $this->assertTrue($this->status->isEmpty());
    }
}
