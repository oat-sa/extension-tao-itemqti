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
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\Translation\Service\QtiIdentifierRetriever;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class QtiIdentifierRetrieverTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $item;

    /** @var Item|MockObject */
    private $itemData;

    /** @var Service|MockObject */
    private Service $qtiItemService;

    private QtiIdentifierRetriever $sut;

    protected function setUp(): void
    {
        $this->item = $this->createMock(core_kernel_classes_Resource::class);
        $this->itemData = $this->createMock(Item::class);

        $this->qtiItemService = $this->createMock(Service::class);

        $this->sut = new QtiIdentifierRetriever(
            $this->qtiItemService,
            $this->createMock(LoggerInterface::class)
        );
    }

    public function testRetrieve(): void
    {
        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn($this->itemData);

        $this->itemData
            ->expects($this->once())
            ->method('getIdentifier')
            ->willReturn('qtiIdentifier');

        $this->assertEquals('qtiIdentifier', $this->sut->retrieve($this->item));
    }

    public function testRetrieveNoItemData(): void
    {
        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->item)
            ->willReturn(null);

        $this->itemData
            ->expects($this->never())
            ->method('getIdentifier');

        $this->assertEquals(null, $this->sut->retrieve($this->item));
    }
}
