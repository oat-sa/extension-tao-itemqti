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

use oat\qtiItemPci\model\portableElement\dataObject\IMSPciDataObject;
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
            throw new \common_Exception('trying to import an asset that is not part of the portable element asset list');
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
    public function getFileInfo($path, $relPath) {

        if (file_exists($path)) {
            return array(
                'name' => basename($path),
                'uri' => $relPath,
                'mime' => \tao_helpers_File::getMimeType($path),
                'filePath' => $path,
                'size' => filesize($path),
            );
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
            foreach($portableElementsXml as $portableElementXml) {
                $this->parsePortableElement($model, $portableElementXml);
            }
        }
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
        $requiredLibFiles = [];
        $entryPoint = [];

        //Adjust file resource entries where {QTI_NS}/xxx/yyy is equivalent to {QTI_NS}/xxx/yyy.js
        foreach($portableElement->getLibraries() as $lib){
            if(preg_match('/^'.$typeId.'.*\.js$/', $lib) && substr($lib, -3) != '.js') {//filter shared stimulus
                $requiredLibFiles[] = $lib.'.js';//amd modules
                $libs[] = $lib.'.js';
            }else{
                $libs[] = $lib;
            }
        }

        $moduleFiles = [];
        $emptyModules = [];//list of modules that are referenced directly in the module node
        foreach($portableElement->getModules() as $id => $paths){
            if(empty($paths)){
                $emptyModules[] = $id;
                continue;
            }
            foreach($paths as $path){
                if(strpos($path, 'http') !== 0){
                    //only copy into data the relative files
                    $moduleFiles[] = $path;
                }
            }
        }

        //TODO add strategy to portable Elements...
        foreach($portableElement->getConfig() as $configFile){
            //only read local config file
            if(strpos($configFile, 'http') !== 0){
                $confFile = $this->source.'/'.$configFile;
                $configData = json_decode(file_get_contents($confFile), true);
                if(isset($configData['paths'])){
                    foreach($configData['paths'] as $id => $path){
                        if(strpos($path, 'http') !== 0){
                            //only copy into data the relative files
                            $moduleFiles[] = $path;
                        }
                    }
                }
            }
        }

        if(!empty($portableElement->getEntryPoint())){
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
                'config' => $portableElement->getConfig(),
                'modules' => $portableElement->getModules()
            ]
        ];

        /** @var PortableElementObject $portableObject */
        $portableObject = $model->createDataObject($data);

        $lastVersionModel = $this->getService()->getPortableElementByIdentifier(
            $portableObject->getModel()->getId(),
            $portableObject->getTypeIdentifier()
        );

        if (!is_null($lastVersionModel)
            && (intval($lastVersionModel->getVersion()) != intVal($portableObject->getVersion()))
        ) {
            //@todo return a user exception to inform user of incompatible pci version found and that an item update is required
            throw new \common_Exception('Unable to import pci asset because pci is not compatible. '
                . 'Current version is ' . $lastVersionModel->getVersion() . ' and imported is ' . $portableObject->getVersion());
        }

        $this->portableObjects[$typeId] = $portableObject;

        $files = array_merge(
            $entryPoint,
            $requiredLibFiles,
            $moduleFiles,
            $portableObject->getRuntimeKey('stylesheets'),
            $portableObject->getRuntimeKey('mediaFiles'),
            $portableObject->getRuntimeKey('config')
        );
        $this->requiredFiles = array_merge($this->requiredFiles, array_fill_keys($files, $typeId));
    }

    public function setSource($source)
    {
        $this->source = $source;
        return $this;
    }

    /**
     * Do the import of portable elements
     */
    public function importPortableElements()
    {
        if (count($this->importingFiles) != count($this->requiredFiles)) {
            var_dump(__LINE__, $this->importingFiles, $this->requiredFiles);
            throw new \common_Exception('Needed files are missing during Portable Element asset files');
        }

        /** @var PortableElementObject $object */
        foreach ($this->portableObjects as $object) {
            $lastVersionModel = $this->getService()->getPortableElementByIdentifier(
                $object->getModel()->getId(),
                $object->getTypeIdentifier()
            );
            //only register a pci that has not been register yet, subsequent update must be done through pci package import
            if (is_null($lastVersionModel)){

                //TODO add strategy to PCI data obj
                if($object instanceof IMSPciDataObject){
                    $this->getService()->registerModel(
                        $object,
                        $this->source . DIRECTORY_SEPARATOR
                    );
                }else{
                    $this->replaceLibAliases($object);
                    $this->getService()->registerModel(
                        $object,
                        $this->source . DIRECTORY_SEPARATOR . $object->getTypeIdentifier() . DIRECTORY_SEPARATOR
                    );
                }

            } else {
                \common_Logger::i('The imported item contains the portable element '.$object->getTypeIdentifier()
                    .' in a version '.$object->getVersion().' compatible with the current '.$lastVersionModel->getVersion());
            }
        }
        return true;
    }

    public function getPortableObjects(){
        return $this->portableObjects;
    }

    /**
     * Replace the libs aliases with their relative url before saving into the registry
     * This format is consistent with the format of TAO portable package manifest
     *
     * @param PortableElementObject $object
     * @return PortableElementObject
     */
    private function replaceLibAliases(PortableElementObject $object){

        $id = $object->getTypeIdentifier();
        $object->setRuntimeKey('libraries', array_map(function($lib) use ($id) {
            if(preg_match('/^'.$id.'/', $lib)){
                return $lib.'.js';
            }
            return $lib;
        }, $object->getRuntimeKey('libraries')));

        return $object;
    }
}