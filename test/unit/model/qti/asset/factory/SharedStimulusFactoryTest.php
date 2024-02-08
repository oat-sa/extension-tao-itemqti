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

use core_kernel_classes_Class as RdfClass;
use oat\generis\test\ServiceManagerMockTrait;
use PHPUnit\Framework\TestCase;
use oat\oatbox\user\UserLanguageService;
use oat\taoMediaManager\model\MediaService;
use oat\generis\model\data\Ontology;
use oat\taoMediaManager\model\sharedStimulus\service\StoreService;
use oat\taoQtiItem\model\qti\asset\factory\SharedStimulusFactory;

class SharedStimulusFactoryTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const ITEM_LABEL = 'item label';
    private SharedStimulusFactory $subject;
    private StoreService $storeServiceMock;
    private MediaService $mediaServiceMock;
    private UserLanguageService $userLanguageServiceMock;
    private RdfClass $classMock;
    private Ontology $ontologyMock;

    public function setUp(): void
    {
        $this->subject = new SharedStimulusFactory();
        $this->storeServiceMock = $this->createMock(StoreService::class);
        $this->mediaServiceMock = $this->createMock(MediaService::class);
        $this->userLanguageServiceMock = $this->createMock(UserLanguageService::class);
        $this->classMock = $this->createMock(RdfClass::class);
        $this->ontologyMock = $this->createMock(Ontology::class);

        $this->subject->setServiceManager(
            $this->getServiceManagerMock(
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

        $this->classMock
            ->method('getLabel')
            ->willReturn('class label');
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

        $result = new \core_kernel_classes_Class('fake uri');
        $mediaRootClassMock = $this->createMock(RdfClass::class);
        $mediaRootClassMock->expects($this->once())
            ->method('retrieveSubClassByLabel')
            ->with(self::ITEM_LABEL)
            ->willReturn($result);

        $this->ontologyMock
            ->expects($this->once())
            ->method('getClass')
            ->willReturn($mediaRootClassMock);

        $result = $this->subject->createShardedStimulusFromSourceFiles(
            'file.xml',
            'path/to/xml/filename.xml',
            'absolute/path/to/asset/passage.xml',
            [self::ITEM_LABEL]
        );

        $this->assertEquals('id', $result);
    }

    public function testCreateShardedStimulusFromSourceFilesWithEmptyPath(): void
    {
        $this->storeServiceMock
            ->expects($this->once())
            ->method('store');

        $this->mediaServiceMock
            ->expects($this->once())
            ->method('createSharedStimulusInstance')
            ->with(
                '/filename.xml',
                'ClassUri',
                ''
            )
            ->willReturn('id');

        $mediaRootClassMock = $this->createMock(RdfClass::class);
        $mediaRootClassMock->expects($this->never())
            ->method('retrieveSubClassByLabel');
        $mediaRootClassMock->expects($this->once())
            ->method('getUri')
            ->willReturn('ClassUri');

        $this->ontologyMock
            ->expects($this->once())
            ->method('getClass')
            ->willReturn($mediaRootClassMock);

        $result = $this->subject->createShardedStimulusFromSourceFiles(
            'file.xml',
            'path/to/xml/filename.xml',
            'absolute/path/to/asset/passage.xml',
            []
        );

        $this->assertEquals('id', $result);
    }

    public function testCreateShardedStimulusFromSourceFilesWithItemClassInPath(): void
    {
        $this->storeServiceMock
            ->expects($this->once())
            ->method('store');

        $this->mediaServiceMock
            ->expects($this->once())
            ->method('createSharedStimulusInstance')
            ->with(
                '/filename.xml',
                'ClassMediaUri',
                ''
            )
            ->willReturn('id');

        $mediaRootClassMock = $this->createMock(RdfClass::class);
        $mediaRootClassMock->expects($this->once())
            ->method('retrieveSubClassByLabel')
            ->willReturn(null);

        $mediaSubclass = $this->createMock(RdfClass::class);
        $mediaSubclass->expects($this->once())
            ->method('getUri')
            ->willReturn('ClassMediaUri');

        $mediaRootClassMock->expects($this->once())
            ->method('createSubClass')
            ->with('class1')
            ->willReturn($mediaSubclass);

        $this->ontologyMock
            ->expects($this->once())
            ->method('getClass')
            ->willReturn($mediaRootClassMock);

        $result = $this->subject->createShardedStimulusFromSourceFiles(
            'file.xml',
            'path/to/xml/filename.xml',
            'absolute/path/to/asset/passage.xml',
            ['class1']
        );

        $this->assertEquals('id', $result);
    }

    public function testCreateShardedStimulusFromSourceFilesWithItemClassesInPath(): void
    {
        $this->storeServiceMock
            ->expects($this->once())
            ->method('store');

        $this->mediaServiceMock
            ->expects($this->once())
            ->method('createSharedStimulusInstance')
            ->with(
                '/filename.xml',
                'Class2MediaUri',
                ''
            )
            ->willReturn('id');

        $mediaRootClassMock = $this->createMock(RdfClass::class);
        $mediaRootClassMock->expects($this->once())
            ->method('retrieveSubClassByLabel')
            ->willReturn(null);

        $mediaSubclass = $this->createMock(RdfClass::class);
        $mediaSubclass->expects($this->once())
            ->method('retrieveSubClassByLabel')
            ->willReturn(null);

        $mediaSubclass2 = $this->createMock(RdfClass::class);
        $mediaSubclass2->expects($this->once())
            ->method('getUri')
            ->willReturn('Class2MediaUri');

        $mediaRootClassMock->expects($this->once())
            ->method('createSubClass')
            ->with('class1')
            ->willReturn($mediaSubclass);

        $mediaSubclass->expects($this->once())
            ->method('createSubClass')
            ->with('class2')
            ->willReturn($mediaSubclass2);

        $this->ontologyMock
            ->expects($this->once())
            ->method('getClass')
            ->willReturn($mediaRootClassMock);

        $result = $this->subject->createShardedStimulusFromSourceFiles(
            'file.xml',
            'path/to/xml/filename.xml',
            'absolute/path/to/asset/passage.xml',
            ['class1', 'class2']
        );

        $this->assertEquals('id', $result);
    }
}

namespace oat\taoMediaManager\model;

interface MediaService
{
    public function createSharedStimulusInstance(
        string $link,
        string $classUri,
        string $language,
        string $userId = null
    ): string;
}

namespace oat\taoMediaManager\model\sharedStimulus\service;

interface StoreService
{
    public function store(
        $stimulusXmlSourceFile,
        string $stimulusFilename,
        array $cssFiles = []
    ): string;
}
