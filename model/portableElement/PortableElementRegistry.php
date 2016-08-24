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

use oat\oatbox\AbstractRegistry;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementFileStorageException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementVersionIncompatibilityException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementFactory;
use oat\taoQtiItem\model\portableElement\common\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * CreatorRegistry stores reference to
 *
 * @package taoQtiItem
 */
class PortableElementRegistry extends AbstractRegistry implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;
    use PortableElementModelTrait;

    const REGISTRY_ID = 'portableElementRegistryEntries';

    protected $storage;

    protected function getExtension()
    {
        return \common_ext_ExtensionsManager::singleton()->getExtensionById('qtiItemPci');
    }

    protected function getConfigId()
    {
        return self::REGISTRY_ID;
    }

    protected function getConfig()
    {
        $registry = parent::getConfig();
        if (is_array($registry) && (isset($registry[$this->getModelName()]))) {
            return $registry[$this->getModelName()];
        }
        return [];
    }

    protected function setConfig($map)
    {
        $registry = $this->getExtension()->getConfig($this->getConfigId());
        $registry[$this->getModelName()] = $map;
        parent::setConfig($registry);
    }

    /**
     * @param PortableElementModel $model
     * @return PortableElementModel
     * @throws PortableElementNotFoundException
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function fetch(PortableElementModel $model)
    {
        $portableElements = $this->getAllVersions($model);

        // No version, return latest version
        if (! $model->hasVersion()) {
            krsort($portableElements);
            return $this->getModelFromArray(reset($portableElements));
        }

        // Version is set, return associated record
        if (isset($portableElements[$model->getVersion()])) {
            return $this->getModelFromArray($portableElements[$model->getVersion()]);
        }

        // Version is set, no record found
        throw new PortableElementNotFoundException(
            $this->getModelName() . ' with identifier ' . $model->getTypeIdentifier(). ' found, '
            . 'but version ' . $model->getVersion() . ' does not exist.'
        );
    }

    /**
     * Get all record versions regarding $model->getTypeIdentifier()
     *
     * @param PortableElementModel $model
     * @return array
     * @throws PortableElementNotFoundException
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    protected function getAllVersions(PortableElementModel $model)
    {
        $portableElements = parent::get($model->getTypeIdentifier());

        // No portable element found
        if ($portableElements == '') {
            throw new PortableElementNotFoundException(
                $this->getModelName() . ' with identifier ' . $model->getTypeIdentifier(). ' not found.'
            );
        }

        return $portableElements;
    }

    /**
     * @param PortableElementModel $model
     * @return bool
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function has(PortableElementModel $model)
    {
        try {
            return (bool) $this->fetch($model);
        } catch (PortableElementNotFoundException $e) {
            return false;
        }
    }

    /**
     * @param PortableElementModel $model
     */
    public function update(PortableElementModel $model)
    {
        parent::set($model->getTypeIdentifier(), [$model->getVersion() => $model->toArray()]);
    }

    /**
     * @param PortableElementModel $model
     * @throws PortableElementNotFoundException
     * @throws PortableElementVersionIncompatibilityException
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function delete(PortableElementModel $model)
    {
        $portableElements = $this->getAllVersions($model);

        if (! isset($portableElements[$model->getVersion()])) {
            throw new PortableElementVersionIncompatibilityException(
                $this->getModelName() . ' with identifier ' . $model->getTypeIdentifier(). ' found, '
                . 'but version ' . $model->getVersion() . 'does not exist. Deletion impossible.'
            );
        }

        unset($portableElements[$model->getVersion()]);
        if (empty($portableElements)) {
            parent::remove($model->getTypeIdentifier());
        } else {
            parent::set($model->getTypeIdentifier(), $portableElements);
        }
    }

    /**
     * @param PortableElementModel $model
     * @throws PortableElementNotFoundException
     */
    public function removeAllVersions(PortableElementModel $model)
    {
        if (! $this->isRegistered($model->getTypeIdentifier())) {
            throw new PortableElementNotFoundException(
                'Unable to find portable element into registry. Deletion impossible.'
            );
        }

        foreach ($this->getAllVersions($model) as $version) {
            $this->unregister($this->getModelFromArray($version));
        }
    }

    /**
     * Unregister all previously registered pci, in all version
     * Remove all assets
     */
    public function removeAll()
    {
        $portableElements = $this->getMap();
        foreach ($portableElements as $identifier => $versions) {
            $this->resetModel();
            $this->removeAllVersions($this->getModel()->setTypeIdentifier($identifier));
        }
    }

    /**
     * Unregister portable element by removing the given version data & asset files
     * If $model doesn't have version, all versions will be removed
     *
     * @param PortableElementModel $model
     * @throws PortableElementNotFoundException
     * @throws PortableElementVersionIncompatibilityException
     * @throws \common_Exception
     */
    public function unregister(PortableElementModel $model)
    {
        $model = $this->fetch($model);

        if (! $model->hasVersion()) {
            $this->removeAllVersions($model);
        } else {
            $this->removeAssets($model);
            $this->delete($model);
        }
    }

    /**
     * @param PortableElementModel $model
     * @return PortableElementModel
     * @throws PortableElementNotFoundException
     */
    public function getLatestVersion(PortableElementModel $model)
    {
        $portableElements = $this->getAllVersions($model);
        krsort($portableElements);
        return $this->getModelFromArray(reset($portableElements));
    }

    /**
     * @param PortableElementModel $model
     * @throws PortableElementVersionIncompatibilityException
     * @throws \common_Exception
     */
    public function register(PortableElementModel $model)
    {
        try {
            $latestVersion = $this->getLatestVersion($model);
            if(version_compare($model->getVersion(), $latestVersion->getVersion(), '<')){
                throw new PortableElementVersionIncompatibilityException(
                    'A newer version of the code already exists ' . $latestVersion->getVersion()
                );
            }
        } catch (PortableElementNotFoundException $e) {
            if (! $model->hasVersion()) {
                $model->setVersion = '0.0.0';
            }
            // The portable element to register does not exist, continue
        }

        $files = $this->getFilesFromPortableElement($model);
        $this->getFileSystem()->registerFiles($model, $files);

        //saveModel must be executed last because it may affects the model itself
        $this->replaceAliasesToPath($model);

        $this->update($model);
    }

    /**
     * Adjust file resource entries from {QTI_NS}/xxx/yyy.js to ./xxx/yyy.js
     *
     * @param PortableElementModel $model
     * @param array $keys
     */
    private function replaceAliasesToPath(PortableElementModel &$model, array $keys = [])
    {
        if (empty($keys)) {
            $keys = ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon'];
        }

        foreach ($keys as $key) {
            if ($model->hasRuntimeKey($key)) {
                $model->setRuntimeKey(
                    $key, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getRuntimeKey($key))
                );
            }
            if($model->hasCreatorKey($key)) {
                $model->setCreatorKey(
                    $key, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getCreatorKey($key))
                );
            }
        }
    }

    /**
     * Adjust file resource entries from ./xxx/yyy.js to {QTI_NS}/xxx/yyy.js
     *
     * @param PortableElementModel $model
     * @param array $keys
     */
    public function replacePathToAliases(PortableElementModel &$model, array $keys = [])
    {
        if (empty($keys)) {
            $keys = ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon'];
        }

        foreach ($keys as $key) {
            if ($model->hasRuntimeKey($key)) {
                $model->setRuntimeKey(
                    $key, preg_replace('/^(.\/)(.*)/', $model->getTypeIdentifier() . "/$2", $model->getRuntimeKey($key))
                );
            }
            if($model->hasCreatorKey($key)) {
                $model->setCreatorKey(
                    $key, preg_replace('/^(.\/)(.*)/', $model->getTypeIdentifier() . "/$2", $model->getCreatorKey($key))
                );
            }
        }
    }

    /**
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
     * Return the runtime of a portable element
     *
     * @param PortableElementModel $model
     * @return PortableElementModel
     * @throws PortableElementNotFoundException
     */
    protected function getRuntime(PortableElementModel $model)
    {
        $model = $this->fetch($model);
        $this->replacePathToAliases($model);
        $runtime = $model->toArray();
        $runtime['baseUrl'] = $this->getBaseUrl($model);
        return $runtime;
    }

    /**
     * @return array
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function getLatestRuntimes()
    {
        $all = [];
        foreach ($this->getMap() as $typeIdentifier => $versions) {

            if (empty($versions)) {
                continue;
            }

            krsort($versions);
            $model = $this->getModelFromArray(reset($versions));
            $all[$typeIdentifier] = [$this->getRuntime($model)];
        }
        return $all;
    }


    /**
     * @return PortableElementModel[]
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function getLatestCreators()
    {
        $all = [];
        foreach ($this->getMap() as $typeIdentifier => $versions) {

            if (empty($versions)) {
                continue;
            }

            krsort($versions);
            $model = $this->getModelFromArray(reset($versions));
            if (! empty($model->getCreator())) {
                $all[$typeIdentifier] = $model;
            }
        }
        return $all;
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
        if (! $model->hasVersion()) {
            throw new PortableElementVersionIncompatibilityException('Unable to delete asset files whitout model version.');
        }

        $model = $this->fetch($model);

        $files[] = array_merge($model->getRuntime(), $model->getCreator());
        $filesToRemove = [];
        foreach ($files as $key => $file) {
            if (is_array($file)) {
                array_merge($filesToRemove, $file);
            } else {
                $filesToRemove[] = $file;
            }
        }

        if (empty($filesToRemove)) {
            return true;
        }

        if (!$this->getFileSystem()->unregisterFiles($model, $filesToRemove)) {
            throw new PortableElementFileStorageException(
                'Unable to delete asset files for PCI "' . $model->getTypeIdentifier()
                . '" at version "' . $model->getVersion() . '"'
            );
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

    /**
     * Get the fly filesystem based on OPTION_FS configuration
     *
     * @return PortableElementFileStorage
     */
    public function getFileSystem()
    {
        if (!$this->storage) {
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
     * Return the absolute url of PCI storage
     *
     * @param PortableElementModel $model
     * @return string
     * @throws PortableElementNotFoundException
     */
    protected function getBaseUrl(PortableElementModel $model)
    {
        $model = $this->fetch($model);
        return $this->getFileSystem()->getFileUrl($model);
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
}
