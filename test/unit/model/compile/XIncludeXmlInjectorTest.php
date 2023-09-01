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

use DOMDocument;
use GuzzleHttp\Psr7\Stream;
use oat\generis\test\TestCase;
use oat\oatbox\log\LoggerService;
use oat\tao\model\media\MediaAsset;
use oat\tao\model\media\MediaBrowser;
use oat\taoQtiItem\model\compile\QtiAssetCompiler\XIncludeXmlInjector;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use Psr\Log\NullLogger;

class XIncludeXmlInjectorTest extends TestCase
{
    /** @var XIncludeXmlInjector */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new XIncludeXmlInjector();
        $this->subject->setServiceLocator($this->getServiceLocatorMock([
            LoggerService::SERVICE_ID => new NullLogger()
        ]));
    }

    public function testInjectSharedStimulus()
    {
        $sharedStimulusContent = '<?xml version="1.0" encoding="UTF-8"?><div class="grid-row">Some nice stuff</div>';
        $itemContent = '<?xml version="1.0" encoding="UTF-8"?><div>This is my content: <include href="stimulus-url" />'
            . '</div>';
        $expectedItemContent = '<?xml version="1.0" encoding="UTF-8"?><div>This is my content: <div class="grid-row">'
            . 'Some nice stuff</div></div>';

        $mediaSource = $this->createMock(MediaBrowser::class);
        $mediaSource
            ->method('getFileStream')
            ->with('fixture-id')
            ->willReturn(
                $this->createConfiguredMock(Stream::class, ['getContents' => $sharedStimulusContent])
            );

        $mediaAsset = $this->createConfiguredMock(
            MediaAsset::class,
            [
                'getMediaIdentifier' => 'fixture-id',
                'getMediaSource' => $mediaSource,
            ]
        );

        $packedAsset = $this->createConfiguredMock(
            PackedAsset::class,
            [
                'getMediaAsset' => $mediaAsset
            ]
        );

        $packedAssets = [
            'stimulus-url' => $packedAsset,
            'another-fixture' => '',
        ];

        $domDocument = new DOMDocument('1.0', 'UTF-8');
        $domDocument->loadXML($itemContent);

        $this->subject->injectSharedStimulus($domDocument, $packedAssets);

        $this->assertXmlStringEqualsXmlString(
            $expectedItemContent,
            $domDocument->saveXML()
        );
    }
}
