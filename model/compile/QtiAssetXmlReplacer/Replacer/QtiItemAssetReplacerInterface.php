<?php

namespace oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Replacer;

use \DOMDocument;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;

interface QtiItemAssetReplacerInterface
{
    /**
     * short description of function replace
     * @param DOMDocument $dom
     * @param PackedAsset[] $packedAssets
     */
    public function replace(DOMDocument &$dom, array $packedAssets): void;

}
