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

use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\BaseExtendedCustomInteractionAssetExtractor;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\TextReaderExtendedAssetExtractor;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class ExtendedCustomInteractionAssetExtractorAllocator
{
    public const TEXT_READER_INTERACTION = 'textReaderInteraction';

    public static function allocateExtractor(
        CustomInteraction $interaction
    ): ?BaseExtendedCustomInteractionAssetExtractor {
        if (
            $interaction instanceof ImsPortableCustomInteraction
            || $interaction instanceof PortableCustomInteraction
        ) {
            if ($interaction->getTypeIdentifier() === self::TEXT_READER_INTERACTION) {
                return new TextReaderExtendedAssetExtractor($interaction);
            }
        }

        return null;
    }
}
