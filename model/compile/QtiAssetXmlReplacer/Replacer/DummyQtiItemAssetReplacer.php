<?php

namespace oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Replacer;

class DummyQtiItemItemAssetReplacer implements QtiItemAssetReplacerInterface
{
    /**
     * Do nothing as it's dummy replacer
     *
     * {@inheritDoc}
     */
    public function replace(\DOMDocument &$dom, array $packedAssets): void {}
}
