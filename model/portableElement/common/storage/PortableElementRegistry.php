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

namespace oat\taoQtiItem\model\portableElement\common\storage;

use oat\oatbox\AbstractRegistry;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementFileStorageException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementVersionIncompatibilityException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementObject;
use oat\taoQtiItem\model\portableElement\PortableElementFileStorage;
use oat\taoQtiItem\model\portableElement\helper\Manifest;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * CreatorRegistry stores reference to
 *
 * @package taoQtiItem
 */
abstract class PortableElementRegistry extends AbstractRegistry implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;
    use PortableElementModelTrait;

    protected $storage;

    /**
     * @param PortableElementObject $object
     * @return PortableElementObject
     * @throws PortableElementNotFoundException
     * @throws PortableElementInconsistencyModelException
     */
    public function fetch(PortableElementObject $object)
    {
        $portableElements = $this->getAllVersions($object->getTypeIdentifier());

        // No version, return latest version
        if (! $object->hasVersion()) {
            krsort($portableElements);
            return $object->exchangeArray(reset($portableElements));
        }

        // Version is set, return associated record
        if (isset($portableElements[$object->getVersion()])) {
            return $object->exchangeArray($portableElements[$object->getVersion()]);
        }

        // Version is set, no record found
        throw new PortableElementNotFoundException(
            $this->getModel()->getId() . ' with identifier ' . $object->getTypeIdentifier(). ' found, '
            . 'but version ' . $object->getVersion() . ' does not exist.'
        );
    }

    /**
     * Get all record versions regarding $model->getTypeIdentifier()
     *
     * @param string $identifier
     * @return array
     * @throws PortableElementNotFoundException
     * @throws PortableElementInconsistencyModelException
     */
    protected function getAllVersions($identifier)
    {
        $portableElements = parent::get($identifier);

        // No portable element found
        if ($portableElements == '') {
            throw new PortableElementNotFoundException(
                $this->getModel()->getId() . ' with identifier "' . $identifier . '" not found.'
            );
        }

        return $portableElements;
    }

    /**
     * @param PortableElementObject $object
     * @return bool
     * @throws PortableElementInconsistencyModelException
     */
    public function has(PortableElementObject $object)
    {
        try {
            return (bool) $this->fetch($object);
        } catch (PortableElementNotFoundException $e) {
            return false;
        }
    }

    /**
     * @param PortableElementObject $object
     */
    public function update(PortableElementObject $object)
    {
        parent::set($object->getTypeIdentifier(), [$object->getVersion() => $object->toArray()]);
    }

    /**
     * @param PortableElementObject $object
     * @throws PortableElementNotFoundException
     * @throws PortableElementVersionIncompatibilityException
     * @throws PortableElementInconsistencyModelException
     */
    public function delete(PortableElementObject $object)
    {
        $portableElements = $this->getAllVersions($object->getTypeIdentifier());

        if (! isset($portableElements[$object->getVersion()])) {
            throw new PortableElementVersionIncompatibilityException(
                $this->getModel()->getId() . ' with identifier ' . $object->getTypeIdentifier(). ' found, '
                . 'but version ' . $object->getVersion() . 'does not exist. Deletion impossible.'
            );
        }

        unset($portableElements[$object->getVersion()]);
        if (empty($portableElements)) {
            parent::remove($object->getTypeIdentifier());
        } else {
            parent::set($object->getTypeIdentifier(), $portableElements);
        }
    }

    /**
     * @param string $identifier
     * @throws PortableElementNotFoundException
     */
    public function removeAllVersions($identifier)
    {
        if (! $this->isRegistered($identifier)) {
            throw new PortableElementNotFoundException(
                'Unable to find portable element (' . $identifier . ') into registry. Deletion impossible.'
            );
        }

        foreach ($this->getAllVersions($identifier) as $version) {
            $this->unregister($this->getModel()->createDataObject($version));
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
            $this->removeAllVersions($identifier);
        }
    }

    /**
     * Unregister portable element by removing the given version data & asset files
     * If $model doesn't have version, all versions will be removed
     *
     * @param PortableElementObject $object
     * @throws PortableElementNotFoundException
     * @throws PortableElementVersionIncompatibilityException
     * @throws \common_Exception
     */
    public function unregister(PortableElementObject $object)
    {
        $object = $this->fetch($object);

        if (! $object->hasVersion()) {
            $this->removeAllVersions($object);
        } else {
            $this->removeAssets($object);
            $this->delete($object);
        }
    }

    /**
     * @param string $identifier
     * @return PortableElementObject
     * @throws PortableElementNotFoundException
     */
    public function getLatestVersion($identifier)
    {
        $portableElements = $this->getAllVersions($identifier);
        //usort
        krsort($portableElements);

        return $this->getModel()->createDataObject(reset($portableElements));
    }

    /**
     * @param PortableElementObject $object
     * @throws PortableElementVersionIncompatibilityException
     * @throws \common_Exception
     */
    public function register(PortableElementObject $object)
    {
        try {
            $latestVersion = $this->getLatestVersion($object->getTypeIdentifier());
            if(version_compare($object->getVersion(), $latestVersion->getVersion(), '<')){
                throw new PortableElementVersionIncompatibilityException(
                    'A newer version of the code already exists ' . $latestVersion->getVersion()
                );
            }
        } catch (PortableElementNotFoundException $e) {
            if (! $object->hasVersion()) {
                $object->setVersion('0.0.0');
            }
            // The portable element to register does not exist, continue
        }

        $files = $this->getFilesFromPortableElement($object);
        $this->getFileSystem()->registerFiles($object, $files);

        //saveModel must be executed last because it may affects the model itself
        Manifest::replaceAliasesToPath($object);

        $this->update($object);
    }

