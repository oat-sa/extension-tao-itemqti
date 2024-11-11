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

namespace oat\taoQtiItem\test\unit\model\qti\Identifier\Service;

use core_kernel_classes_Resource;
use oat\tao\model\Translation\Service\AbstractQtiIdentifierSetter;
use oat\taoQtiItem\model\qti\Identifier\Service\QtiIdentifierSetter;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class QtiIdentifierSetterTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $resource;

    /** @var Service|MockObject */
    private Service $qtiItemService;

    private QtiIdentifierSetter $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);
        $this->qtiItemService = $this->createMock(Service::class);

        $this->sut = new QtiIdentifierSetter(
            $this->qtiItemService,
            $this->createMock(LoggerInterface::class)
        );
    }

    public function testSetNoItemData(): void
    {
        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->resource)
            ->willReturn(null);

        $this->qtiItemService
            ->expects($this->never())
            ->method('saveDataItemToRdfItem');

        $this->sut->set([
            AbstractQtiIdentifierSetter::OPTION_RESOURCE => $this->resource,
            AbstractQtiIdentifierSetter::OPTION_IDENTIFIER => 'identifier',
        ]);
    }

    public function testSetWithItemData(): void
    {
        $itemData = $this->createMock(Item::class);

        $this->qtiItemService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($this->resource)
            ->willReturn($itemData);

        $itemData
            ->expects($this->once())
            ->method('setAttribute')
            ->with('identifier', 'identifier');

        $this->qtiItemService
            ->expects($this->once())
            ->method('saveDataItemToRdfItem')
            ->with($itemData, $this->resource);

        $this->sut->set([
            AbstractQtiIdentifierSetter::OPTION_RESOURCE => $this->resource,
            AbstractQtiIdentifierSetter::OPTION_IDENTIFIER => 'identifier',
        ]);
    }
}
