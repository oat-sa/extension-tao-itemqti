<?php

declare(strict_types=1);

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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiItem\test\unit\model\qti\CustomInteractionAsset\Extractor;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\TextReaderExtendedAssetExtractor;
use oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction;
use Ramsey\Uuid\Uuid;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class TextReaderExtendedAssetExtractorTest extends TestCase
{
    /** @var TextReaderExtendedAssetExtractor */
    private $subject;
    /** @var ImsPortableCustomInteraction */
    private $interaction;

    protected function setUp(): void
    {
        parent::setUp();
        $this->interaction = new ImsPortableCustomInteraction();
        $this->subject = new TextReaderExtendedAssetExtractor($this->interaction);
    }

    /**
     * @dataProvider getImageMimeType
     * @dataProvider getVideoMimeType
     * @dataProvider getAudioMimeType
     * @throws \Exception
     */
    public function testExtractionSupportedMimeTypes(string $mimeType): void
    {
        $properties = $this->generateProperties($mimeType);
        $this->interaction->setProperties($properties);
        $assets = $this->subject->extract();

        $this->assertCount(count($properties), $assets);
    }

    /**
     * @dataProvider getUnsupportedMimeTypes
     */
    public function testExtractionUnsupportedMimeTypes(string $mimeType): void
    {
        $properties = $this->generateProperties($mimeType);
        $this->interaction->setProperties($properties);
        $assets = $this->subject->extract();

        $this->assertEmpty($assets);
    }


    public function testExtractionNotDataUrlContent(): void
    {
        $properties = $this->generatePropertiesWithoutDataUrls();
        $this->interaction->setProperties($properties);
        $assets = $this->subject->extract();

        $this->assertEmpty($assets);
    }

    /**
     * @throws \Exception
     */
    private function generateProperties(string $mimeType): array
    {
        $properties = [];
        for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
            $dataUrl = "data:${$mimeType};base64," . Uuid::uuid4()->toString();
            $properties[TextReaderExtendedAssetExtractor::CONTENT_PREFIX . Uuid::uuid4()->toString()] = $dataUrl;
        }

        return $properties;
    }

    public function generatePropertiesWithoutDataUrls(): array
    {
        $properties = [];
        $contentValues = ['http://localhost', 'file.ext'];
        for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
            $properties[TextReaderExtendedAssetExtractor::CONTENT_PREFIX . Uuid::uuid4()->toString()] = $contentValues[$i % 2];
        }

        return $properties;
    }

    public function getImageMimeType(): array
    {
        return [
            ['image/bmp'],
            ['image/cis-cod'],
            ['image/gif'],
            ['image/ief'],
            ['image/jpeg'],
            ['image/pipeg'],
            ['image/svg+xml'],
            ['image/tiff'],
            ['image/x-cmu-raster'],
            ['image/x-cmx'],
            ['image/x-icon'],
            ['image/x-portable-anymap'],
            ['image/x-portable-bitmap'],
            ['image/x-portable-graymap'],
            ['image/x-portable-pixmap'],
            ['image/x-rgb'],
            ['image/x-xbitmap'],
            ['image/x-xpixmap'],
            ['image/x-xwindowdump'],
        ];
    }

    public function getAudioMimeType(): array
    {
        return [
            ['audio/basic'],
            ['audio/mid'],
            ['audio/mpeg'],
            ['audio/x-aiff'],
            ['audio/x-mpegurl'],
            ['audio/x-pn-realaudio'],
            ['audio/x-wav'],
            ['audio/ogg'],
        ];
    }

    public function getVideoMimeType(): array
    {
        return [
            ['video/mpeg'],
            ['video/mp4'],
            ['video/quicktime'],
            ['video/x-la-asf'],
            ['video/x-ms-asf'],
            ['video/x-msvideo'],
            ['video/x-sgi-movie'],
            ['video/ogg'],
        ];
    }

    public function getOtherSuppoertedMimeTypes(): array
    {
        return [
            ['text/html', 'application/pdf']
        ];
    }

    public function getUnsupportedMimeTypes(): array
    {
        return [
            ['application/atom+xml'],
            ['application/EDI-X12'],
            ['application/EDIFACT'],
            ['application/json'],
            ['application/javascript'],
            ['application/octet-stream'],
            ['application/ogg'],
            ['application/postscript'],
            ['application/soap+xml'],
            ['application/font-woff'],
            ['application/xhtml+xml'],
            ['application/xml-dtd'],
            ['application/xop+xml'],
            ['application/zip'],
            ['application/gzip'],
            ['application/x-bittorrent'],
            ['application/x-tex'],
            ['application/xml'],
            ['application/msword'],
            ['multipart/mixed'],
            ['multipart/alternative'],
            ['multipart/related'],
            ['multipart/form-data'],
            ['multipart/signed'],
            ['multipart/encrypted'],
            ['model/example'],
            ['model/iges'],
            ['model/mesh'],
            ['model/vrml'],
            ['model/x3d+binary'],
            ['model/x3d+vrml'],
            ['model/x3d+xml'],
            ['application/x-pkcs12'],
            ['application/x-pkcs12'],
            ['application/x-pkcs7-certificates'],
            ['application/x-pkcs7-certificates'],
            ['application/x-pkcs7-certreqresp'],
            ['application/x-pkcs7-mime'],
            ['application/x-pkcs7-mime'],
            ['application/x-pkcs7-signature'],
            ['application/x-www-form-urlencoded'],
            ['application/x-dvi'],
            ['application/x-latex'],
            ['application/x-font-ttf'],
            ['application/x-shockwave-flash'],
            ['application/x-stuffit'],
            ['application/x-rar-compressed'],
            ['application/x-tar'],
            ['text/x-jquery-tmpl'],
            ['application/x-javascript'],
            ['application/vnd.oasis.opendocument.text'],
            ['application/vnd.oasis.opendocument.spreadsheet'],
            ['application/vnd.oasis.opendocument.presentation'],
            ['application/vnd.oasis.opendocument.graphics'],
            ['application/vnd.ms-excel'],
            ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            ['application/vnd.ms-excel.sheet.macroEnabled.12'],
            ['application/vnd.ms-powerpoint'],
            ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            ['application/msword'],
            ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            ['application/vnd.mozilla.xul+xml'],
            ['application/vnd.google-earth.kml+xml'],
            ['text/cmd'],
            ['text/css'],
            ['text/csv'],
            ['text/javascript (Obsolete)'],
            ['text/plain'],
            ['text/php'],
            ['text/xml'],
            ['text/markdown'],
            ['text/cache-manifest'],
            ['message/http'],
            ['message/imdn+xml'],
            ['message/partial'],
            ['message/rfc822'],
        ];
    }
}