//    /**
//     * Adjust file resource entries from {QTI_NS}/xxx/yyy.js to ./xxx/yyy.js
//     *
//     * @param PortableElementModel $model
//     * @param array $keys
//     */
//    private function replaceAliasesToPath(PortableElementObject &$object, array $keys = [])
//    {
//        if (empty($keys)) {
//            $keys = ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon'];
//        }
//
//        foreach ($keys as $key) {
//            if ($model->hasRuntimeKey($key)) {
//                $model->setRuntimeKey(
//                    $key, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getRuntimeKey($key))
//                );
//            }
//            if($model->hasCreatorKey($key)) {
//                $model->setCreatorKey(
//                    $key, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getCreatorKey($key))
//                );
//            }
//        }
//    }

    /**
     * Get list of files following Pci Model
     *
     * @param PortableElementObject $object
     * @return array
     * @throws \common_Exception
     */
    protected function getFilesFromPortableElement(PortableElementObject $object)
    {
        $validator = $object->getModel()->getValidator();
        return $validator->getRequiredAssets($object);
    }

    /**
     * Return the runtime of a portable element
     *
     * @param PortableElementObject $object
     * @return PortableElementObject
     * @throws PortableElementNotFoundException
     */
    protected function getRuntime(PortableElementObject $object)
    {
        $object = $this->fetch($object);
        Manifest::replacePathToAliases($object);
        $runtime = $object->toArray();
        $runtime['baseUrl'] = $this->getBaseUrl($object);
        return $runtime;
    }

    /**
     * @return array
     * @throws PortableElementInconsistencyModelException
     */
    public function getLatestRuntimes()
    {
        $all = [];
        foreach ($this->getMap() as $typeIdentifier => $versions) {

            if (empty($versions)) {
                continue;
            }

            krsort($versions);
            $object = $this->getModel()->createDataObject(reset($versions));
            $all[$typeIdentifier] = [$this->getRuntime($object)];
        }
        return $all;
    }


    /**
     * @return PortableElementObject[]
     * @throws PortableElementInconsistencyModelException
     */
    public function getLatestCreators()
    {
        $all = [];
        foreach ($this->getMap() as $typeIdentifier => $versions) {

            if (empty($versions)) {
                continue;
            }

            krsort($versions);
            $object = $this->getModel()->createDataObject(reset($versions));
            if (! empty($object->getCreator())) {
                $all[$typeIdentifier] = $object;
            }
        }
        return $all;
    }

    /**
     * Remove all registered files for a PCI identifier from FileSystem
     * If $targetedVersion is given, remove only assets for this version
     *
     * @param PortableElementObject $object
     * @return bool
     * @throws \common_Exception
     */
    protected function removeAssets(PortableElementObject $object)
    {
        if (! $object->hasVersion()) {
            throw new PortableElementVersionIncompatibilityException('Unable to delete asset files whitout model version.');
        }

        $object = $this->fetch($object);

        $files[] = array_merge($object->getRuntime(), $object->getCreator());
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

        if (! $this->getFileSystem()->unregisterFiles($object, $filesToRemove)) {
            throw new PortableElementFileStorageException(
                'Unable to delete asset files for PCI "' . $object->getTypeIdentifier()
                . '" at version "' . $object->getVersion() . '"'
            );
        }
        return true;
    }

    /**
     * Create an temp export tree and return path
     *
     * @param PortableElementObject $object
     * @return string
     */
    protected function getZipLocation(PortableElementObject $object)
    {
        return \tao_helpers_Export::getExportPath() . DIRECTORY_SEPARATOR . 'pciPackage_' . $object->getTypeIdentifier() . '.zip';
    }

    /**
     * Get manifest representation of Pci Model
     *
     * @param PortableElementObject $object
     * @return string
     */
    public function getManifest(PortableElementObject $object)
    {
        return json_encode($object->toArray(), JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    }

    /**
     * Export a pci to a zip package
     *
     * @param PortableElementObject $object
     * @return string
     * @throws \common_Exception
     */
    public function export(PortableElementObject $object)
    {
        $zip = new \ZipArchive();
        $path = $this->getZipLocation($object);

        if ($zip->open($path, \ZipArchive::CREATE) !== TRUE) {
            throw new \common_Exception('Unable to create zipfile ' . $path);
        }

        $manifest = $this->getManifest($object);
        $zip->addFromString($this->getModel()->getManifestName(), $manifest);

        $files = $this->getFilesFromPortableElement($object);
        $filesystem = $this->getFileSystem();
        foreach ($files as $file) {
            $zip->addFromString($file, $filesystem->getFileContentFromModelStorage($object, $file));
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
        if (! $this->storage) {
            $this->storage = $this->getServiceLocator()->get(PortableElementFileStorage::SERVICE_ID);
            $this->storage->setModel($this->getModel());
        }
        return $this->storage;
    }

    /**
     * Set source of directory where extracted zip is located
     *
     * @param $source
     * @return PortableElementRegistry
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
     * @param PortableElementObject $object
     * @return string
     * @throws PortableElementNotFoundException
     */
    protected function getBaseUrl(PortableElementObject $object)
    {
        $object = $this->fetch($object);
        return $this->getFileSystem()->getFileUrl($object);
    }

    /**
     * @param PortableElementObject $object
     * @param $file
     * @return bool|false|resource
     * @throws \common_Exception
     */
    public function getFileStream(PortableElementObject $object, $file)
    {
        return $this->getFileSystem()->getFileStream($object, $file);
    }
}
