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

namespace oat\taoQtiItem\test\unit\model\qti\CustomInteractionAsset;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\DataUrlMimeTypeDecoder;
use Ramsey\Uuid\Uuid;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class DataUrlMimeTypeDecoderTest extends TestCase
{
    public function testCheckIsDataUrl(): void
    {
        $dataUrl = 'data:image/jpeg;base64,...';
        $url = 'http://localhost';
        $file = 'file.jpeg';

        $this->assertTrue(DataUrlMimeTypeDecoder::checkIsDataUrl($dataUrl));
        $this->assertFalse(DataUrlMimeTypeDecoder::checkIsDataUrl($url));
        $this->assertFalse(DataUrlMimeTypeDecoder::checkIsDataUrl($file));
    }

    /**
     * @dataProvider getImageMimeType
     */
    public function testImgAssetTypeExtraction(string $mimeType): void
    {
        $this->assertSame(DataUrlMimeTypeDecoder::IMAGE_ASSET, DataUrlMimeTypeDecoder::mapMimeTypeToAsset($mimeType));
    }

    /**
     * @dataProvider getAudioMimeType
     */
    public function testAudioAssetTypeExtraction(string $mimeType): void
    {
        $this->assertSame(DataUrlMimeTypeDecoder::AUDIO_ASSET, DataUrlMimeTypeDecoder::mapMimeTypeToAsset($mimeType));
    }

    /**
     * @dataProvider getVideoMimeType
     */
    public function testVideoAssetTypeExtraction(string $mimeType): void
    {
        $this->assertSame(DataUrlMimeTypeDecoder::VIDEO_ASSET, DataUrlMimeTypeDecoder::mapMimeTypeToAsset($mimeType));
    }

    /**
     * @dataProvider getOtherSuppoertedMimeTypes
     */
    public function testOtherAssetTypeExtraction(string $htmlMimeType, string $pdfMimeType): void
    {
        $this->assertSame(
            DataUrlMimeTypeDecoder::HTML_ASSET,
            DataUrlMimeTypeDecoder::mapMimeTypeToAsset($htmlMimeType)
        );
        $this->assertSame(DataUrlMimeTypeDecoder::PDF_ASSET, DataUrlMimeTypeDecoder::mapMimeTypeToAsset($pdfMimeType));
    }

    /**
     * @dataProvider getUnsupportedMimeTypes
     */
    public function testUnsupportedAssetTypeExtraction(string $mimeType): void
    {
        $this->assertNull(DataUrlMimeTypeDecoder::mapMimeTypeToAsset($mimeType));
    }

    /**
     * @dataProvider getImageMimeType
     * @dataProvider getVideoMimeType
     * @dataProvider getAudioMimeType
     */
    public function testSupportedMimeTypeDataUrlDecoding(string $mimeType): void
    {
        $dataUrl = "data:${$mimeType};base64," . Uuid::uuid4()->toString();
        $assetType = DataUrlMimeTypeDecoder::decodeToAssetType($dataUrl);
        $this->assertNotNull($assetType);
        $this->assertContains(
            $assetType, [
                DataUrlMimeTypeDecoder::AUDIO_ASSET,
                DataUrlMimeTypeDecoder::PDF_ASSET,
                DataUrlMimeTypeDecoder::HTML_ASSET,
                DataUrlMimeTypeDecoder::VIDEO_ASSET,
                DataUrlMimeTypeDecoder::IMAGE_ASSET
            ]
        );
    }

    /**
     * @dataProvider getUnsupportedMimeTypes
     */
    public function testUnsupportedMimeTypeDataUrlDecoding(string $mimeType): void
    {
        $dataUrl = "data:${$mimeType};base64," . Uuid::uuid4()->toString();
        $assetType = DataUrlMimeTypeDecoder::decodeToAssetType($dataUrl);
        $this->assertNull($assetType);
    }

    public function testNotDataUrlDecoding(): void
    {
        $url = 'http://localhost';
        $file = 'file.jpeg';
        $this->assertNull(DataUrlMimeTypeDecoder::decodeToAssetType($url));
        $this->assertNull(DataUrlMimeTypeDecoder::decodeToAssetType($file));
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
