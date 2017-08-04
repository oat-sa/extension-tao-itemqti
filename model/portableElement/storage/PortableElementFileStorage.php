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

namespace oat\taoQtiItem\model\portableElement\storage;

use GuzzleHttp\Psr7\Stream;
use League\Flysystem\Filesystem;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\websource\WebsourceManager;
use oat\taoQtiItem\model\portableElement\exception\PortableElementFileStorageException;
use oat\taoQtiItem\model\portableElement\model\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;

class PortableElementFileStorage extends ConfigurableService
{
    use PortableElementModelTrait;

    const SERVICE_ID = 'taoQtiItem/portableElementFileStorage';

    const OPTION_WEBSOURCE = 'websource';
    const OPTION_FILESYSTEM = 'filesystem';

    /**
     * @return Filesystem
     */
    public function getFileStorage()
    {
        return $this
            ->getServiceLocator()
            ->get(FileSystemService::SERVICE_ID)
            ->getFileSystem($this->getOption(self::OPTION_FILESYSTEM));
    }

    protected function getAccessProvider()
    {
        return WebsourceManager::singleton()->getWebsource($this->getOption(self::OPTION_WEBSOURCE));
    }

    public function getPrefix(PortableElementObject $object)
    {
        $hashFile = DIRECTORY_SEPARATOR . md5($object->getTypeIdentifier() . $object->getVersion()) . DIRECTORY_SEPARATOR;
        return $object->getModel()->getId() . $hashFile;
    }

    public function getFileUrl(PortableElementObject $object, $relPath='')
    {
        return $this->getAccessProvider()->getAccessUrl($this->getPrefix($object) . $relPath);
    }

    protected function sanitizeSourceAsDirectory($source)
    {
        if (! is_dir($source)) {
            throw new PortableElementFileStorageException('Unable to locate the source directory.');
        }
        return rtrim($source, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    }

    /**
     * Register files associated to a PCI track by $typeIdentifier
     *
     * @refactor improve response
     *
     * @param PortableElementObject $object
     * @param string[] $files Relative path of portable element files
     * @param string $source Location of temporary directory
     * @return bool
     * @throws PortableElementFileStorageException
     */
    public function registerFiles(PortableElementObject $object, $files, $source)
    {
        $registered = false;
        $fileSystem = $this->getFileStorage();
        $source = $this->sanitizeSourceAsDirectory($source);

        foreach ($files as $file) {

            if(!$object->isRegistrableFile($file)){
                continue;
            }

            $filePath = $source . ltrim($file, DIRECTORY_SEPARATOR);
            if (!file_exists($filePath) || ($resource = fopen($filePath, 'r'))===false) {
                throw new PortableElementFileStorageException('File cannot be opened : ' . $filePath);
            }

            $fileId = $this->getPrefix($object) . $object->getRegistrationFileId($file);
            if ($fileSystem->has($fileId)) {
                $registered = $fileSystem->updateStream($fileId, $resource);
            } else {
                $registered = $fileSystem->writeStream($fileId, $resource);
            }
            fclose($resource);
            \common_Logger::i('Portable element asset file "' . $fileId . '" copied.');
        }
        return $registered;
    }

    /**
     * Unregister files by removing them from FileSystem
     *
     * @param PortableElementObject $object
     * @param $files
     * @return bool
     * @throws \common_Exception
     */
    public function unregisterFiles(PortableElementObject $object, $files)
    {
        $deleted = true;
        $filesystem = $this->getFileStorage();
        foreach ($files as $relPath) {
            $fileId = $this->getPrefix($object) . $relPath;
            if (!$filesystem->has($fileId)) {
                throw new \common_Exception('File does not exists in the filesystem: ' . $relPath);
            }
            $deleted = $filesystem->delete($fileId);
        }
        return $deleted;
    }

    /**
     * Remove all the portable element files and dir
     * @param PortableElementObject $object
     * @return bool
     */
    public function unregisterAllFiles(PortableElementObject $object){
        return $this->getFileStorage()->deleteDir($this->getPrefix($object));
    }

    public function getFileContentFromModelStorage(PortableElementObject $object, $file)
    {
        $filePath = $this->getPrefix($object) . $file;
        if ($this->getFileStorage()->has($filePath)) {
            return $this->getFileStorage()->read($filePath);
        }
        throw new PortableElementFileStorageException('Unable to find file "' . $file . '"' .
            ' related to Portable element ' . $object->getTypeIdentifier());
    }

    /**
     * @param PortableElementObject $object
     * @param $file
     * @return bool|false|resource
     * @throws \common_Exception
     */
    public function getFileStream(PortableElementObject $object, $file)
    {
        $filePath = $this->getPrefix($object) . $file;
        if ($this->getFileStorage()->has($filePath)) {
            return new Stream($this->getFileStorage()->readStream($filePath));
        }
        throw new PortableElementFileStorageException($filePath);
    }
}