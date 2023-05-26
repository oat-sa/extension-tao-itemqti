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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\compile;

use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\log\LoggerService;
use oat\tao\model\media\MediaAsset;
use oat\tao\model\media\MediaBrowser;
use oat\tao\model\media\sourceStrategy\InlineSource;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\compile\QtiAssetCompiler\QtiItemAssetCompiler;
use oat\taoQtiItem\model\compile\QtiAssetCompiler\XIncludeAdditionalAssetInjector;
use oat\taoQtiItem\model\compile\QtiAssetReplacer\NullQtiItemAssetReplacer;
use oat\taoQtiItem\model\compile\QtiAssetReplacer\QtiItemAssetReplacer;
use oat\taoQtiItem\model\compile\QtiItemCompilerAssetBlacklist;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use oat\taoQtiItem\model\qti\Img;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\XInclude;
use oat\taoQtiItem\test\unit\model\compile\mock\ElementMock;
use Psr\Log\NullLogger;

class QtiItemAssetCompilerTest extends TestCase
{
    /** @var QtiItemAssetCompiler */
    private $subject;

    /** @var QtiItemCompilerAssetBlacklist */
    private $blackListService;

    /** @var ItemMediaResolver */
    private $resolver;

    /** @var Item */
    private $item;

    /** @var Directory */
    private $directory;

    /** @var XIncludeAdditionalAssetInjector */
    private $xIncludeAdditionalAssetInjector;

    /** @var QtiItemAssetReplacer */
    private $nullQtiItemAssetReplacer;

    public function setUp(): void
    {
        $this->subject = new QtiItemAssetCompiler();

        $this->blackListService = $this->createMock(QtiItemCompilerAssetBlacklist::class);
        $this->nullQtiItemAssetReplacer = $this->createMock(NullQtiItemAssetReplacer::class);
        $this->xIncludeAdditionalAssetInjector = $this->createMock(XIncludeAdditionalAssetInjector::class);
        $this->subject->setServiceLocator($this->getServiceLocatorMock([
            QtiItemCompilerAssetBlacklist::SERVICE_ID => $this->blackListService,
            LoggerService::SERVICE_ID => new NullLogger(),
            QtiItemAssetReplacer::SERVICE_ID => $this->nullQtiItemAssetReplacer,
            XIncludeAdditionalAssetInjector::class => $this->xIncludeAdditionalAssetInjector
        ]));

        $this->resolver = $this->createMock(ItemMediaResolver::class);
        $this->item = $this->createMock(Item::class);
        $this->directory = $this->createMock(Directory::class);
    }

