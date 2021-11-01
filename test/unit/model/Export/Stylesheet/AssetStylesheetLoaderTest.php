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

namespace oat\taoQtiItem\test\unit\model\Export\Stylesheet;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\generis\test\TestCase;
use oat\taoMediaManager\model\fileManagement\FileManagement;
use oat\taoQtiItem\model\Export\Stylesheet\AssetStylesheetLoader;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Http\Message\StreamInterface;

class AssetStylesheetLoaderTest extends TestCase
{
    /** @var FileManagement|MockObject */
    private $fileManagementMock;

    /** @var AssetStylesheetLoader */
    private $subject;

    /** @var Ontology|MockObject */
    private $ontologyMock;

    /** @var core_kernel_classes_Resource|MockObject */
    private $resourceMock;

    /** @var core_kernel_classes_Property|MockObject */
    private $propertyMock;

    /** @var MockObject|StreamInterface */
    private $streamMock;

    public function setUp(): void
    {
        $this->subject = new AssetStylesheetLoader();
        $this->fileManagementMock = $this->createMock(FileManagement::class);
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->resourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $this->propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $this->streamMock = $this->createMock(StreamInterface::class);

        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    FileManagement::SERVICE_ID => $this->fileManagementMock
                ]
            )
        );

        $this->subject->setModel(
            $this->ontologyMock
        );
    }

    public function testLoadAssetFromAssetResourceHappyPath(): void
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

        $this->fileManagementMock
            ->expects($this->once())
            ->method('getFileStream')
            ->willReturn($this->streamMock);

        $result = $this->subject->loadAssetFromAssetResource('encodedLinkToResource');
        $this->assertInstanceOf(StreamInterface::class, $result);
    }

    public function testLoadAssetFromAssetResourceWhenAssetDoesNotExist(): void
    {
        $this->ontologyMock
            ->expects($this->once())
            ->method('getResource')
            ->willReturn($this->resourceMock);

        $this->resourceMock
            ->expects($this->once())
            ->method('exists')
            ->willReturn(false);

        $result = $this->subject->loadAssetFromAssetResource('encodedLinkToResource');

        $this->assertNull($result);
    }
}
