<?php

namespace oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Replacer;

use \DOMDocument;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;

class QtiItemAssetStringReplacer implements QtiItemAssetReplacerInterface
{
    public function replace(DOMDocument &$dom, array $packedAssets): void
    {
        $xmlString = $dom->saveXML();

        /** @var PackedAsset $packedAsset */
        foreach ($packedAssets as $fName => $packedAsset) {
            $xmlString = str_replace($fName, $packedAsset->getReplacedBy(), $xmlString);
        }

        $dom = new DOMDocument('1.0', 'UTF-8');

        try {
            if ($dom->loadXML($xmlString) === false) {
                throw new \InvalidArgumentException();
            }
        } catch (\Throwable $e) {
            throw new \taoItems_models_classes_CompilationFailedException(
                sprintf('Unable to load XML for item %s', 'asdasd')
            );
        }
    }
}
