<?php

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
     * @param \DOMDocument $dom
     * @param PackedAsset[] $packedAssets
     *
     * @throws \Exception
     */
    public function replace(DOMDocument &$dom, array $packedAssets): void;
}
