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

namespace oat\taoQtiItem\test\unit\model;

use Exception;
use common_Exception;
use core_kernel_classes_ContainerCollection;
use core_kernel_classes_Literal;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\generis\test\MockObject;
use oat\oatbox\filesystem\Directory;
use Psr\Log\LoggerInterface;
use taoItems_models_classes_ItemsService;
use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\Service;

class QtiItemServiceTest extends TestCase
{
    /**
     * @var Service
     */
    private $qtiService;

    /**
     * @var taoItems_models_classes_ItemsService|MockObject
     */
    private $itemServiceMock;

    /**
     * @var FileReferenceSerializer|MockObject
     */
    private $fileSerializerMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->itemServiceMock = $this->createMock(taoItems_models_classes_ItemsService::class);
        $this->fileSerializerMock = $this->createMock(FileReferenceSerializer::class);

        $slMock = $this->getServiceLocatorMock([
            taoItems_models_classes_ItemsService::class => $this->itemServiceMock,
            FileReferenceSerializer::SERVICE_ID => $this->fileSerializerMock
        ]);

        $this->qtiService = new Service();
        $this->qtiService->setServiceLocator($slMock);
        $this->qtiService->setLogger($this->getLoggerMock());
    }

    public function testBackupContentByRdfItemThrowsExceptionWhenBackupFailed(): void
    {
        self::expectException(common_Exception::class);

        $this->itemServiceMock->method('getItemContentProperty')
            ->willThrowException(new Exception('TEST_EXCEPTION'));

        $item = $this->getItemMock();
        $this->qtiService->backupContentByRdfItem($item);
    }

    public function testBackupContentByRdfItemReturnsOldDirectories(): void
    {
        // Mock item content directory for each language.
        $itemContentPropertyMock = $this->getItemContentPropertyMock();
        $this->itemServiceMock->method('getItemContentProperty')
            ->willReturn($itemContentPropertyMock);
        $propertyValue1 = new core_kernel_classes_Literal('DIRECTORY_1');
        $propertyValue2 = new core_kernel_classes_Literal('DIRECTORY_2');
        $propertiesCollection1 = $this->createMock(core_kernel_classes_ContainerCollection::class);
        $propertiesCollection1->method('get')
            ->willReturn($propertyValue1);
        $propertiesCollection2 = $this->createMock(core_kernel_classes_ContainerCollection::class);
        $propertiesCollection2->method('get')
            ->willReturn($propertyValue2);


        $this->configureItemServiceMockToReturnItemContentDirectory();
        $this->fileSerializerMock->expects(self::exactly(2))
            ->method('serialize')
            ->willReturnOnConsecutiveCalls(
                "SERIALIZED_DIRECTORY_1",
                "SERIALIZED_DIRECTORY_2"
            );

        // Mock item methods to return property languages and values.
        $propertyLanguages = ['LANGUAGE_1', 'LANGUAGE_2'];
        $item = $this->getItemMock();
        $item->method('getUsedLanguages')
            ->willReturn($propertyLanguages);
        $item->expects(self::exactly(2))
            ->method('getPropertyValuesByLg')
            ->willReturnOnConsecutiveCalls(
                $propertiesCollection1,
                $propertiesCollection2
            );
        $item->expects(self::exactly(2))
            ->method('editPropertyValueByLg')
            ->withConsecutive(
                [$itemContentPropertyMock, 'SERIALIZED_DIRECTORY_1', 'LANGUAGE_1'],
                [$itemContentPropertyMock, 'SERIALIZED_DIRECTORY_2', 'LANGUAGE_2']
            );

        $itemContentBackup = $this->qtiService->backupContentByRdfItem($item);

        self::assertIsArray($itemContentBackup, 'Method must return an array.');
        self::assertArrayHasKey(
            'LANGUAGE_1',
            $itemContentBackup,
            'Result must contain old directory name for each language.'
        );
        self::assertArrayHasKey(
            'LANGUAGE_2',
            $itemContentBackup,
            'Result must contain old directory name for each language.'
        );
        self::isTrue(
            in_array('DIRECTORY_1', $itemContentBackup),
            'Returned backup must contain all previous item content nt directories'
        );
        self::isTrue(
            in_array('DIRECTORY_2', $itemContentBackup),
            'Returned backup must contain all previous item content nt directories'
        );
    }

    public function testRestoreContentByRdfItemThrowsException(): void
    {
        self::expectException(common_Exception::class);

        $this->itemServiceMock->method('getItemContentProperty')
            ->willThrowException(new Exception('TEST_EXCEPTION'));

        $item = $this->getItemMock();
        $backupNames = [];

        $this->qtiService->restoreContentByRdfItem($item, $backupNames);
    }

    public function testRestoreContentByRdfItemUpdatesContentPropertyValues(): void
    {
        $backupNames = [
            'LANGUAGE_1' => 'BACKUP_DIRECTORY_1',
            'LANGUAGE_2' => 'BACKUP_DIRECTORY_2',
        ];

        $itemContentPropertyMock = $this->getItemContentPropertyMock();
        $this->itemServiceMock->method('getItemContentProperty')
            ->willReturn($itemContentPropertyMock);

        $item = $this->getItemMock();
        $item->expects(self::exactly(2))
            ->method('editPropertyValueByLg')
            ->withConsecutive(
                [$itemContentPropertyMock, 'BACKUP_DIRECTORY_1', 'LANGUAGE_1'],
                [$itemContentPropertyMock, 'BACKUP_DIRECTORY_2', 'LANGUAGE_2']
            );

        $this->qtiService->restoreContentByRdfItem($item, $backupNames);
    }

    private function getLoggerMock(): LoggerInterface
    {
        return $this->createMock(LoggerInterface::class);
    }

    /**
     * @return core_kernel_classes_Property|MockObject
     */
    private function getItemContentPropertyMock(): core_kernel_classes_Property
    {
        return $this->createMock(core_kernel_classes_Property::class);
    }

    /**
     * @return core_kernel_classes_Resource|MockObject
     */
    private function getItemMock(): core_kernel_classes_Resource
    {
        return $this->createMock(core_kernel_classes_Resource::class);
    }

    private function configureItemServiceMockToReturnItemContentDirectory(): void
    {
        $this->itemServiceMock->method('composeItemDirectoryPath')
            ->willReturn('NEW PATH');
        $defaulItemDirectoryMock = $this->createMock(Directory::class);
        $defaulItemDirectoryMock->method('getDirectory')
            ->willReturn($this->createMock(Directory::class));
        $this->itemServiceMock->method('getDefaultItemDirectory')
            ->willReturn($defaulItemDirectoryMock);
    }
}
