<?php

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

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor;

use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\Api\AssetExtractorInterface;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class TextReaderAssetExtractor implements AssetExtractorInterface
{
    public const INTERACTION_IDENTIFIER = 'textReaderInteraction';
    private const CONTENT_PREFIX = 'content-';

    /**
     * @inheritDoc
     */
    public function extract(CustomInteraction $interaction): iterable
    {
        return array_filter($interaction->getProperties(), function ($value, $key) {
            return strpos($key, self::CONTENT_PREFIX) === 0
                && is_string($value) && $this->checkIsDataUrl($value);
        }, ARRAY_FILTER_USE_BOTH);
    }

    private function checkIsDataUrl(string $url): bool
    {
        $urlScheme = parse_url($url, PHP_URL_SCHEME);

        return $urlScheme === 'data';
    }
}
