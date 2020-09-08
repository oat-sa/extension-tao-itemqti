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
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;

class QtiItemAssetXmlReplacer extends ConfigurationService
{
    /**
     * @param DOMDocument $packedAssets
     * @param PackedAsset[] $packedAssets
     * @return PackedAsset[]
     */
    public function replaceAssetNodeValue(DOMDocument $domDocument, array $packedAssets): array
    {
        $xpath = new DOMXPath($domDocument);
        $attributeNodes = $xpath->query('//@*');

        /** @var DOMElement $node */
        foreach ($attributeNodes as $node) {
            if (isset($packedAssets[$node->value])) {
                $node->value = $packedAssets[$node->value]->getReplacedBy();
            }
        }

        $this->replaceEncodedNodes($xpath, $packedAssets);

        return $packedAssets;
    }

    /**
     * Replace assets in html encoded properties (such as content of text reader interaction)
     * @param $xpath
     * @param array $packedAssets
     */
    private function replaceEncodedNodes($xpath, array $packedAssets)
    {
        $replacementList = array_filter($packedAssets, function ($asset) {
            return $asset instanceof PackedAsset;
        });
        foreach ($replacementList as $key => $asset) {
            $replacementList[$key] = $asset->getReplacedBy();
        }

        $attributeNodes = $xpath->query("//*[local-name()='entry']|//*[local-name()='property']") ?: [];
        foreach ($attributeNodes as $node) {
            if ($node->nodeValue) {
                $node->nodeValue = strtr(htmlentities($node->nodeValue, ENT_XML1), $replacementList);
            }
        }
    }
}
