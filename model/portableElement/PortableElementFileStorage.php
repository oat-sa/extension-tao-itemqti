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

namespace oat\taoQtiItem\model\portableElement;

use GuzzleHttp\Psr7\Stream;
use League\Flysystem\Filesystem;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\websource\WebsourceManager;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementFileStorageException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\pic\model\PicModel;

class PortableElementFileStorage extends ConfigurableService
{
    const SERVICE_ID = 'qtiItemPci/portableElementFileStorage';

    const OPTION_WEBSOURCE = 'websource';
    const OPTION_FILESYSTEM = 'filesystem';

    protected $source;

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

    public function getPrefix(PortableElementModel $model)
    {
        $hashFile = DIRECTORY_SEPARATOR . md5($model->getTypeIdentifier() . $model->getVersion()) . DIRECTORY_SEPARATOR;
        if ($model instanceof PciModel) {
            return  'pci' . $hashFile;
        }

        if ($model instanceof PicModel) {
            return  'pic' . $hashFile;
        }

        throw new PortableElementInconsistencyModelException(get_class($model) . ' is not managed to handle files.');
    }

    public function getFileUrl(PortableElementModel $model, $relPath='')
    {
        return $this->getAccessProvider()->getAccessUrl($this->getPrefix($model) . $relPath);
    }

    public function setSource($source)
    {
        if (!is_dir($source)) {
            throw new PortableElementFileStorageException('Unable to locate the source directory.');
        }
        $this->source = DIRECTORY_SEPARATOR . trim($source, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return $this;
    }

    /**
     * Register files associated to a PCI track by $typeIdentifier
     *
     * @refactor improve response
     *
     * @param PortableElementModel $model
     * @param $files
     * @return bool
     * @throws \common_Exception
     */
    public function registerFiles(PortableElementModel $model, $files)
    {
        $registered = false;
        $fileSystem = $this->getFileStorage();

        if (!$this->source) {
            throw new PortableElementFileStorageException('The source directory is not correctly set.');
        }

        foreach ($files as $file) {
            if (substr($file, 0, 2)!='./' && !preg_match('/^'.$model->getTypeIdentifier().'/', $file)) {
                // File is not relative, it's a shared libraries
                // Ignore this file, front have fallBack
                continue;
            }

            $filePath = $this->source . $file;
            if (!file_exists($filePath) || ($resource = fopen($filePath, 'r'))===false) {
                throw new PortableElementFileStorageException('File cannot be opened : ' . $filePath);
            }

            $fileId = $this->getPrefix($model) . preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $file);
            //Adjust file resource entries where {QTI_NS}/xxx/yyy.js is equivalent to ./xxx/yyy.js
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
     * @param PortableElementModel $model
     * @param $files
     * @return bool
     * @throws \common_Exception
     */
    public function unregisterFiles(PortableElementModel $model, $files)
    {
        $deleted = true;
        $filesystem = $this->getFileStorage();
        foreach ($files as $relPath) {
            $fileId = $this->getPrefix($model) . $relPath;
            if (!$filesystem->has($fileId)) {
                throw new \common_Exception('File does not exists in the filesystem: ' . $relPath);
            }
            $deleted = $filesystem->delete($fileId);
        }
        return $deleted;
    }

    public function getFileContentFromModelStorage(PortableElementModel $model, $file)
    {
        $filePath = $this->getPrefix($model) . $file;
        //var_dump($filePath);die();
        if ($this->getFileStorage()->has($filePath)) {
            return $this->getFileStorage()->read($filePath);
        }
        throw new PortableElementFileStorageException('Unable to find file "' . $file . '"' .
            ' related to Portable element ' . $model->getTypeIdentifier());
    }

    /**
     * @param PortableElementModel $model
     * @param $file
     * @return bool|false|resource
     * @throws \common_Exception
     */
    public function getFileStream(PortableElementModel $model, $file)
    {
        $filePath = $this->getPrefix($model) . $file;
        if ($this->getFileStorage()->has($filePath)) {
            return new Stream($this->getFileStorage()->readStream($filePath));
        }
        throw new PortableElementFileStorageException($filePath);
    }
}