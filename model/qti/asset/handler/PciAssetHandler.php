<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 24/06/2016
 * Time: 13:33
 */

namespace oat\taoQtiItem\model\qti\asset\handler;

use oat\qtiItemPci\model\PciItemSource;
use oat\taoQtiItem\model\qti\Item;

class PciAssetHandler implements AssetHandler
{
    /**
     * @var Item
     */
    protected $qtiModel;

    /**
     * @var PciItemSource
     */
    protected $pciItemSource;

    /**
     * PciAssetHandler constructor.
     * Set PciItemSource
     */
    public function __construct()
    {
        $this->pciItemSource = new PciItemSource();
    }

    /**
     * Check if given file is into pci and required by this pci
     *
     * @param $relativePath
     * @return bool
     */
    public function isApplicable($relativePath)
    {
        if ($this->pciItemSource->isPci($this->getQtiModel())
            && $this->pciItemSource->isPciAsset($relativePath)
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
        return $this->pciItemSource->importPciFile($absolutePath, $relativePath);
    }

    /**
     * @return mixed
     */
    public function getQtiModel()
    {
        return $this->qtiModel;
    }

    /**
     * @param mixed $qtiModel
     */
    public function setQtiModel($qtiModel)
    {
        $this->qtiModel = $qtiModel;
    }


}