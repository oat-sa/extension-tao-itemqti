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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\Export\Stylesheet;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use League\Flysystem\DirectoryListing;
use League\Flysystem\FileAttributes;
use oat\generis\model\data\Ontology;
use oat\generis\test\TestCase;
use oat\oatbox\filesystem\FileSystem;
use oat\oatbox\filesystem\FilesystemInterface;
use oat\oatbox\filesystem\FileSystemService;
use oat\taoMediaManager\model\fileManagement\FileManagement;
use oat\taoMediaManager\model\fileManagement\FlySystemManagement;
use oat\taoQtiItem\model\Export\Stylesheet\AssetStylesheetLoader;
use PHPUnit\Framework\MockObject\MockObject;

class AssetStylesheetLoaderTest extends TestCase
{
    /** @var FilesystemInterface|MockObject */
    private $fileSystemMock;

    /** @var AssetStylesheetLoader */
    private $subject;

    /** @var Ontology|MockObject */
    private $ontologyMock;

    /** @var core_kernel_classes_Resource|MockObject */
    private $resourceMock;

    /** @var core_kernel_classes_Property|MockObject */
    private $propertyMock;


    public function setUp(): void
    {
        $this->subject = new AssetStylesheetLoader();

        $this->fileSystemMock = $this->getMockBuilder(FileSystem::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['listContents', 'readStream'])
            ->getMock();

        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->resourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $this->propertyMock = $this->createMock(core_kernel_classes_Property::class);

        $this->setFileSystemMock($this->fileSystemMock);

        $this->subject->setModel(
            $this->ontologyMock
        );
    }

    public function testLoadAssetsFromAssetResourceHappyPath(): void
    {
        $this->ontologyMock
            ->expects($this->once())
            ->method('getResource')
            ->willReturn($this->resourceMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $this->ontologyMock
            ->expects($this->once())
            ->method('getProperty')
            ->willReturn($this->propertyMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('getUniquePropertyValue')
            ->willReturn('AssetUniqueId');

        $fileInfo = [
            'type' => 'file',
            'path' => 'dummy/path/file.css',
            'last_modified' => 1654502842,
            'file_size' => 0,
            'mime_type' => 'css',
            'visibility' => 'public',
            'extra_metadata' => [],
        ];

        $fileStream = "file stream resource";

        $this->fileSystemMock
            ->expects($this->once())
            ->method('listContents')
            ->willReturn(new DirectoryListing([FileAttributes::fromArray($fileInfo)]));

        $this->fileSystemMock
            ->expects($this->once())
            ->method('readStream')
            ->willReturn($fileStream);

        $result = $this->subject->loadAssetsFromAssetResource('encodedLinkToResource');

        $fileInfo['stream'] = $fileStream;
        $this->assertEquals([$fileInfo], $result);
    }

    public function testLoadAssetsFromAssetResourceEmptyPath(): void
    {
        $this->ontologyMock
            ->expects($this->once())
            ->method('getResource')
            ->willReturn($this->resourceMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $this->ontologyMock
            ->expects($this->once())
            ->method('getProperty')
            ->willReturn($this->propertyMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('getUniquePropertyValue')
            ->willReturn('AssetUniqueId');

        $this->fileSystemMock
            ->expects($this->once())
            ->method('listContents')
            ->willReturn(new DirectoryListing([]));

        $result = $this->subject->loadAssetsFromAssetResource('encodedLinkToResource');
        $this->assertEquals([], $result);
    }

    public function testLoadAssetsFromAssetResourceWhenAssetDoesNotExist(): void
    {
        $this->ontologyMock
            ->expects($this->once())
            ->method('getResource')
            ->willReturn($this->resourceMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('exists')
            ->willReturn(false);

        $result = $this->subject->loadAssetsFromAssetResource('encodedLinkToResource');

        $this->assertNull($result);
    }

    /**
     * @var FileSystem|\oat\generis\test\MockObject $fileSystemMock
     */
    private function setFileSystemMock(FileSystem $fileSystemMock): void
    {
        $fileSystemServiceMock = $this->createMock(FileSystemService::class);
        $fileSystemServiceMock
            ->expects(self::any())
            ->method('getFileSystem')
            ->willReturn($fileSystemMock);

        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    FileManagement::SERVICE_ID => $this->createMock(FlySystemManagement::class),
                    FileSystemService::SERVICE_ID => $fileSystemServiceMock
                ]
            )
        );
    }
}

namespace oat\taoMediaManager\model\fileManagement;

use oat\oatbox\service\ConfigurableService;
use Psr\Http\Message\StreamInterface;

interface FileManagement
{
    public const SERVICE_ID = 'taoMediaManager/fileManager';

    public function getFileStream(string $link): StreamInterface;
}

abstract class FlySystemManagement extends ConfigurableService implements FileManagement
{
    public const OPTION_FS = 'fs';
}
