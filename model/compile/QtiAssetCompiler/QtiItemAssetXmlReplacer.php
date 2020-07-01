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

namespace oat\taoQtiItem\model\compile\QtiAssetCompiler;

use DOMDocument;
use DOMXPath;
use DOMElement;
use oat\oatbox\config\ConfigurationService;

class QtiItemAssetXmlReplacer extends ConfigurationService
{
    public function replaceAssetNodeValue(DOMDocument $domDocument, array $packedAssets): array
    {
        $xpath = new DOMXPath($domDocument);
        $attributeNodes = $xpath->query('//@*');

        /** @var DOMElement $node */
        foreach ($attributeNodes as $node) {
            if (isset($packedAssets[$node->value])) {
                $packedAsset = $packedAssets[$node->value];
                $link = $packedAsset->getLink();
                $node->value = $link;
            }
        }

        return $packedAssets;
    }
}
