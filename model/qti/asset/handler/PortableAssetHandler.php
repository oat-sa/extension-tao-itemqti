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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
namespace oat\taoQtiItem\model\qti\asset\handler;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\portableElement\parser\itemParser\PortableElementItemParser;
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
    public function __construct(Item $item, $sourceDir)
    {
        $this->portableItemParser = new PortableElementItemParser();
        $this->portableItemParser->setServiceLocator(ServiceManager::getServiceManager());
        $this->portableItemParser->setSource(rtrim($sourceDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR);
        $this->portableItemParser->setQtiModel($item);
    }

    /**
     * Check if given file is into pci and required by this pci
     *
     * @param $relativePath
     * @return bool
     */
    public function isApplicable($relativePath)
    {
        $relativePath = str_replace('./', '', $relativePath);
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
        $relativePath = str_replace('./', '', $relativePath);
        return $this->portableItemParser->importPortableElementFile($absolutePath, $relativePath);
    }

    /**
     * Finalize portable element asset import
     *
     * @throws \common_Exception
     */
    public function finalize()
    {
        $this->portableItemParser->importPortableElements();
    }

}