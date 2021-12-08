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

namespace oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor;

use oat\taoQtiItem\model\qti\CustomInteractionAsset\DataUrlMimeTypeDecoder;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Exception\NotDataUrlProvidedException;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\ExtractedAsset;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class TextReaderExtendedAssetExtractor extends BaseExtendedCustomInteractionAssetExtractor
{
    private const CONTENT_PREFIX = 'content-';

    /**
     * @inheritDoc
     */
    public function extract(): array
    {
        $extractedAssets = [];
        $contentProperties = array_filter($this->interaction->getProperties(), static function ($propertyKey) {
            return strpos($propertyKey, self::CONTENT_PREFIX) !== false;
        }, ARRAY_FILTER_USE_KEY);

        foreach ($contentProperties as $property) {
            if (is_string($property)) {
                try {
                    $propertyAssetType = DataUrlMimeTypeDecoder::decodeToAssetType($property);
                    if ($propertyAssetType !== null) {
                        $extractedAssets[] = new ExtractedAsset($propertyAssetType, $property);
                    }
                } catch (NotDataUrlProvidedException $e) {
                }

            }
        }

        return $extractedAssets;
    }
}