    public function testExtractAndCopyAssetFiles()
    {
        $this->item
            ->method('getComposingElements')
            ->willReturn([
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(XInclude::class, ['attr' => 'stimulus-href'])
                ]),
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(Img::class, ['attr' => 'image-src'])
                ])
            ]);

        $this->resolver->expects($this->exactly(2))
            ->method('resolve')
            ->willReturnOnConsecutiveCalls(
                new MediaAsset(
                    $this->createConfiguredMock(
                        MediaBrowser::class,
                        [
                            'getFileInfo' => ['link' => 'stimulus-link'],
                            'getBaseName' => 'stimulus-link'
                        ]
                    ),
                    'stimulus-fixture'
                ),
                new MediaAsset(
                    $this->createConfiguredMock(
                        MediaBrowser::class,
                        [
                            'getFileInfo' => ['link' => 'image-link'],
                            'getBaseName' => 'image-link'
                        ]
                    ),
                    'image-fixture'
                )
            );

        $this->directory
            ->method('getFile')
            ->willReturn(
                $this->createConfiguredMock(File::class, ['write' => true])
            );

        $this->blackListService->method('isBlacklisted')->willReturn(false);
        $this->nullQtiItemAssetReplacer->method('shouldBeReplaced')->willReturn(false);

        $packedAssets = $this->subject->extractAndCopyAssetFiles(
            $this->item,
            $this->directory,
            $this->resolver
        );

        $this->assertArrayHasKey('stimulus-href', $packedAssets);
        $this->assertInstanceOf(PackedAsset::class, $packedAssets['stimulus-href']);
        $this->assertSame('xinclude', $packedAssets['stimulus-href']->getType());
        $this->assertSame('stimulus-link', $packedAssets['stimulus-href']->getLink());
        $this->assertSame(
            $this->getReplacementName('stimulus-link'),
            $this->getFilenameWithoutPrefix($packedAssets['stimulus-href']->getReplacedBy())
        );

        $this->assertArrayHasKey('image-src', $packedAssets);
        $this->assertInstanceOf(PackedAsset::class, $packedAssets['image-src']);
        $this->assertSame('img', $packedAssets['image-src']->getType());
        $this->assertSame('image-link', $packedAssets['image-src']->getLink());
        $this->assertSame(
            $this->getReplacementName('image-link'),
            $this->getFilenameWithoutPrefix($packedAssets['image-src']->getReplacedBy())
        );
    }

    public function testExtractAndCopyAssetFilesWithImageTwice()
    {
        $this->item
            ->method('getComposingElements')
            ->willReturn([
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(Img::class, ['attr' => 'image-src-1'])
                ]),
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(Img::class, ['attr' => 'image-src-2'])
                ])
            ]);

        $this->resolver->expects($this->exactly(2))
            ->method('resolve')
            ->willReturnOnConsecutiveCalls(
                new MediaAsset(
                    $this->createConfiguredMock(
                        MediaBrowser::class,
                        [
                            'getFileInfo' => [
                                'link' => 'image-link',
                            ],
                            'getBaseName' => 'image-link'
                        ]
                    ),
                    'image-fixture-1'
                ),
                new MediaAsset(
                    $this->createConfiguredMock(
                        MediaBrowser::class,
                        [
                            'getFileInfo' => [
                                'link' => 'image-link',
                            ],
                            'getBaseName' => 'image-link'
                        ]
                    ),
                    'image-fixture-2'
                )
            );

        $this->directory
            ->method('getFile')
            ->willReturn(
                $this->createConfiguredMock(File::class, ['write' => true])
            );

        $this->blackListService->method('isBlacklisted')->willReturn(false);
        $this->nullQtiItemAssetReplacer->method('shouldBeReplaced')->willReturn(false);

        $packedAssets = $this->subject->extractAndCopyAssetFiles(
            $this->item,
            $this->directory,
            $this->resolver
        );

        $this->assertArrayHasKey('image-src-1', $packedAssets);
        $this->assertInstanceOf(PackedAsset::class, $packedAssets['image-src-1']);
        $this->assertSame('img', $packedAssets['image-src-1']->getType());
        $this->assertSame('image-link', $packedAssets['image-src-1']->getLink());
        $this->assertSame(
            $this->getReplacementName('image-link'),
            $this->getFilenameWithoutPrefix($packedAssets['image-src-1']->getReplacedBy())
        );

        $this->assertArrayHasKey('image-src-2', $packedAssets);
        $this->assertInstanceOf(PackedAsset::class, $packedAssets['image-src-2']);
        $this->assertSame('img', $packedAssets['image-src-2']->getType());
        $this->assertSame('image-link', $packedAssets['image-src-2']->getLink());
        $this->assertSame(
            $this->getReplacementName('image-link'),
            $this->getFilenameWithoutPrefix($packedAssets['image-src-2']->getReplacedBy())
        );
    }

    public function testExtractAndCopyAssetFilesWithHttpBlacklisted()
    {
        $this->item
            ->method('getComposingElements')
            ->willReturn([
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(XInclude::class, ['attr' => 'stimulus-href'])
                ]),
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(Img::class, ['attr' => 'image-src'])
                ])
            ]);

        $this->resolver->expects($this->once())
            ->method('resolve')
            ->willReturn(
                new MediaAsset(
                    $this->createConfiguredMock(
                        MediaBrowser::class,
                        [
                            'getFileInfo' => ['link' => 'image-link'],
                            'getBaseName' => 'image-link'
                        ]
                    ),
                    'image-fixture'
                )
            );

        $this->directory
            ->method('getFile')
            ->willReturn(
                $this->createConfiguredMock(File::class, ['write' => true])
            );

        $this->blackListService
            ->method('isBlacklisted')
            ->willReturnOnConsecutiveCalls(true, false);

        $this->nullQtiItemAssetReplacer->method('shouldBeReplaced')->willReturn(false);

        $packedAssets = $this->subject->extractAndCopyAssetFiles(
            $this->item,
            $this->directory,
            $this->resolver
        );

        $this->assertArrayNotHasKey('stimulus-href', $packedAssets);

        $this->assertArrayHasKey('image-src', $packedAssets);
        $this->assertInstanceOf(PackedAsset::class, $packedAssets['image-src']);
        $this->assertSame('img', $packedAssets['image-src']->getType());
        $this->assertSame('image-link', $packedAssets['image-src']->getLink());
        $this->assertSame(
            $this->getReplacementName('image-link'),
            $this->getFilenameWithoutPrefix($packedAssets['image-src']->getReplacedBy())
        );
    }

    public function testExtractAndCopyAssetFilesReplaceInlineAssets()
    {
        $inlineMediaUrl = 'data:image/bmp;base64,dGVzdA==';
        $this->item
            ->method('getComposingElements')
            ->willReturn([
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(Img::class, ['attr' => $inlineMediaUrl])
                ])
            ]);

        $this->blackListService->method('isBlacklisted')->willReturn(false);

        $packedAssetMock = $this->createMock(PackedAsset::class);
        $this->nullQtiItemAssetReplacer->method('shouldBeReplaced')->willReturn(true);
        $this->nullQtiItemAssetReplacer->method('replace')->willReturn($packedAssetMock);

        $packedAssets = $this->subject->extractAndCopyAssetFiles(
            $this->item,
            $this->directory,
            $this->createPartialMock(ItemMediaResolver::class, [])
        );

        $this->assertArrayHasKey($inlineMediaUrl, $packedAssets);
        $this->assertSame($packedAssetMock, $packedAssets[$inlineMediaUrl]);
    }

    public function testReplaceAssets()
    {
        $this->item
            ->method('getComposingElements')
            ->willReturn([
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(XInclude::class, ['attr' => 'stimulus-href'])
                ]),
                (new ElementMock())->setComposingElements([
                    $this->createConfiguredMock(Img::class, ['attr' => 'image-src'])
                ])
        ]);

        $mediaAsset1 = new MediaAsset(
            $this->createConfiguredMock(
                MediaBrowser::class,
                [
                    'getFileInfo' => ['link' => 'stimulus-link'],
                    'getBaseName' => 'stimulus-link'
                ]
            ),
            'stimulus-fixture'
        );
        $mediaAsset2 = new MediaAsset(
            $this->createConfiguredMock(
                MediaBrowser::class,
                [
                    'getFileInfo' => ['link' => 'image-link'],
                    'getBaseName' => 'image-link'
                ]
            ),
            'image-fixture'
        );
        $this->resolver->expects($this->exactly(2))
            ->method('resolve')
            ->willReturnOnConsecutiveCalls(
                $mediaAsset1,
                $mediaAsset2
            );

        $this->directory
            ->method('getFile')
            ->willReturn(
                $this->createConfiguredMock(File::class, ['write' => true])
            );

        $this->blackListService->method('isBlacklisted')->willReturn(false);

        $this->nullQtiItemAssetReplacer->expects($this->exactly(1))->method('shouldBeReplaced')->willReturn(true);
        $this->nullQtiItemAssetReplacer->expects($this->exactly(1))->method('replace')->willReturn(new PackedAsset(
            'img',
            $mediaAsset2,
            'image-link',
            'new_asset_url'
        ));

        $packedAssets = $this->subject->extractAndCopyAssetFiles(
            $this->item,
            $this->directory,
            $this->resolver
        );

        $this->assertSame($this->getReplacementName('new_asset_url'), $packedAssets['image-src']->getReplacedBy());
    }

    private function getReplacementName(string $string): string
    {
        return $string;
    }

    private function getFilenameWithoutPrefix(string $filename): string
    {
        $delimiter = '_';
        return substr($filename, strpos($filename, $delimiter) + 1);
    }
}
