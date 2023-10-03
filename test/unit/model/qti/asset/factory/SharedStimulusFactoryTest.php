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
use oat\generis\test\ServiceManagerMockTrait;
use \PHPUnit\Framework\TestCase;
use oat\oatbox\user\UserLanguageService;
use oat\taoMediaManager\model\MediaService;
use oat\taoMediaManager\model\sharedStimulus\service\StoreService;
use oat\taoQtiItem\model\qti\asset\factory\SharedStimulusFactory;

class SharedStimulusFactoryTest extends TestCase
{
    use ServiceManagerMockTrait;

    private SharedStimulusFactory $subject;
    private StoreService $storeServiceMock;
    private MediaService $mediaServiceMock;
    private UserLanguageService $userLanguageServiceMock;
    private core_kernel_classes_Class $classMock;

    public function setUp(): void
    {
        $this->subject = new SharedStimulusFactory();
        $this->storeServiceMock = $this->createMock(StoreService::class);
        $this->mediaServiceMock = $this->createMock(MediaService::class);
        $this->userLanguageServiceMock = $this->createMock(UserLanguageService::class);
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);

        $this->subject->setServiceManager(
            $this->getServiceManagerMock(
                [
                    StoreService::class => $this->storeServiceMock,
                    MediaService::class => $this->mediaServiceMock,
                    UserLanguageService::SERVICE_ID => $this->userLanguageServiceMock,
                ]
            )
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

        $result = $this->subject->createShardedStimulusFromSourceFiles(
            'file.xml',
            'path/to/xml/filename.xml',
            'absolute/path/to/asset/passage.xml',
            $this->classMock
        );

        $this->assertEquals($result, 'id');
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
