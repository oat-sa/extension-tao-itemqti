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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiItem\test\unit\model\qti\asset;

use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\oatbox\event\EventManager;
use oat\taoQtiItem\model\qti\Img;
use oat\taoQtiItem\model\qti\Item as QtiItem;
use oat\taoItems\model\event\ItemUpdatedEvent;
use oat\taoQtiItem\model\qti\event\UpdatedItemEventDispatcher;
use oat\taoQtiItem\model\qti\parser\ElementReferencesExtractor;
use oat\taoQtiItem\model\qti\QtiObject;
use oat\taoQtiItem\model\qti\XInclude;
use PHPUnit\Framework\MockObject\MockObject;

class UpdatedItemEventDispatcherTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $rdfItem;

    /** @var QtiItem */
    private $qtiItem;

    /** @var ElementReferencesExtractor|MockObject */
    private $referencesExtractor;

    /** @var EventManager|MockObject */
    private $eventManager;

    /** @var \oat\oatbox\service\ServiceManager */
    private $serviceManager;

    /** @var UpdatedItemEventDispatcher */
    private $subject;

    public function setUp(): void
    {
        $this->eventManager = $this->createMock(EventManager::class);
        $this->referencesExtractor = $this->createMock(
            ElementReferencesExtractor::class
        );
        $this->serviceManager = $this->getServiceLocatorMock([
            ElementReferencesExtractor::class => $this->referencesExtractor,
            EventManager::SERVICE_ID => $this->eventManager
        ]);

        $this->qtiItem = $this->createMock(QtiItem::class);

        $this->rdfItem = $this->createMock(core_kernel_classes_Resource::class);
        $this->rdfItem
            ->method('getUri')
            ->willReturn('http://resource/1');

        $this->subject = new UpdatedItemEventDispatcher();
        $this->subject->setServiceLocator($this->serviceManager);
    }

    public function testDispatch()
    {
        $hrefValue = ['href-value 1', 'href-value 2', 'href-value 3'];
        $dataValue = ['data-value 1', 'data-value 2'];
        $srcValue = ['src-value 1', 'src-value 2'];

        $this->referencesExtractor
            ->expects($this->exactly(3))
            ->method('extract')
            ->willReturnMap(
                [
                    [$this->qtiItem, XInclude::class, 'href', $hrefValue],
                    [$this->qtiItem, QtiObject::class, 'data', $dataValue],
                    [$this->qtiItem, Img::class, 'src', $srcValue],
                ]
            );

        $this->eventManager
            ->expects($this->once())
            ->method('trigger')
            ->with(
                new ItemUpdatedEvent(
                    'http://resource/1',
                    [
                        'includeElementReferences' => $hrefValue,
                        'objectElementReferences' => $dataValue,
                        'imgElementReferences' => $srcValue
                    ]
                )
            );

        $this->subject->dispatch($this->qtiItem, $this->rdfItem);
    }
}
