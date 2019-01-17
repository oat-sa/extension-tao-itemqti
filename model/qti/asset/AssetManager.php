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

use oat\tao\model\import\InvalidSourcePathException;
use oat\taoQtiItem\model\qti\asset\handler\AssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\MediaAssetHandler;
use oat\taoQtiItem\model\qti\Resource as QtiResource;

class AssetManager
{
    /**
     * @var array of AssetHandler
     */
    protected $assetHandlers;

    /**
     * Content of the item
     * @var array
     */
    protected $itemContent = '';

    /**
     * Location of extracted zip package
     * @var string
     */
    protected $source;

    /**
     * Load an asset handler associated
     *
     * @param $assetHandler
     * @return $this
     * @throws AssetManagerException
     */
    public function loadAssetHandler($assetHandler)
    {
        if (!$assetHandler instanceof AssetHandler) {
            throw new AssetManagerException('Asset handler "' . get_class($assetHandler) . '" is not supported by AssetManager');
        }
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
     * @throws AssetManagerException
     */
    public function getSource()
    {
        if (!$this->source) {
            throw new AssetManagerException('No source folder set to assetManager when loading auxiliary files & dependencies.');
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

    /**
     * Import auxiliaryFile e.q. css, js...
     *
     * @param QtiResource $qtiItemResource
     * @return $this
     * @throws AssetManagerException
     * @throws InvalidSourcePathException
     */
    public function importAuxiliaryFiles(QtiResource $qtiItemResource)
    {
        $qtiFile = $this->getSource() . \helpers_File::urlToPath($qtiItemResource->getFile());
        foreach ($qtiItemResource->getAuxiliaryFiles() as $auxiliaryFile) {
            $absolutePath = $this->getAbsolutePath($auxiliaryFile);
            $relativePath = $this->getRelativePath($qtiFile, $absolutePath);

            if (!\helpers_File::isFileInsideDirectory($relativePath, dirname($qtiFile))) {
                throw new InvalidSourcePathException(dirname($qtiFile), $auxiliaryFile);
            }

            try {
                $this->importAsset($absolutePath, $relativePath);
            } catch(\common_Exception $e) {
                throw new AssetManagerException(
                    'Error occurs during auxiliary assets handling for item: ' . $qtiItemResource->getIdentifier()
                    . ', assetFile: ' . $relativePath,
                    0, $e
                );
            }
        }
        return $this;
    }

    /**
     * Import dependencies files
     *
     * @param QtiResource $qtiItemResource
     * @param $dependencies
     * @return $this
     * @throws AssetManagerException
     */
    public function importDependencyFiles(QtiResource $qtiItemResource, $dependencies)
    {
        $qtiFile = $this->getSource() . \helpers_File::urlToPath($qtiItemResource->getFile());
        foreach ($qtiItemResource->getDependencies() as $dependenciesFile) {
            if (!isset($dependencies[$dependenciesFile])) {
                continue;
            }
            $absolutePath = $this->getAbsolutePath($dependencies[$dependenciesFile]->getFile());
            $relativePath = $this->getRelativePath($qtiFile, $absolutePath);
            try {
                $this->importAsset($absolutePath, $relativePath);
            } catch(\common_Exception $e) {
                throw new AssetManagerException(
                    'Error occurs during dependency assets handling for item: ' . $qtiItemResource->getIdentifier()
                    . ', assetFile: ' . $relativePath,
                    0, $e
                );
            }
        }
        return $this;
    }

    /**
     * Finalize asset handling
     */
    public function finalize()
    {
        foreach ($this->assetHandlers as $handler) {
            $handler->finalize();
        }
    }

    /**
     * Return the location of file as absolute path
     *
     * @param $file
     * @return string
     * @throws AssetManagerException
     */
    protected function getAbsolutePath($file)
    {
        return $this->getSource() . str_replace('/', DIRECTORY_SEPARATOR, $file);
    }

    /**
     * Return the location of file as relative path in package
     *
     * @param $qtiFile
     * @param $absolutePath
     * @return mixed
     */
    protected function getRelativePath($qtiFile, $absolutePath)
    {
        return str_replace(DIRECTORY_SEPARATOR, '/', \helpers_File::getRelPath($qtiFile, $absolutePath));
    }

    /**
     * Loop each assetHandlers populated by loadAssetHandler()
     * The first applicable return info about file handling processing
     * and break chain.
     *
     * @param $absolutePath
     * @param $relativePath
     * @throws AssetManagerException
     */
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
        throw new AssetManagerException('Unable to import auxiliary & dependency files. No asset handler applicable to file : ' . $relativePath);
    }

}