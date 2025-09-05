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
use oat\taoQtiItem\model\Translation\Service\QtiLanguageRetriever;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Throwable;

class QtiLanguageRetrieverTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $resource;

    /** @var Service|MockObject */
    private Service $qtiItemService;

    /** @var LoggerInterface|MockObject */
    private LoggerInterface $logger;

    private QtiLanguageRetriever $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);
        $this->qtiItemService = $this->createMock(Service::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->sut = new QtiLanguageRetriever($this->qtiItemService, $this->logger);
    }

    public function testNoItemData(): void
    {
        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->resource)
            ->willThrowException($this->createMock(Throwable::class));

        $this->logger
            ->expects($this->once())
            ->method('error');

        $this->expectException(Throwable::class);

        $this->sut->__invoke($this->resource);
    }

    public function testNoLangAttribute(): void
    {
        $itemData = $this->createMock(Item::class);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->resource)
            ->willReturn($itemData);

        $this->logger
            ->expects($this->never())
            ->method($this->anything());

        $itemData
            ->expects($this->once())
            ->method('hasAttribute')
            ->with('xml:lang')
            ->willReturn(false);

        $itemData
            ->expects($this->never())
            ->method('getAttributeValue');

        $this->assertNull($this->sut->__invoke($this->resource));
    }

    public function testWithLangAttribute(): void
    {
        $itemData = $this->createMock(Item::class);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->resource)
            ->willReturn($itemData);

        $this->logger
            ->expects($this->never())
            ->method($this->anything());

        $itemData
            ->expects($this->once())
            ->method('hasAttribute')
            ->with('xml:lang')
            ->willReturn(true);

        $itemData
            ->expects($this->once())
            ->method('getAttributeValue')
            ->with('xml:lang')
            ->willReturn('en-US');

        $this->assertEquals('en-US', $this->sut->__invoke($this->resource));
    }
}
