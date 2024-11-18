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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\compile;

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
use oat\taoQtiItem\model\qti\XInclude;
use Psr\Log\LoggerInterface;

class XIncludeAdditionalAssetInjectorTest extends TestCase
{
    private const DUMMY_EXCEPTION_MESSAGE = 'exception_message';

    private const RESOURCE_ID_FIXTURE = 'fixture-id';

    private const STYLESHEETS_LOADER_FILE = [
        'path' => 'file.css',
        'stream' => 'dummy resource string'
    ];

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

    /* @var AssetStylesheetLoader */
    private $assetStylesheetLoader;

    public function setUp(): void
    {
        $this->subject = new XIncludeAdditionalAssetInjector();

        $this->assetStylesheetLoader = $this->createMock(AssetStylesheetLoader::class);

        $this->subject->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    AssetStylesheetLoader::class => $this->assetStylesheetLoader,
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
        $this->item->method('getComposingElements')
            ->willReturn([]);
    }

    public function testInjectNonRDFXincludeRelatedAssets()
    {
        $packedAsset = $this->getPackedAssetMock();
        $this->assetStylesheetLoader->method('loadAssetsFromAssetResource')
            ->willReturn([self::STYLESHEETS_LOADER_FILE]);

        $this->directory->expects($this->atLeastOnce())
            ->method('getFile')
            ->withAnyParameters();

        $this->fileMock->expects($this->once())
            ->method('write')
            ->with(self::STYLESHEETS_LOADER_FILE['stream']);

        $expectedStylesheet = new Stylesheet(
            [
                'href' => implode(DIRECTORY_SEPARATOR, [
                    $this->subject::COMPILED_PASSAGE_STYLESHEET_FILENAME_PREFIX,
                    AssetStylesheetLoader::ASSET_CSS_DIRECTORY_NAME,
                    self::STYLESHEETS_LOADER_FILE['path']
                ]),
                'title' => self::STYLESHEETS_LOADER_FILE['path'],
                'type' => 'text/css'
            ],
            null,
            ''
        );

        $attributesMatchCallback = function (Stylesheet $stylesheet) use ($expectedStylesheet) {
            $attrs = ['href', 'type', 'title'];
            foreach ($attrs as $attr) {
                if ($stylesheet->getAttributeValue($attr) !== $expectedStylesheet->getAttributeValue($attr)) {
                    return false;
                }
            }

            return true;
        };

        $this->item->expects($this->atLeastOnce())
            ->method('addStylesheet')
            ->with($this->callback($attributesMatchCallback));

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

    public function testInjectNonRDFXincludeRelatedAssetsDoNothingIfStylesheetsNotFound()
    {
        $packedAsset = $this->getPackedAssetMock();
        $this->assetStylesheetLoader->method('loadAssetsFromAssetResource')
            ->willReturn([]);


        $this->item->expects($this->never())
            ->method('addStylesheet');

        $this->directory->expects($this->never())
            ->method('getFile');

        $this->subject->injectNonRDFXincludeRelatedAssets($this->item, $this->directory, $packedAsset);
    }

    public function testInjectNonRDFXincludeRelatedAssetsWritesWarningLogOnQtiException()
    {
        $packedAsset = $this->getPackedAssetMock();
        $this->assetStylesheetLoader->method('loadAssetsFromAssetResource')
            ->willReturn([self::STYLESHEETS_LOADER_FILE]);

        $this->item->method('addStylesheet')
            ->willThrowException(new QtiModelException(self::DUMMY_EXCEPTION_MESSAGE));

        $this->loggerMock->expects($this->atLeastOnce())
            ->method('warning')
            ->with($this->stringContains(self::DUMMY_EXCEPTION_MESSAGE));

        $this->subject->injectNonRDFXincludeRelatedAssets($this->item, $this->directory, $packedAsset);
    }

    public function testInjectNonRDFXincludeRelatedAssetsGeneratesCorrectWrapperClassPrefix()
    {
        $packedAsset = $this->getPackedAssetMock();
        $this->assetStylesheetLoader->method('loadAssetsFromAssetResource')
            ->willReturn([self::STYLESHEETS_LOADER_FILE]);

        $xInclude = $this->createMock(XInclude::class);
        $xInclude
            ->method('getAttributeValue')
            ->will($this->returnValueMap(
                array(
                    array('href', self::RESOURCE_ID_FIXTURE),
                    array('class', null)
                )
            ));

        $this->item = $this->createMock(Item::class);
        $this->item->method('getComposingElements')
            ->willReturn([$xInclude]);

        $xInclude->expects($this->atLeastOnce())
            ->method('setAttribute')
            ->with('class', $this->callback(function ($generatedWrapperClassName) {
                /* valid css class name */
                return (bool) preg_match("/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/", $generatedWrapperClassName);
            }));

        $this->subject->injectNonRDFXincludeRelatedAssets($this->item, $this->directory, $packedAsset);
    }

    private function getPackedAssetMock($type = XIncludeAdditionalAssetInjector::XINCLUDE_ASSET_TYPE): PackedAsset
    {
        $mediaAsset = $this->createConfiguredMock(
            MediaAsset::class,
            [
                'getMediaIdentifier' => self::RESOURCE_ID_FIXTURE
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
