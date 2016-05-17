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

    public function getItemContent()
    {
        return $this->itemContent;
    }

    public function setItemContent($itemContent)
    {
        $this->itemContent = $itemContent;
        return $this;
    }


    public function importAuxiliaryFiles(QtiResource $qtiItemResource, array $auxiliaryFiles, $folder)
    {
        $qtiFile = $folder . \helpers_File::urlToPath($qtiItemResource->getFile());

        foreach ($auxiliaryFiles as $auxiliaryFile) {

            //auxFile
            $absolutePath = $folder . str_replace('/', DIRECTORY_SEPARATOR, $auxiliaryFile);

            //auxPath
            $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', \helpers_File::getRelPath($qtiFile, $absolutePath));

            \common_Logger::i('$auxiliaryFile :: ' . $auxiliaryFile);
            \common_Logger::i('$absolutePath :: ' . $absolutePath);
            \common_Logger::i('$qtiFile :: ' . $qtiFile);
            \common_Logger::i('$relativePath :: ' . $relativePath);

            $this->importAsset($absolutePath, $relativePath);
        }
        return $this;
    }

    public function importDependencyFiles(QtiResource $qtiItemResource, array $dependenciesFiles, $folder, $dependencies)
    {
        $qtiFile = $folder . \helpers_File::urlToPath($qtiItemResource->getFile());

        foreach ($dependenciesFiles as $dependenciesFile) {

            if (!isset($dependencies[$dependenciesFile])) {
                continue;
            }

            $absolutePath = $dependencies[$dependenciesFile]->getFile();
            $absolutePath = $folder . str_replace('/', DIRECTORY_SEPARATOR, $absolutePath);

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
                    $this->itemContent = str_replace($relativePath, $info['uri'], $this->itemContent);
                }

                //Break chain of asset handler, first applicable is taken
                return;
            }
        }
    }

}