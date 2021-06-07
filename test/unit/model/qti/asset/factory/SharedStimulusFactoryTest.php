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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\asset\factory;

use core_kernel_classes_Class;
use oat\generis\model\data\Ontology;
use oat\generis\test\TestCase;
use oat\oatbox\user\UserLanguageService;
use oat\taoMediaManager\model\MediaService;
use oat\taoMediaManager\model\sharedStimulus\service\StoreService;
use oat\taoQtiItem\model\qti\asset\factory\SharedStimulusFactory;
use PHPUnit\Framework\MockObject\MockObject;

class SharedStimulusFactoryTest extends TestCase
{
    /** @var SharedStimulusFactory */
    private $subject;

    /** @var StoreService|MockObject */
    private $storeServiceMock;

    /** @var MediaService|MockObject */
    private $mediaServiceMock;

    /** @var UserLanguageService|MockObject */
    private $userLanguageServiceMock;

    /** @var Ontology|MockObject */
    private $ontologyMock;

    /** @var core_kernel_classes_Class|MockObject */
    private $classMock;

    public function setUp(): void
    {
        $this->subject = new SharedStimulusFactory();
        $this->storeServiceMock = $this->createMock(StoreService::class);
        $this->mediaServiceMock = $this->createMock(MediaService::class);
        $this->userLanguageServiceMock = $this->createMock(UserLanguageService::class);
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);

        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    StoreService::class => $this->storeServiceMock,
                    MediaService::class => $this->mediaServiceMock,
                    UserLanguageService::SERVICE_ID => $this->userLanguageServiceMock,
                ]
            )
        );

        $this->subject->setModel(
            $this->ontologyMock
        );

        $this->ontologyMock
            ->expects($this->once())
            ->method('getClass')
            ->willReturn($this->classMock);

        $this->classMock
            ->method('createSubClass')
            ->willReturn($this->classMock);
    }

    public function testCreateShardedStimulusFromSourceFiles(): void
    {
        $this->storeServiceMock
            ->expects($this->once())
            ->method('store');

        $this->mediaServiceMock
            ->expects($this->once())
            ->method('createSharedStimulusInstance')
            ->willReturn('id');

        $this->classMock
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('classUri');

        $result = $this->subject->createShardedStimulusFromSourceFiles(
            'file.xml',
            'path/to/xml/filename.xml',
            'absolute/path/to/asset/passage.xml',
            'Item Label'
        );

        $this->assertEquals($result, 'id');
    }
}
