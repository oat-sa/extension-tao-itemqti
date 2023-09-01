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

namespace oat\taoQtiItem\model\compile\QtiAssetReplacer;

use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;

interface QtiItemAssetReplacer
{
    public const SERVICE_ID = 'taoQtiItem/ItemAssetReplacer';

    /**
     * This option can be used for replacement default patterns
     */
    public const OPTION_EXCLUDE_PATTERNS = 'exclude_patterns';

    /**
     * Default patterns for excluding
     */
    public const DEFAULT_EXCLUDE_PATTERNS = [
        '/\.css/',
        '/\.js/',
        '/textReaderInteraction/',
        '/mathEntryInteraction/',
        '/likertScaleInteraction/',
        '/mathEntryInteractionBis/',
        '/mathEntryInteraction/',
        '/numericPadInteraction/',
        '/textAreaTimer/',
        '/mathematicAABC/',
        '/decisiontask/',
        '/numworxPCIplayer/',
        '/\/explo\//',
        '/tutochat/',
        '/ilechat/',
        '/hamsterchat/',
        '/lifichat/',
        '/rosettachat/',
        '/fourchelangchat/',
        '/vrtOEOBdroitezoomeecOAO/',
        '/volcanisme/',
        '/Berthold/',
        '/vrtODOGdroitezoomeeAOAD/',
        '/circuit/',
        '/syracusea/',
        '/delor/',
        '/deppMaisonHHHHHK/',
        '/descubesetdescubesa/',
        '/arbrea/',
        '/nterre/',
        '/patternsdeuxa/',
        '/forcegravite/',
        '/deppLeLacEFEFEDJ/',
        '/deppTectoniqueEFEFERRJ/',
        '/lampedouble/',
        '/deppCocktailZAAAG/',
        '/deppCocktaiZZZZ/',
        '/patterna/',
        '/glips/',
        '/menuisiera/',
        '/mathematicAAB/',
        '/cubea/',
        '/vrtOEOEcalccasseeOAB/',
        '/abeille/',
        '/vrtOEOEcalccassebOAB/',
        '/deppStoreDDDDDDK/',
        '/bronco/',
        '/deppTectoniqueEFEFERRF/',
        '/maraissalant/',
        '/dalichat/',
        '/SnapForTao/'
    ];

    /**
     * Check if an asset can be replaced with an external source
     * @param PackedAsset $packetAsset
     * @return bool
     */
    public function shouldBeReplaced(PackedAsset $packetAsset): bool;

    /**
     * Replace the current asset with the external
     * @param PackedAsset $packetAsset
     * @param string $itemId
     * @return PackedAsset
     */
    public function replace(PackedAsset $packetAsset, string $itemId): PackedAsset;
}
