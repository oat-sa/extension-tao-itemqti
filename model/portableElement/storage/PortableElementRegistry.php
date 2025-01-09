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
 * Copyright (c) 2016-2022 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\storage;

use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\log\LoggerAwareTrait;
use oat\taoQtiItem\model\portableElement\exception\PortableElementFileStorageException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementVersionIncompatibilityException;
use oat\taoQtiItem\model\portableElement\model\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use Naneau\SemVer\Parser as SemVerParser;

/**
 * CreatorRegistry stores reference to
 *
 * @package taoQtiItem
 */
abstract class PortableElementRegistry implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;
    use PortableElementModelTrait;
    use LoggerAwareTrait;

    /** @var PortableElementFileStorage */
    protected $storage;

    protected $fileSystemId = 'taoQtiItem';

    /**
     *
     * @var array
     */
    private static $registries = [];

    /**
     *
     * @return PortableElementRegistry
     * @author Lionel Lecaque, lionel@taotesting.com
     */
    public static function getRegistry()
    {
        $class = get_called_class();
        if (!isset(self::$registries[$class])) {
            self::$registries[$class] = new $class();
        }

        return self::$registries[$class];
    }

    /**
     * Fetch a portable element with identifier & version
     *
     * @param $identifier
     * @param null $version
     * @return PortableElementObject
     * @throws PortableElementNotFoundException
     */
    public function fetch($identifier, $version = null)
    {
        $portableElements = $this->getAllVersions($identifier);

        // No version, return latest version
        if (is_null($version)) {
            $this->krsortByVersion($portableElements);
            return $this->getModel()->createDataObject(reset($portableElements));
        }

        // Version is set, return associated record
        if (isset($portableElements[$version])) {
            return $this->getModel()->createDataObject($portableElements[$version]);
        }

        // Version is set, no record found
        throw new PortableElementNotFoundException(
            $this->getModel()->getId() . ' with identifier ' . $identifier . ' found, '
            . 'but version "' . $version . '" does not exist.'
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
        $portableElements = $this->get($identifier);

        // No portable element found
        if ($portableElements == '') {
            throw new PortableElementNotFoundException(
                $this->getModel()->getId() . ' with identifier "' . $identifier . '" not found.'
            );
        }

        return $portableElements;
    }

    /**
     * Retrieve the given element from list of portable element
     * @param string $identifier
     * @return string
     */
    private function get($identifier)
    {
        $fileSystem = $this->getConfigFileSystem();

        if (!empty($identifier) && $fileSystem->fileExists($identifier)) {
            return json_decode($fileSystem->read($identifier), true);
        }

        return false;
    }

    private function getAll()
    {
        $elements = [];
        $contents = $this->getConfigFileSystem()->listContents();

        foreach ($contents as $file) {
            if ($file['type'] === 'file') {
                $identifier = basename($file['path']);
                $elements[$identifier] = $this->get($identifier);
            }
        }
        return $elements;
    }


    /**
     * Add a value to the list with given id
     *
     * @param string $identifier
     * @param string $value
     */
    private function set($identifier, $value)
    {
        $this->getConfigFileSystem()->write($identifier, json_encode($value));
    }

    /**
     * @return \oat\oatbox\filesystem\FileSystem
     */
    private function getConfigFileSystem()
    {
        /** @var FileSystemService $fs */
        $fs = $this->getServiceLocator()->get(FileSystemService::SERVICE_ID);
        return $fs->getFileSystem($this->fileSystemId);
    }

    /**
     *
     * Remove a element from the array
     *
     * @param string $identifier
     */
    private function remove(PortableElementObject $object)
    {
        $this->getConfigFileSystem()->delete($object->getTypeIdentifier());
        $this->getFileSystem()->unregisterAllFiles($object);
    }

    /**
     * @param $identifier
     * @param null $version
     * @return bool
     */
    public function has($identifier, $version = null)
    {
        try {
            return (bool)$this->fetch($identifier, $version);
        } catch (PortableElementNotFoundException $e) {
            return false;
        }
    }

    /**
     * @param PortableElementObject $object
     */
    public function update(PortableElementObject $object)
    {
        $mapByIdentifier = $this->get($object->getTypeIdentifier());
        if (!is_array($mapByIdentifier)) {
            $mapByIdentifier = [];
        }
        $mapByIdentifier[$object->getVersion()] = $object->toArray();
        $this->set($object->getTypeIdentifier(), $mapByIdentifier);
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

        if (!isset($portableElements[$object->getVersion()])) {
            throw new PortableElementVersionIncompatibilityException(
                $this->getModel()->getId() . ' with identifier ' . $object->getTypeIdentifier() . ' found, '
                . 'but version ' . $object->getVersion() . ' does not exist. Deletion impossible.'
            );
        }

        unset($portableElements[$object->getVersion()]);
        if (empty($portableElements)) {
            $this->remove($object);
        } else {
            $this->set($object->getTypeIdentifier(), $portableElements);
        }
    }

    /**
     * @param string $identifier
     * @throws PortableElementNotFoundException
     */
    public function removeAllVersions($identifier)
    {
        if (!$this->has($identifier)) {
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
        $portableElements = $this->getAll();
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
        $object = $this->fetch($object->getTypeIdentifier(), $object->getVersion());

        if (!$object->hasVersion()) {
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

        if (empty($portableElements)) {
            throw new PortableElementNotFoundException(
                'Unable to find any version of protable element "' . $identifier . '"'
            );
        }

        $this->krsortByVersion($portableElements);
        return $this->getModel()->createDataObject(reset($portableElements));
    }

    public function getLatestCompatibleVersion(string $identifier, string $targetVersion): ?PortableElementObject
    {
        try {
            $registered = $this->getAllVersions($identifier);
        } catch (PortableElementNotFoundException $e) {
            $this->logDebug($e->getMessage());
            return null;
        }
        $this->krsortByVersion($registered);

        foreach ($registered as $registeredVersion => $model) {
            if (intval($targetVersion) === intval($registeredVersion)) {
                return $this->getModel()->createDataObject($model);
            }
        }

        return null;
    }

    /**
     * @param PortableElementObject $object
     * @param string $source Temporary directory path
     * @throws PortableElementFileStorageException
     * @throws PortableElementVersionIncompatibilityException
     */
    public function register(PortableElementObject $object, $source)
    {
        try {
            $latestVersion = $this->getLatestVersion($object->getTypeIdentifier());
            if (version_compare($object->getVersion(), $latestVersion->getVersion(), '<')) {
                throw new PortableElementVersionIncompatibilityException(
                    'A newer version of the code already exists ' . $latestVersion->getVersion(
                    ) . ' > ' . $object->getVersion()
                );
            }
        } catch (PortableElementNotFoundException $e) {
            if (!$object->hasVersion()) {
                $object->setVersion('0.0.0');
            }
            // The portable element to register does not exist, continue
        }

        $files = $this->getFilesFromPortableElement($object);
        $this->getFileSystem()->registerFiles($object, $files, $source);

        $this->update($object);

        //register alias with the exact same files
        $aliasObject = clone $object;
        $aliasObject->setVersion($this->getAliasVersion($object->getVersion()));
        $this->getFileSystem()->registerFiles($aliasObject, $files, $source);
        $this->update($aliasObject);
    }

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
        return $validator->getAssets($object);
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
        $runtime = $object->toArray();
        $runtime['model'] = $object->getModelId();
        $runtime['xmlns'] = $object->getNamespace();
        $runtime['runtime'] = $object->getRuntimeAliases();
        $runtime['creator'] = $object->getCreatorAliases();
        $runtime['baseUrl'] = $this->getBaseUrl($object);
        return $runtime;
    }

    /**
     * Get the alias version for a given version number, e.g. 2.1.5 becomes 2.1.*
     * @param $versionString
     * @return mixed
     */
    private function getAliasVersion($versionString)
    {
        if (preg_match('/^[0-9]+\.[0-9]+\.\*$/', $versionString)) {
            //already an alias version string
            return $versionString;
        } else {
            $version = SemVerParser::parse($versionString);
            return $version->getMajor() . '.' . $version->getMinor() . '.*';
        }
    }

    /**
     * Get the latest registered portable element data object
     * @param bool $useVersionAlias
     * @return PortableElementObject[]
     */
    public function getLatest($useVersionAlias = false)
    {
        $all = [];
        foreach ($this->getAll() as $typeIdentifier => $versions) {
            if (empty($versions)) {
                continue;
            }

            $this->krsortByVersion($versions);
            $object = $this->getModel()->createDataObject(reset($versions));
            if ($useVersionAlias) {
                $object->setVersion($this->getAliasVersion($object->getVersion()));
            }
            $all[$typeIdentifier] = $object;
        }
        return $all;
    }

    /**
     * Get the last version of portable element runtimes
     *
     * @return array
     * @throws PortableElementInconsistencyModelException
     */
    public function getLatestRuntimes($useVersionAlias = false)
    {
        return array_map(function ($portableElementDataObject) {
            return [$this->getRuntime($portableElementDataObject)];
        }, $this->getLatest($useVersionAlias));
    }


    /**
     * Get the last version of portable element creators
     *
     * @return PortableElementObject[]
     * @throws PortableElementInconsistencyModelException
     */
    public function getLatestCreators($useVersionAlias = false)
    {
        return array_filter($this->getLatest($useVersionAlias), function ($portableElementDataObject) {
            return !empty($portableElementDataObject->getCreator());
        });
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
        if (!$object->hasVersion()) {
            throw new PortableElementVersionIncompatibilityException(
                'Unable to delete asset files whitout model version.'
            );
        }

        $object = $this->fetch($object->getTypeIdentifier(), $object->getVersion());

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

        if (!$this->getFileSystem()->unregisterFiles($object, $filesToRemove)) {
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
        return \tao_helpers_Export::getExportPath()
            . DIRECTORY_SEPARATOR
            . 'pciPackage_'
            . $object->getTypeIdentifier()
            . '.zip';
    }

    /**
     * Get manifest representation of Pci Model
     *
     * @param PortableElementObject $object
     * @return string
     */
    public function getManifest(PortableElementObject $object)
    {
        return json_encode($object->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Export a portable element to a zip package
     *
     * @throws \common_Exception
     */
    public function export(PortableElementObject $object): string
    {
        $zip = new \ZipArchive();
        $path = $this->getZipLocation($object);

        if ($zip->open($path, \ZipArchive::CREATE) !== true) {
            throw new \common_Exception('Unable to create zip file ' . $path);
        }

        $manifest = $this->getManifest($object);
        $zip->addFromString($this->getModel()->getManifestName(), $manifest);

        $files = $this->getFilesFromPortableElement($object);

        $filesystem = $this->getFileSystem();
        foreach ($files as $file) {
            try {
                $zip->addFromString($file, $filesystem->getFileContentFromModelStorage($object, $file));
            } catch (PortableElementFileStorageException $e) {
                // do not include missing/sharedClientLib files
                continue;
            }
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
            $this->storage = $this->getServiceLocator()->get(PortableElementFileStorage::SERVICE_ID);
            $this->storage->setServiceLocator($this->getServiceLocator());
            $this->storage->setModel($this->getModel());
        }
        return $this->storage;
    }

    /**
     * Return the absolute url of PCI storage
     *
     * @param PortableElementObject $object
     * @return string
     * @throws PortableElementNotFoundException
     */
    public function getBaseUrl(PortableElementObject $object)
    {
        $object = $this->fetch($object->getTypeIdentifier(), $object->getVersion());
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

    /**
     * Sort array keys by version (DESC)
     *
     * @param array $array
     */
    protected function krsortByVersion(array &$array)
    {
        uksort($array, function ($a, $b) {
            return -version_compare($a, $b);
        });
    }
}
