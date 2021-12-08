<?php

declare(strict_types=1);

/*
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
 *
 */

namespace oat\taoQtiItem\model\qti\CustomInteractionAsset;

use oat\taoQtiItem\model\qti\CustomInteractionAsset\Exception\NotDataUrlProvidedException;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class DataUrlMimeTypeDecoder
{
    public const IMAGE_ASSET = 'img';
    public const VIDEO_ASSET = 'video';
    public const AUDIO_ASSET = 'audio';
    public const HTML_ASSET = 'html';
    public const PDF_ASSET = 'pdf';

    private const MIME_TYPE_TO_ASSET_MAPPING = [
        //image
        'image/bmp' => self::IMAGE_ASSET,
        'image/cis-cod' => self::IMAGE_ASSET,
        'image/gif' => self::IMAGE_ASSET,
        'image/ief' => self::IMAGE_ASSET,
        'image/jpeg' => self::IMAGE_ASSET,
        'image/pipeg' => self::IMAGE_ASSET,
        'image/svg+xml' => self::IMAGE_ASSET,
        'image/tiff' => self::IMAGE_ASSET,
        'image/x-cmu-raster' => self::IMAGE_ASSET,
        'image/x-cmx' => self::IMAGE_ASSET,
        'image/x-icon' => self::IMAGE_ASSET,
        'image/x-portable-anymap' => self::IMAGE_ASSET,
        'image/x-portable-bitmap' => self::IMAGE_ASSET,
        'image/x-portable-graymap' => self::IMAGE_ASSET,
        'image/x-portable-pixmap' => self::IMAGE_ASSET,
        'image/x-rgb' => self::IMAGE_ASSET,
        'image/x-xbitmap' => self::IMAGE_ASSET,
        'image/x-xpixmap' => self::IMAGE_ASSET,
        'image/x-xwindowdump' => self::IMAGE_ASSET,
        //video
        'video/mpeg' => self::VIDEO_ASSET,
        'video/mp4' => self::VIDEO_ASSET,
        'video/quicktime' => self::VIDEO_ASSET,
        'video/x-la-asf' => self::VIDEO_ASSET,
        'video/x-ms-asf' => self::VIDEO_ASSET,
        'video/x-msvideo' => self::VIDEO_ASSET,
        'video/x-sgi-movie' => self::VIDEO_ASSET,
        'video/ogg' => self::VIDEO_ASSET,
        //audio
        'audio/basic' => self::AUDIO_ASSET,
        'audio/mid' => self::AUDIO_ASSET,
        'audio/mpeg' => self::AUDIO_ASSET,
        'audio/x-aiff' => self::AUDIO_ASSET,
        'audio/x-mpegurl' => self::AUDIO_ASSET,
        'audio/x-pn-realaudio' => self::AUDIO_ASSET,
        'audio/x-wav' => self::AUDIO_ASSET,
        'audio/ogg' => self::AUDIO_ASSET,
        //other
        'text/html' => self::HTML_ASSET,
        'application/pdf' => self::PDF_ASSET
    ];

    /**
     * @param string $dataUrl
     * @return string|null
     */
    public static function decodeToAssetType(string $dataUrl): ?string
    {
        if (self::checkIsDataUrl($dataUrl)) {
            $mimeType = mime_content_type($dataUrl);
            if ($mimeType !== false) {
                return self::mapMimeTypeToAsset($mimeType);
            }
        }

        return null;
    }

    public static function mapMimeTypeToAsset(string $mimeType): ?string
    {
        return self::MIME_TYPE_TO_ASSET_MAPPING[$mimeType] ?? null;
    }

    public static function checkIsDataUrl(string $url): bool
    {
        $urlScheme = parse_url($url, PHP_URL_SCHEME);

        return $urlScheme === 'data';
    }
}
