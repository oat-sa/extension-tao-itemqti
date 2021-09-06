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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\compile;

use League\Flysystem\FileExistsException;
use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\tao\model\media\MediaAsset;
use oat\taoQtiItem\model\compile\QtiAssetCompiler\XIncludeAdditionalAssetInjector;
use oat\taoQtiItem\model\Export\Stylesheet\AssetStylesheetLoader;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Stylesheet;
use Psr\Http\Message\StreamInterface;
use Psr\Log\LoggerInterface;


class XIncludeAdditionalAssetInjectorTest extends TestCase
{
    private const DUMMY_EXCEPTION_MESSAGE = 'exception_message';

    /** @var Item */
    private $item;

    /** @var Directory */
    private $directory;

    /** @var XIncludeAdditionalAssetInjector */
    private $subject;

    /** @var LoggerInterface */
    private $loggerMock;

    /** @var File */
    private $fileMock;

    public function setUp(): void
    {
        $this->subject = new XIncludeAdditionalAssetInjector();

        $assetStylesheetLoader = $this->createMock(AssetStylesheetLoader::class);
        $assetStylesheetLoader->method('loadAssetFromAssetResource')
            ->willReturn($this->createMock(StreamInterface::class));

        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    AssetStylesheetLoader::class => $assetStylesheetLoader,
                ]
            )
        );

        $this->loggerMock = $this->createMock(LoggerInterface::class);
        $this->subject->setLogger($this->loggerMock);

        $this->directory = $this->createMock(Directory::class);
        $this->fileMock = $this->createMock(File::class);
        $this->fileMock->method('write')
            ->willReturn(true);
        $this->directory->method('getFile')
            ->willReturn($this->fileMock);

        $this->item = $this->createMock(Item::class);
    }

    public function testInjectNonRDFXincludeRelatedAssets()
    {
        $packedAsset = $this->getPackedAssetMock();

        $this->item->expects($this->atLeastOnce())
            ->method('addStylesheet')
            ->willReturn($this->isInstanceOf(Stylesheet::class));

        $this->directory->expects($this->atLeastOnce())
            ->method('getFile')
            ->withAnyParameters();

        $this->subject->injectNonRDFXincludeRelatedAssets($this->item, $this->directory, $packedAsset);
    }

    public function testInjectNonRDFXincludeRelatedAssetsSkipsOtherAssets()
    {
        $packedAsset = $this->getPackedAssetMock('image');

        $this->item->expects($this->never())
            ->method('addStylesheet');

        $this->directory->expects($this->never())
            ->method('getFile');

        $this->subject->injectNonRDFXincludeRelatedAssets($this->item, $this->directory, $packedAsset);
    }

    public function testInjectNonRDFXincludeRelatedAssetsWritesWarningLogOnQtiException()
    {
        $packedAsset = $this->getPackedAssetMock();

        $this->item->method('addStylesheet')
            ->willThrowException(new QtiModelException(self::DUMMY_EXCEPTION_MESSAGE));

        $this->loggerMock->expects($this->atLeastOnce())
            ->method('warning')
            ->with($this->stringContains(self::DUMMY_EXCEPTION_MESSAGE));

        $this->subject->injectNonRDFXincludeRelatedAssets($this->item, $this->directory, $packedAsset);
    }

    public function testInjectNonRDFXincludeRelatedAssetsWritesWarningLogOnFileException()
    {
        $packedAsset = $this->getPackedAssetMock();

        $this->fileMock->method('write')
            ->willThrowException(new FileExistsException(self::DUMMY_EXCEPTION_MESSAGE));

        $this->loggerMock->expects($this->atLeastOnce())
            ->method('warning')
            ->with($this->stringContains(self::DUMMY_EXCEPTION_MESSAGE));

        $this->subject->injectNonRDFXincludeRelatedAssets($this->item, $this->directory, $packedAsset);
    }

    private function getPackedAssetMock($type = XIncludeAdditionalAssetInjector::XINCLUDE_ASSET_TYPE): PackedAsset
    {
        $mediaAsset = $this->createConfiguredMock(
            MediaAsset::class,
            [
                'getMediaIdentifier' => 'fixture-id'
            ]
        );

        return $this->createConfiguredMock(
            PackedAsset::class,
            [
                'getMediaAsset' => $mediaAsset,
                'getType' => $type
            ]
        );
    }
}
