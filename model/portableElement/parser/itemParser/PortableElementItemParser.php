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

namespace oat\taoQtiItem\model\portableElement\parser\itemParser;

use oat\taoQtiItem\model\portableElement\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use oat\taoQtiItem\model\portableElement\model\PortableModelRegistry;
use oat\taoQtiItem\model\portableElement\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Element;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class PortableElementItemParser implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * @var Item
     */
    protected $qtiModel;

    protected $importingFiles = [];
    protected $requiredFiles = [];
    protected $portableObjects = [];
    protected $picModels = [];

    protected $source;
    protected $itemDir;

    /**
     * @var PortableElementService
     */
    protected $service;

    /**
     * @return PortableElementService
     */
    public function getService()
    {
        if (!$this->service) {
            $this->service = new PortableElementService();
            $this->service->setServiceLocator($this->getServiceLocator());
        }
        return $this->service;
    }

    /**
     * @return PortableModelRegistry
     */
    protected function getPortableFactory()
    {
        return PortableModelRegistry::getRegistry();
    }

    /**
     * Handle pci import process for a file
     *
     * @param $absolutePath
     * @param $relativePath
     * @return array
     * @throws \common_Exception
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function importPortableElementFile($absolutePath, $relativePath)
    {
        if ($this->isPortableElementAsset($relativePath)) {
            //marked the file as being ok to be imported in the end
            $this->importingFiles[] = $relativePath;

            //@todo remove qti file used by PCI

            return $this->getFileInfo($absolutePath, $relativePath);
        } else {
            throw new \common_Exception(
                'trying to import an asset that is not part of the portable element asset list'
            );
        }
    }

    /**
     * Check if Item contains portable element
     *
     * @return bool
     */
    public function hasPortableElement()
    {
        return (count($this->requiredFiles) > 0);
    }

    /**
     * Check if file is required by a portable element
     *
     * @param $fileRelativePath
     * @return bool
     */
    public function isPortableElementAsset($fileRelativePath)
    {
        return isset($this->requiredFiles[$fileRelativePath]);
    }

    /**
     * Get details about file
     *
     * @param $path
     * @param $relPath
     * @return array
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getFileInfo($path, $relPath)
    {

        if (file_exists($path)) {
            return [
                'name' => basename($path),
                'uri' => $relPath,
                'mime' => \tao_helpers_File::getMimeType($path),
                'filePath' => $path,
                'size' => filesize($path),
            ];
        }

        throw new \tao_models_classes_FileNotFoundException($path);
    }

    /**
     * @return Item
     */
    public function getQtiModel()
    {
        return $this->qtiModel;
    }

    /**
     *
     * @param Item $item
     * @return $this
     */
    public function setQtiModel(Item $item)
    {
        $this->qtiModel = $item;
        $this->feedRequiredFiles($item);
        return $this;
    }

    /**
     * Feed the instance with portable related data extracted from the item
     *
     * @param Item $item
     * @throws \common_Exception
     */
    protected function feedRequiredFiles(Item $item)
    {
        $this->requiredFiles = [];
        $this->portableObjects = [];
        $this->picModels = [];

        $models = $this->getPortableFactory()->getModels();

        foreach ($models as $model) {
            $className = $model->getQtiElementClassName();
            $portableElementsXml = $item->getComposingElements($className);
            foreach ($portableElementsXml as $portableElementXml) {
                $this->parsePortableElement($model, $portableElementXml);
            }
        }
    }

    protected function getSourceAdjustedNodulePath($path)
    {
        $realpath = realpath($this->itemDir . DIRECTORY_SEPARATOR . $path);
        $sourcePath = realpath($this->source);
        return str_replace($sourcePath . DIRECTORY_SEPARATOR, '', $realpath);
    }

    /**
     * Parse individual portable element into the given portable model
     * @param PortableElementModel $model
     * @param Element $portableElement
     * @throws \common_Exception
     * @throws PortableElementInconsistencyModelException
     */
    protected function parsePortableElement(PortableElementModel $model, Element $portableElement)
    {
        $typeId = $portableElement->getTypeIdentifier();
        $libs = [];
        $librariesFiles = [];
        $entryPoint = [];

        //Adjust file resource entries where {QTI_NS}/xxx/yyy is equivalent to {QTI_NS}/xxx/yyy.js
        foreach ($portableElement->getLibraries() as $lib) {
            if (preg_match('/^' . $typeId . '/', $lib) && substr($lib, -3) != '.js') {//filter shared stimulus
                $librariesFiles[] = $lib . '.js';//amd modules
                $libs[] = $lib . '.js';
            } else {
                $libs[] = $lib;//shared libs
            }
        }

        $moduleFiles = [];
        $emptyModules = [];//list of modules that are referenced directly in the module node
        $adjustedModules = [];
        foreach ($portableElement->getModules() as $id => $paths) {
            $adjustedPaths = [];
            if (empty($paths)) {
                $emptyModules[] = $id;
                continue;
            }
            foreach ($paths as $path) {
                if ($this->isRelativePath($path)) {
                    //only copy into data the relative files
                    $moduleFiles[] = $path;
                    $adjustedPaths[] = $this->getSourceAdjustedNodulePath($path);
                } else {
                    $adjustedPaths[] = $path;
                }
            }
            $adjustedModules[$id] = $adjustedPaths;
        }

        /**
         * Parse the standard portable configuration if applicable.
         * Local config files will be preloaded into the registry itself and the registered modules will be included
         * as required dependency files.
         * Per standard, every config file have the following structure:
         *  {
         *  "waitSeconds": 15,
         *      "paths": {
         *          "graph": "https://example.com/js/modules/graph1.01/graph.js",
         *          "foo": "foo/bar1.2/foo.js"
         *      }
         *  }
         */
        $configDataArray = [];
        $configFiles = [];
        foreach ($portableElement->getConfig() as $configFile) {
            //only read local config file
            if ($this->isRelativePath($configFile)) {
                //save the content and file config data in registry, to allow later retrieval
                $configFiles[] = $configFile;


                //read the config file content
                $configData = json_decode(file_get_contents($this->itemDir . DIRECTORY_SEPARATOR . $configFile), true);
                if (!empty($configData)) {
                    if (isset($configData['paths'])) {
                        foreach ($configData['paths'] as $id => $path) {
                            // only copy the relative files to local portable element filesystem, absolute ones are
                            // loaded dynamically
                            if ($this->isRelativePath($path)) {
                                //resolution of path, relative to the current config file it has been defined in
                                $path = dirname($configFile) . DIRECTORY_SEPARATOR . $path;
                                if (file_exists($this->itemDir . DIRECTORY_SEPARATOR . $path)) {
                                    $moduleFiles[] = $path;
                                    $configData['paths'][$id] = $this->getSourceAdjustedNodulePath($path);
                                    ;
                                } else {
                                    throw new \tao_models_classes_FileNotFoundException(
                                        "The portable config {$configFile} references a missing module file "
                                            . "{$id} => {$path}"
                                    );
                                }
                            }
                        }
                    }
                    $configDataArray[] = [
                        'file' => $this->getSourceAdjustedNodulePath($configFile),
                        'data' => $configData
                    ];
                }
            } else {
                $configDataArray[] = ['file' => $configFile];
            }
        }

        /**
         * In the standard IMS PCI, entry points become optionnal
         */
        if (!empty($portableElement->getEntryPoint())) {
            $entryPoint[] = $portableElement->getEntryPoint();
        }

        //register the files here
        $data = [
            'typeIdentifier' => $typeId,
            'version' => $portableElement->getVersion(),
            'label' => $typeId,
            'short' => $typeId,
            'runtime' => [
                'hook' => $portableElement->getEntryPoint(),
                'libraries' => $libs,
                'stylesheets' => $portableElement->getStylesheets(),
                'mediaFiles' => $portableElement->getMediaFiles(),
                'config' => $configDataArray,
                'modules' => $adjustedModules
            ]
        ];

        $portableObject = $model->createDataObject($data);

        $compatibleRegisteredObject = $this->getService()->getLatestCompatibleVersionElementById(
            $portableObject->getModel()->getId(),
            $portableObject->getTypeIdentifier(),
            $portableObject->getVersion()
        );

        $latestVersionRegisteredObject = $this->getService()->getPortableElementByIdentifier(
            $portableObject->getModel()->getId(),
            $portableObject->getTypeIdentifier()
        );

        if (is_null($compatibleRegisteredObject) && !is_null($latestVersionRegisteredObject)) {
            // @todo return a user exception to inform user of incompatible pci version found and that an item update
            //       is required
            throw new \common_Exception(
                'Unable to import pci asset because compatible version is not found. '
                    . 'Current version is ' . $latestVersionRegisteredObject->getVersion() . ' and imported is '
                . $portableObject->getVersion()
            );
        }

        $this->portableObjects[$typeId] = $portableObject;

        $files = array_merge(
            $entryPoint,
            $librariesFiles,
            $configFiles,
            $moduleFiles,
            $portableObject->getRuntimeKey('stylesheets'),
            $portableObject->getRuntimeKey('mediaFiles')
        );
        $this->requiredFiles = array_merge($this->requiredFiles, array_fill_keys($files, $typeId));
    }

    /**
     * Set the root directory of the QTI package, where the qti manifest.xml is located
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
     * Set the directory where the qti item qti.xml file is locate
     *
     * @param $itemDir
     * @return $this
     */
    public function setItemDir($itemDir)
    {
        $this->itemDir = $itemDir;
        return $this;
    }

    /**
     * Get the parsed portable objects
     *
     * @return array
     */
    public function getPortableObjects()
    {
        return $this->portableObjects;
    }

    /**
     * Do the import of portable elements
     */
    public function importPortableElements()
    {
        if (count($this->importingFiles) != count($this->requiredFiles)) {
            throw new \common_Exception(
                'Needed files are missing during Portable Element asset files '
                    . print_r($this->requiredFiles, true) . ' ' . print_r($this->importingFiles, true)
            );
        }

        /** @var PortableElementObject $object */
        foreach ($this->portableObjects as $object) {
            $lastVersionModel = $this->getService()->getPortableElementByIdentifier(
                $object->getModel()->getId(),
                $object->getTypeIdentifier()
            );
            // only register a pci that has not been register yet, subsequent update must be done through pci package
            // import
            if (is_null($lastVersionModel)) {
                $this->getService()->registerModel(
                    $object,
                    $object->getRegistrationSourcePath($this->source, $this->itemDir)
                );
            } else {
                \common_Logger::i(
                    'The imported item contains the portable element ' . $object->getTypeIdentifier()
                        . ' in a version ' . $object->getVersion() . ' compatible with the current '
                        . $lastVersionModel->getVersion()
                );
            }
        }
        return true;
    }

    /**
     * Replace the libs aliases with their relative url before saving into the registry
     * This format is consistent with the format of TAO portable package manifest
     *
     * @param PortableElementObject $object
     * @return PortableElementObject
     */
    private function replaceLibAliases(PortableElementObject $object)
    {

        $id = $object->getTypeIdentifier();
        $object->setRuntimeKey('libraries', array_map(function ($lib) use ($id) {
            if (preg_match('/^' . $id . '/', $lib)) {
                return $lib . '.js';
            }
            return $lib;
        }, $object->getRuntimeKey('libraries')));

        return $object;
    }

    private function isRelativePath($path)
    {
        return (strpos($path, 'http') !== 0);
    }
}
