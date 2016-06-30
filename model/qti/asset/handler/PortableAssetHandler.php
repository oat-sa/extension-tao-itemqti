<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 24/06/2016
 * Time: 13:33
 */

namespace oat\taoQtiItem\model\qti\asset\handler;

use oat\qtiItemPci\model\common\parser\PortableElementItemParser;
use oat\taoQtiItem\model\qti\Item;

class PortableAssetHandler implements AssetHandler
{
    /**
     * @var PortableElementItemParser
     */
    protected $portableItemParser;

    /**
     * PciAssetHandler constructor.
     * Set PortableElementItemParser
     */
    public function __construct()
    {
        $this->portableItemParser = new PortableElementItemParser();
    }

    /**
     * Check if given file is into pci and required by this pci
     *
     * @param $relativePath
     * @return bool
     */
    public function isApplicable($relativePath)
    {
        if ($this->portableItemParser->hasPortableElement()
            && $this->portableItemParser->isPortableElementAsset($relativePath)
        ) {
            return true;
        }
        return false;
    }

    /**
     * Handle Pci asset import
     *
     * @param $absolutePath
     * @param $relativePath
     * @return mixed
     */
    public function handle($absolutePath, $relativePath)
    {
        return $this->portableItemParser->importPortableElementFile($absolutePath, $relativePath);
    }

    /**
     * @return mixed
     */
    public function getQtiModel()
    {
        return  $this->portableItemParser->getQtiModel();
    }

    /**
     * @param Item $item
     * @return $this
     */
    public function setQtiModel(Item $item)
    {
        $this->portableItemParser->setQtiModel($item);
        return $this;
    }

    public function finalize()
    {
        $this->portableItemParser->importPortableElements();
    }

    public function setSource($path)
    {
        $this->portableItemParser->setSource(rtrim($path, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR);
        return $this;
    }
}