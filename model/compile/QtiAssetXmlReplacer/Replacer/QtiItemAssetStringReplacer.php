<?php

namespace oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Replacer;

use \DOMDocument;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;

class QtiItemAssetStringReplacer implements QtiItemAssetReplacerInterface
{
    public function replace(DOMDocument $dom, array $packedAssets): void
    {
        $xmlString = $dom->saveXML();

        /** @var PackedAsset $packedAsset */
        foreach ($packedAssets as $packedAsset) {
            $packedAsset->getMediaAsset();
        }

//        foreach ($qtiResources as $qtiResource){
//
//            $identifier = $qtiResource->getIdentifier();
//            $file = $qtiResource->getFIle();
//            $dirname = dirname($file).DIRECTORY_SEPARATOR;
//            $file = $this->tmpDir.DIRECTORY_SEPARATOR.$file;
//            if(@is_readable($file) && isset($this->mediaList[$identifier])){
//                $xml = file_get_contents($file);
//                foreach ($this->mediaList[$identifier] as $auxiliary => $md5){
//                    $link = $md5List[$md5];
//                    $filename = str_replace($dirname, '', $auxiliary);
//                    $xml = str_replace('"' . $filename . '"', '"' . $link . '"', $xml);
//                }
//
//                file_put_contents($file, $xml);
//            }
//        }
    }
}
