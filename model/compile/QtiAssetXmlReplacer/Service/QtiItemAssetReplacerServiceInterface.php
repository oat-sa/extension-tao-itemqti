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

namespace oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Service;

use \DOMDocument;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;

interface QtiItemAssetReplacerServiceInterface
{
    public const SERVICE_ID = 'taoQtiItem/QtiItemAssetReplacer';

    public const OPTION_TYPE = 'type';
    public const OPTION_CALLABLE = 'callable';
    public const OPTION_CALLABLE_CHAIN = 'chain';

    public const TYPE_SINGLE = 1;

    public const TYPE_CHAINED = 2;

    /**
     * return type of the current replacer implemented
     *
     * @return int
     */
    public function getType(): int;

    /**
     * replaces the assets
     *
     * @param DOMDocument $dom
     * @param PackedAsset[] $packedAssets
     *
     * @throws \Exception
     *
     * @return DOMDocument
     */
    public function replaceLinksInXML(DOMDocument $dom, array $packedAssets): DOMDocument;
}
