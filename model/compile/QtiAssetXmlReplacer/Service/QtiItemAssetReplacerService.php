<?php

namespace oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Service;

use oat\oatbox\service\ConfigurableService;
use \DOMDocument;
use oat\taoQtiItem\model\compile\QtiAssetXmlReplacer\Replacer\QtiItemAssetReplacerInterface;

class QtiItemAssetReplacerService extends ConfigurableService implements QtiItemAssetReplacerServiceInterface
{
    public function getType(): int
    {
        return $this->getOption(QtiItemAssetReplacerServiceInterface::OPTION_TYPE);
    }

    public function replace(DOMDocument &$dom, array $packedAssets): void
    {
        if ($this->getType() === QtiItemAssetReplacerServiceInterface::TYPE_SINGLE) {
            /** @var QtiItemAssetReplacerServiceInterface $callable */
            $callable = $this->getOption(QtiItemAssetReplacerServiceInterface::OPTION_CALLABLE);

            $this->callReplacer($callable, $dom, $packedAssets);
        } else {
            $callables = $this->getOption(QtiItemAssetReplacerServiceInterface::OPTION_CALLABLE_CHAIN);

            /** @var QtiItemAssetReplacerServiceInterface $callable */
            foreach ($callables as $callable) {
                $this->callReplacer($callable, $dom, $packedAssets);
            }
        }
    }

    private function callReplacer($replacer, DOMDocument &$dom, array $packedAssets): void
    {
        if ($replacer instanceof QtiItemAssetReplacerInterface) {
            $this->logInfo('Going to replace asset link');
            $replacer->replace($dom, $packedAssets);
        } else {
            $this->logInfo("Failed to replace link in `" . get_class($replacer) . "`");
            throw new \Exception('dead on exec step');
        }
    }
}
