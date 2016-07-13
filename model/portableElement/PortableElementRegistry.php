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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement;

use \common_ext_ExtensionsManager;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementFactory;
use oat\taoQtiItem\model\portableElement\common\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * CreatorRegistry stores reference to
 *
 * @package qtiItemPci
 */
class PortableElementRegistry implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;
    use PortableElementModelTrait;

    protected $storage;
    protected $source;

    public function __construct()
    {
        if (!$this->getServiceLocator()) {
            $this->setServiceLocator(ServiceManager::getServiceManager());
        }
    }

    /**
     * Return all PCIs from self::CONFIG_ID mapping
     *
     * @return array
     * @throws \common_ext_ExtensionException
     */
    protected function getMap()
    {
        $map = \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->getConfig(
            'qtiItemPci/pciRegistryEntries'
        );
        if(empty($map)){
            $map = [];
        }
        return $map;
    }

    /**
     * Set PCIs from self::CONFIG_ID mapping
     *
     * @param $map
     * @throws \common_ext_ExtensionException
     */
    protected function setMap($map)
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci')->setConfig(
            'qtiItemPci/pciRegistryEntries', $map
        );
    }

    /**
     * Get the fly filesystem based on OPTION_FS configuration
     *
     * @return PortableElementFileStorage
     */
    public function getFileSystem()
    {
        if (!$this->storage) {
//            var_dump($this->getServiceLocator());
            $this->storage = $this->getServiceLocator()
                ->get(PortableElementFileStorage::SERVICE_ID)
                ->setServiceLocator($this->getServiceLocator());
        }
        return $this->storage;
    }

    /**
     * Set source of directory where extracted zip is located
     *
     * @param $source
     * @return $this
     * @throws \common_Exception
     */
    public function setSource($source)
    {
        $this->getFileSystem()->setSource($source);
        return $this;
    }

    /**
     * Return the last version of a PCI track by $typeIdentifier
     *
     * @param $typeIdentifier
     * @return mixed|null
     */
    public function getLatestVersion($typeIdentifier)
    {
        return $this->get($typeIdentifier);
    }

    /**
     * Check if PCI exists into self::CONFIG_ID mapping
     *
     * @param PortableElementModel $model
     * @return bool
     */
    public function exists(PortableElementModel $model)
    {
        $pcis = $this->getMap();

        if (empty($pcis) || !isset($pcis[$model->getTypeIdentifier()])) {
            return false;
        }

        if (!$model->hasVersion()) {
            $model = $this->getLatestVersion($model->getTypeIdentifier());
        }

        if ($model !== null) {
            return (isset($pcis[$model->getTypeIdentifier()][$model->getVersion()]));
        }

        return false;
    }

    /**
     * Get a PCI from identifier/version
     *
     * @refactor use PortableElementModel instead of PciModel
     *
     * @param $identifier
     * @param null $version
     * @return $pciModel|null
     */
    public function get($identifier, $version=null)
    {
        $pcis = $this->getMap();
        if (!isset($pcis[$identifier])) {
            return null;
        }

        $model = new PciModel();
        $pci = $pcis[$identifier];
        if (is_null($version) && !empty($pci)) {
            //return the latest version
            krsort($pci);
            return $model->exchangeArray(reset($pci));
        } else {
            if (isset($pci[$version])) {
                return $model->exchangeArray($pci[$version]);
            } else {
                return null;
            }
        }
    }

    /**
     * Populate a PciModel from PCIs map
     *
     * @param PortableElementModel $model
     * @return $this|null|PciRegistry
     */
    public function retrieve(PortableElementModel $model)
    {
        return $this->get($model->getTypeIdentifier(), $model->getVersion());
    }

    /**
     * Register a PCI in a specific version
     *
     * @param PortableElementModel $model
     * @throws \common_Exception
     */
    public function register(PortableElementModel $model)
    {
        $latestVersion = $this->getLatestVersion($model->getTypeIdentifier());
        if ($latestVersion) {
            if(version_compare($model->getVersion(), $latestVersion->getVersion(), '<')){
                throw new \common_Exception('A newer version of the code already exists ' . $latestVersion->getVersion());
            }
        }

        $files = $this->getFilesFromPortableElement($model);
        $this->getFileSystem()->registerFiles($model, $files);

        //saveModel must be executed last because it may affects the model itself
        $this->replaceAliases($model, 'hook');
        $this->replaceAliases($model, 'libraries');
        $this->replaceAliases($model, 'stylesheets');
        $this->replaceAliases($model, 'mediaFiles');

        $this->saveModel($model);
    }

    /**
     * Save the portable model to persistence
     *
     * @param PortableElementModel $model
     */
    private function saveModel(PortableElementModel $model){
        $pcis = $this->getMap();
        $pcis[$model->getTypeIdentifier()][$model->getVersion()] = $model->toArray();
        $this->setMap($pcis);
    }

    /**
     * Adjust file resource entries where {QTI_NS}/xxx/yyy.js is equivalent to ./xxx/yyy.js
     *
     * @refactor CreatorKey is implementation of PCiModel not PortableElementModel
     *
     * @param PortableElementModel $model
     * @param string $keyName
     */
    private function replaceAliases(PortableElementModel $model, $keyName){
        $model->setRuntimeKey($keyName, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getRuntimeKey($keyName)));
        if($model->hasCreatorKey($keyName)){
            $model->setCreatorKey($keyName, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getCreatorKey($keyName)));
        }
    }

    /**
     *
     * @param PortableElementModel $model
     * @return array
     * @throws \common_Exception
     */
    protected function getFilesFromPortableElement(PortableElementModel $model)
    {
        $validator = PortableElementFactory::getValidator($model);
        return $validator->getRequiredAssets();
    }

    /**
     * Return the absolute url of PCI storage
     *
     * @refactor use PortableElementModel instead of PciModel
     * @param $typeIdentifier
     * @param string $version
     * @return bool|string
     */
    public function getBaseUrl($typeIdentifier, $version = null)
    {
        $model = new PciModel($typeIdentifier, $version);
        if ($this->exists($model)) {
            return $this->getFileSystem()->getFileUrl($model);
        }
        return false;
    }

    /**
     * @param PortableElementModel $model
     * @param $file
     * @return bool|false|resource
     * @throws \common_Exception
     */
    public function getFileStream(PortableElementModel $model, $file)
    {
        return $this->getFileSystem()->getFileStream($model, $file);
    }

    /**
     * Unregister PCI by removing the given version data & asset files
     * If $pciModel doesn't have version, all versions will be removed
     *
     * @param PortableElementModel $model
     * @return bool
     * @throws \common_Exception
     */
    public function unregister(PortableElementModel $model)
    {
        if (!$this->exists($model)) {
            throw new \InvalidArgumentException('Identifier "' . $model->getTypeIdentifier() . '" to remove is not found in PCI map');
        }
        
        $this->removeAssets($model);
        $this->removeMapPci($model);
        return true;
    }

    /**
     * Return the runtime of PCI
     *
     * @param $typeIdentifier
     * @param string $version
     * @return array|string
     * @throws \common_Exception
     */
    protected function getRuntime($typeIdentifier, $version = '')
    {
        $pcis = $this->getMap();
        if (isset($pcis[$typeIdentifier])) {
            if (empty($version)) {
                $version = $this->getLatestVersion($typeIdentifier)->getVersion();
            }
            if  ($pcis[$typeIdentifier][$version]) {
                $pci = $this->addPathPrefix($typeIdentifier, $pcis[$typeIdentifier][$version]);
                $pci['version'] = $version;
                $pci['baseUrl'] = $this->getBaseUrl($typeIdentifier, $version);
                return $pci;
            } else {
                throw new \common_Exception('The pci does not exist in the requested version : '.$typeIdentifier.' '.$version);
            }
        } else {
            throw new \common_Exception('The pci does not exist : '.$typeIdentifier);
        }
    }
    
    /**
     * Return the path prefix associated to couple of $identifier/$var
     *
     * @param $typeIdentifier
     * @param $var
     * @return array|string
     */
    protected function addPathPrefix($typeIdentifier, $var)
    {
        if (is_string($var)) {
            return preg_replace('/^(.\/)(.*)/', $typeIdentifier."/$2", $var);
        } elseif (is_array($var)) {
            foreach ($var as $k => $v) {
                $var[$k] = $this->addPathPrefix($typeIdentifier, $v);
            }
            return $var;
        } else if (is_null($var)) {
            return '';
        } else {
            throw new \InvalidArgumentException("$var must be a string or an array");
        }
    }

    /**
     * Get all PCI in latest version
     *
     * @return array
     * @throws \common_Exception
     */
    public function getLatestRuntimes()
    {
        $all = [];
        $pcis = array_keys($this->getMap());
        foreach ($pcis as $typeIdentifier) {
            $model = $this->getLatestVersion($typeIdentifier);
            $pci = $this->getRuntime($typeIdentifier, $model->getVersion());
            $all[$typeIdentifier] = [$pci];
        }
        return $all;
    }


    public function getLatestCreators()
    {
        $all = [];
        $pcis = array_keys($this->getMap());
        foreach ($pcis as $typeIdentifier) {
            $model = $this->getLatestVersion($typeIdentifier);
            if(!empty($model->getCreator())){
                $all[$typeIdentifier] = $model;
            }
        }
        return $all;
    }
    
    /**
     * Unregister all previously registered pci, in all version
     * Remove all assets
     */
    public function unregisterAll()
    {
        $pcis = $this->getMap();
        foreach(array_keys($pcis) as $typeIdentifier){
            $this->removeAssets(new PciModel($typeIdentifier));
        }
        $this->setMap([]);
        return true;
    }
    
    /**
     * Unregister a previously registered pci, in all version
     */
    public function unregisterPortableElement($typeIdentifier)
    {
        $unregistered = true;
        $pcis = $this->getMap();
        if(isset($pcis[$typeIdentifier])){
            foreach(array_keys($pcis[$typeIdentifier]) as $version){
                $unregistered &= $this->unregister(new PciModel($typeIdentifier, $version));
            }
        }
        return $unregistered;
    }

    /**
     * Remove a record in PCIs map by identifier
     *
     * @param PortableElementModel $model
     * @return bool
     * @throws \common_Exception
     */
    protected function removeMapPci(PortableElementModel $model)
    {
        $pcis = $this->getMap();
        if (isset($pcis[$model->getTypeIdentifier()]) &&
            isset($pcis[$model->getTypeIdentifier()][$model->getVersion()])
        ) {
            unset($pcis[$model->getTypeIdentifier()]);
            $this->setMap($pcis);
            return true;
        }
        throw new \common_Exception('Unable to find Pci into PCIs map. Deletion impossible.');
    }

    /**
     * Get a record in PCIs map by identifier
     *
     * @param PortableElementModel $model
     * @return null
     */
    protected function getMapPci(PortableElementModel $model)
    {
        $pcis = $this->getMap();
        if (isset($pcis[$model->getTypeIdentifier()])) {
            return $pcis[$model->getTypeIdentifier()];
        }
        return null;
    }

    /**
     * Remove all registered files for a PCI identifier from FileSystem
     * If $targetedVersion is given, remove only assets for this version
     *
     * @param PortableElementModel $model
     * @return bool
     * @throws \common_Exception
     */
    protected function removeAssets(PortableElementModel $model)
    {
        $versions = $this->getMapPci($model);
        if (!$versions) {
            return true;
        }
        foreach ($versions as $version => $files) {
            if (!$model->hasVersion() || $version==$model->getVersion()) {

                $hook        = (isset($files['hook']) && is_array($files['hook'])) ? $files['hook'] : [];
                $libs        = (isset($files['libs']) && is_array($files['libs'])) ? $files['libs'] : [];
                $stylesheets = (isset($files['stylesheets']) && is_array($files['stylesheets'])) ? $files['stylesheets'] : [];
                $mediaFiles  = (isset($files['mediaFiles']) && is_array($files['mediaFiles'])) ? $files['mediaFiles'] : [];

                $allFiles = array_merge($hook, $libs, $stylesheets, $mediaFiles);
                if (empty($allFiles)) {
                    continue;
                }
                if (!$this->getFileSystem()->unregisterFiles($model, array_keys($allFiles))) {
                    throw new \common_Exception('Unable to delete asset files for PCI "' . $model->getTypeIdentifier()
                        . '" at version "' . $model->getVersion() . '"');
                }
            }
        }
        return true;
    }

    /**
     * Create an temp export tree and return path
     *
     * @param PortableElementModel $model
     * @return string
     */
    protected function getZipLocation(PortableElementModel $model)
    {
        return \tao_helpers_Export::getExportPath() . DIRECTORY_SEPARATOR . 'pciPackage_' . $model->getTypeIdentifier() . '.zip';
    }

    /**
     * Get list of files following Pci Model
     *
     * @param PortableElementModel $model
     * @return array
     * @throws \common_Exception
     */
    protected function getFilesFromModel(PortableElementModel $model)
    {
        $validator = PortableElementFactory::getValidator($model);
        return $validator->getRequiredAssets();
    }

    /**
     * Get manifest representation of Pci Model
     *
     * @param PortableElementModel $model
     * @return string
     */
    public function getManifest(PortableElementModel $model)
    {
        return json_encode($model->toArray(), JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    }

    /**
     * Export a pci to a zip package
     *
     * @param PortableElementModel $model
     * @return string
     * @throws \common_Exception
     */
    public function export(PortableElementModel $model)
    {
        $zip = new \ZipArchive();
        $path = $this->getZipLocation($model);

        if ($zip->open($path, \ZipArchive::CREATE) !== TRUE) {
            throw new \common_Exception('Unable to create zipfile ' . $path);
        }

        $manifest = $this->getManifest($model);
        $zip->addFromString($model->getManifestName(), $manifest);

        $files = $this->getFilesFromModel($model);
        $filesystem = $this->getFileSystem();
        foreach ($files as $file) {
            $zip->addFromString($file, $filesystem->getFileContentFromModelStorage($model, $file));
        }

        $zip->close();
        return $path;
    }
}
