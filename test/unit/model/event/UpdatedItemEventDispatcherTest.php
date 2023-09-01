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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\event;

use core_kernel_classes_Resource;
use oat\oatbox\event\EventManager;
use oat\taoItems\model\event\ItemUpdatedEvent;
use oat\taoQtiItem\model\qti\event\UpdatedItemEventDispatcher;
use oat\taoQtiItem\model\qti\Img;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\parser\ElementReferencesExtractor;
use oat\taoQtiItem\model\qti\QtiObject;
use oat\taoQtiItem\model\qti\XInclude;
use PHPUnit\Framework\MockObject\MockObject;
use oat\generis\test\TestCase;

class UpdatedItemEventDispatcherTest extends TestCase
{
    /** @var UpdatedItemEventDispatcher */
    private $subject;

    /** @var ElementReferencesExtractor|MockObject */
    private $referencesExtractor;

    /** @var EventManager|MockObject */
    private $eventManager;

    protected function setUp(): void
    {
        $this->subject = new UpdatedItemEventDispatcher();
        $this->referencesExtractor = $this->createMock(ElementReferencesExtractor::class);
        $this->eventManager = $this->createMock(EventManager::class);
        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    ElementReferencesExtractor::class => $this->referencesExtractor,
                    EventManager::SERVICE_ID => $this->eventManager
                ]
            )
        );
    }

    public function testDispatch(): void
    {
        $ids = [1];
        $itemUri = 'uri';

        $rdfItem = $this->createMock(core_kernel_classes_Resource::class);
        $rdfItem->method('getUri')
            ->willReturn($itemUri);

        $item = $this->createMock(Item::class);

        $this->eventManager
            ->method('trigger')
            ->with(
                new ItemUpdatedEvent(
                    $itemUri,
                    [
                        'includeElementReferences' => $ids,
                        'objectElementReferences' => $ids,
                        'imgElementReferences' => $ids,
                    ]
                )
            );

        $this->referencesExtractor
            ->expects($this->at(0))
            ->method('extract')
            ->with($item, XInclude::class, 'href')
            ->willReturn($ids);

        $this->referencesExtractor
            ->expects($this->at(1))
            ->method('extract')
            ->with($item, QtiObject::class, 'data')
            ->willReturn($ids);

        $this->referencesExtractor
            ->expects($this->at(2))
            ->method('extract')
            ->with($item, Img::class, 'src')
            ->willReturn($ids);

        $this->assertNull($this->subject->dispatch($item, $rdfItem));
    }
}
