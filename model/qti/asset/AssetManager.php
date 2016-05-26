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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\qti\asset;

use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\qti\asset\handler\AssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\LocalAssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\MediaAssetHandler;
use oat\taoQtiItem\model\qti\Resource as QtiResource;

class AssetManager
{
    protected $assetHandlers;

    protected $itemContent = '';

    protected $source;

    /**
     * Load an asset handler associated to the given items source
     * ItemSource is transmit to handler by constructor
     *
     * @param $itemSource
     * @param array $parameters
     * @return $this
     * @throws \common_Exception
     */
    public function loadAssetHandler($itemSource, array $parameters = array())
    {
        switch (get_class($itemSource)) {
            case LocalItemSource::class:
                $assetHandler = new LocalAssetHandler($itemSource);
                break;
            case ItemMediaResolver::class:
                $assetHandler = new MediaAssetHandler($itemSource);
                break;
            default:
                throw new \common_Exception('Item source "' . get_class($itemSource) . '" is not supported by AssetManager');
        }

        $assetHandler->setParameters($parameters);
        $this->assetHandlers[] = $assetHandler;

        return $this;
    }

    /**
     * Get item content
     *
     * @return string
     */
    public function getItemContent()
    {
        return $this->itemContent;
    }

    /**
     * Set item content
     *
     * @param $itemContent
     * @return $this
     */
    public function setItemContent($itemContent)
    {
        $this->itemContent = $itemContent;
        return $this;
    }

    /**
     * Get source
     *
     * @return mixed
     * @throws \common_Exception
     */
    public function getSource()
    {
        if (!$this->source) {
            throw new \common_Exception('No source folder set to assetManager when loading auxiliary files & dependencies.');
        }
        return $this->source;
    }

    /**
     * Set source
     *
     * @param $source
     * @return $this
     */
    public function setSource($source)
    {
        $this->source = $source;
        return $this;
    }

    public function importAuxiliaryFiles(QtiResource $qtiItemResource, array $auxiliaryFiles)
    {
        $qtiFile = $this->getSource() . \helpers_File::urlToPath($qtiItemResource->getFile());

        foreach ($auxiliaryFiles as $auxiliaryFile) {

            //auxFile
            $absolutePath = $this->getSource() . str_replace('/', DIRECTORY_SEPARATOR, $auxiliaryFile);

            //auxPath
            $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', \helpers_File::getRelPath($qtiFile, $absolutePath));

            $this->importAsset($absolutePath, $relativePath);
        }
        return $this;
    }

    public function importDependencyFiles(QtiResource $qtiItemResource, array $dependenciesFiles, $dependencies)
    {
        $qtiFile = $this->getSource() . \helpers_File::urlToPath($qtiItemResource->getFile());

        foreach ($dependenciesFiles as $dependenciesFile) {

            if (!isset($dependencies[$dependenciesFile])) {
                continue;
            }

            $absolutePath = $dependencies[$dependenciesFile]->getFile();
            $absolutePath = $this->getSource() . str_replace('/', DIRECTORY_SEPARATOR, $absolutePath);

            $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', \helpers_File::getRelPath($qtiFile, $absolutePath));

            $this->importAsset($absolutePath, $relativePath);
        }
        return $this;
    }

    protected function importAsset($absolutePath, $relativePath)
    {
        /** @var AssetHandler $assetHandler */
        foreach ($this->assetHandlers as $assetHandler) {
            if ($assetHandler->isApplicable($relativePath)) {
                $info = $assetHandler->handle($absolutePath, $relativePath);

                if ($relativePath != ltrim($info['uri'], '/')) {
                    $this->setItemContent(str_replace($relativePath, $info['uri'], $this->getItemContent()));
                }

                //Break chain of asset handler, first applicable is taken
                return;
            }
        }
        throw new \common_Exception('Unable to import auxiliary & dependency files. No asset handler applicable to file : ' . $relativePath);
    }

}