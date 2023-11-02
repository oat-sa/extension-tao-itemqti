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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 *
 * @author Julien Sébire, <julien@taotesting.com>
 */

namespace oat\taoQtiItem\test\unit\model\qti;

use oat\generis\model\data\Ontology;
use oat\generis\test\ServiceManagerMockTrait;
use PHPUnit\Framework\TestCase;
use core_kernel_classes_Class as RdfClass;
use core_kernel_classes_Resource as RdfResource;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\ImportService;

class ImportServiceTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const ITEM_LABEL = 'item label';

    private ImportService $subject;
    private Ontology $ontologyMock;
    private RdfResource $itemResourceMock;

    public function setUp(): void
    {
        $this->subject = new ImportService();
        $this->ontologyMock = $this->createMock(Ontology::class);

        $this->subject->setServiceManager(
            $this->getServiceManagerMock(
                [
                    Ontology::SERVICE_ID => $this->ontologyMock,
                ]
            )
        );

        $this->itemResourceMock = $this->createMock(RdfResource::class);
        $this->itemResourceMock->expects($this->once())
            ->method('getLabel')
            ->willReturn(self::ITEM_LABEL);
    }

    public function testGetTargetClassForAssetsReturnsRoot()
    {
        $itemClassMock = $this->createMock(RdfClass::class);
        $itemClassMock->expects($this->once())
            ->method('getUri')
            ->willReturn(TaoOntology::CLASS_URI_ITEM);

        $result = [self::ITEM_LABEL];

        $this->assertEquals($result, $this->subject->getTargetClassForAssets($itemClassMock, $this->itemResourceMock));
    }

    public function testGetTargetClassForAssetsReturnsExistingMediaClasses()
    {
        $label1 = 'First subclass label';
        $label2 = 'Second subclass label';

        $itemClass = $this->prepareItemClassStructureMock($label1, $label2);

        $result = [$label1, $label2, self::ITEM_LABEL];

        $this->assertEquals($result, $this->subject->getTargetClassForAssets($itemClass, $this->itemResourceMock));
    }

    private function prepareItemClassStructureMock($label1, $label2): RdfClass
    {
        $rootUri = TaoOntology::CLASS_URI_ITEM;
        $uri1 = 'https://example.com/uri2';
        $uri2 = 'https://example.com/uri3';

        $rootClass = $this->createMock(RdfClass::class);
        $rootClass->expects($this->once())
            ->method('getUri')->willReturn($rootUri);

        $subclass1 =  $this->createMock(RdfClass::class);
        $subclass1->expects($this->once())
            ->method('getUri')->willReturn($uri1);
        $subclass1->expects($this->once())
            ->method('getLabel')->willReturn($label1);
        $subclass1->expects($this->once())
            ->method('getParentClasses')->willReturn([$rootUri => $rootClass]);

        $subclass2 = $this->createMock(RdfClass::class);
        $subclass2->expects($this->once())
            ->method('getUri')->willReturn($uri2);
        $subclass2->expects($this->once())
            ->method('getLabel')->willReturn($label2);
        $subclass2->expects($this->once())
            ->method('getParentClasses')->willReturn([$uri1 => $subclass1]);

        return $subclass2;
    }
}
