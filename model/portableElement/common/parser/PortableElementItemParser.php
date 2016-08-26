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

namespace oat\taoQtiItem\model\portableElement\common\parser;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\portableElement\common\helper\Manifest;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\pic\model\PicModel;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Element;

class PortableElementItemParser
{
    /**
     * @var Item
     */
    protected $qtiModel;

    protected $importingFiles = [];
    protected $requiredFiles = [];
    protected $portableModels = [];
    protected $picModels = [];

    protected $source;
    protected $service;

    /**
     * @return PortableElementService
     */
    public function getService()
    {
        if (!$this->service) {
            $this->service = new PortableElementService();
            $this->service->setServiceLocator(ServiceManager::getServiceManager());
        }
        return $this->service;
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
        $this->portableModels = [];
        $this->picModels = [];

        $pcis = $item->getComposingElements('oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction');
        foreach($pcis as $pci) {
            $this->parsePortableElement(new PciModel(), $pci);
        }

        $pics = $item->getComposingElements('oat\taoQtiItem\model\qti\PortableInfoControl');
        foreach($pics as $pic) {
            $this->parsePortableElement(new PicModel(), $pic);
        }
    }

    /**
     * Parse individual portable element into the given portable model
     *
     * @param PortableElementModel $portableModel
     * @param Element $portableElement
     * @throws \common_Exception
     */
    protected function parsePortableElement(PortableElementModel $portableModel, Element $portableElement){

        $typeId = $portableElement->getTypeIdentifier();
        $libs = [];
        $requiredLibFiles = [];

        //Adjust file resource entries where {QTI_NS}/xxx/yyy is equivalent to {QTI_NS}/xxx/yyy.js
        foreach($portableElement->getLibraries() as $lib){
            if(preg_match('/^'.$typeId.'.*\.js$/', $lib) && substr($lib, -3) != '.js') {//filter shared stimulus
                $requiredLibFiles[] = $lib.'.js';//amd modules
                $libs[] = $lib.'.js';
            }else{
                $libs[] = $lib;
            }
        }

        $portableModel->exchangeArray([
            'typeIdentifier' => $typeId,
            'version' => $portableElement->getVersion(),
            'label' => $typeId,
            'short' => $typeId,
            'runtime' => [
                'hook' => $portableElement->getEntryPoint(),
                'libraries' => $libs,
                'stylesheets' => $portableElement->getStylesheets(),
                'mediaFiles' => $portableElement->getMediaFiles(),
            ]
        ]);

        $lastVersionModel = $this->getService()->getPciByIdentifier($portableModel->getTypeIdentifier());
        if (!is_null($lastVersionModel)
            && (intval($lastVersionModel->getVersion()) != intVal($portableModel->getVersion()))
        ) {
            //@todo return a user exception to inform user of incompatible pci version found and that an item update is required
            throw new \common_Exception('Unable to import pci asset because pci is not compatible. '
                . 'Current version is ' . $lastVersionModel->getVersion() . ' and imported is ' . $portableModel->getVersion());
        }

        $this->portableModels[$typeId] = $portableModel;

        $files = array_merge([$portableModel->getRuntimeKey('hook')], $requiredLibFiles, $portableModel->getRuntimeKey('stylesheets'), $portableModel->getRuntimeKey('mediaFiles'));
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
            throw new \common_Exception('Needed files are missing during Portable Element asset files');
        }

        foreach ($this->portableModels as $model) {
            $lastVersionModel = $this->getService()->getPciByIdentifier($model->getTypeIdentifier());
            //only register a pci that has not been register yet, subsequent update must be done through pci package import
            if(is_null($lastVersionModel)){
                $this->replaceLibAliases($model);
                $this->getService()->registerModel($model, $this->source.DIRECTORY_SEPARATOR.$model->getTypeIdentifier().DIRECTORY_SEPARATOR);
            }else{
                \common_Logger::i('The imported item contains the portable element '.$model->getTypeIdentifier()
                    .' in a version '.$model->getVersion().' compatible with the current '.$lastVersionModel->getVersion());
            }
        }
        return true;
    }

    /**
     * Replace the libs aliases with their relative url before saving into the registry
     * This format is consistent with the format of TAO portable package manifest
     *
     * @param PortableElementModel $model
     * @return PortableElementModel
     */
    private function replaceLibAliases(PortableElementModel $model){

        $id = $model->getTypeIdentifier();
        $model->setRuntimeKey('libraries', array_map(function($lib) use ($id){
            if(preg_match('/^'.$id.'/', $lib)){
                return $lib.'.js';
            }
            return $lib;
        }, $model->getRuntimeKey('libraries')));

        Manifest::replaceAliasesToPath($model);

        return $model;
    }
}