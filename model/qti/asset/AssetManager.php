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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2016-2025 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\model\qti\asset;

use helpers_File;
use oat\tao\model\import\InvalidSourcePathException;
use oat\taoQtiItem\model\qti\asset\handler\AssetHandler;
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
            throw new AssetManagerException(
                'Asset handler "' . get_class($assetHandler) . '" is not supported by AssetManager'
            );
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
            throw new AssetManagerException(
                'No source folder set to assetManager when loading auxiliary files & dependencies.'
            );
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
        $qtiFile = $this->getSource() . helpers_File::urlToPath($qtiItemResource->getFile());
        foreach ($qtiItemResource->getAuxiliaryFiles() as $auxiliaryFile) {
            $absolutePath = $this->getAbsolutePath($auxiliaryFile);
            $relativePath = $this->getRelativePath($qtiFile, $absolutePath);

            if (!helpers_File::isAbsoluteFileInsideDirectory($absolutePath, $this->getSource())) {
                throw new InvalidSourcePathException(dirname($qtiFile), $auxiliaryFile);
            }

            try {
                $this->importAsset($absolutePath, $relativePath);
            } catch (\common_Exception $e) {
                throw new AssetManagerException(
                    'Error occurs during auxiliary assets handling for item: ' . $qtiItemResource->getIdentifier()
                    . ', assetFile: ' . $relativePath,
                    0,
                    $e
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
        $qtiFile = $this->getSource() . helpers_File::urlToPath($qtiItemResource->getFile());
        foreach ($qtiItemResource->getDependencies() as $dependenciesFile) {
            if (!isset($dependencies[$dependenciesFile])) {
                continue;
            }

            $dependencyResource = $dependencies[$dependenciesFile];
            try {
                $this->importFile($qtiFile, $dependencyResource->getFile());
                foreach ($dependencyResource->getAuxiliaryFiles() as $auxiliaryFile) {
                    /*
                     * Load resources to the items folder
                     * it creates duplications to make items independent (for safe deletion and edition)
                     */
                    $this->importFile($qtiFile, $auxiliaryFile);
                }
            } catch (AssetManagerException $e) {
                throw new AssetManagerException(
                    $e->getMessage() . ', item ' . $qtiItemResource->getIdentifier(),
                    $e->getCode(),
                    $e->getPrevious()
                );
            }
        }
        return $this;
    }

    /**
     * @param $qtiFile
     * @param $file
     * @throws AssetManagerException
     */
    private function importFile($qtiFile, $file)
    {
        $absolutePath = $this->getAbsolutePath($file);
        $relativePath = $this->getRelativePath($qtiFile, $absolutePath);
        try {
            $this->importAsset($absolutePath, $relativePath);
        } catch (\common_Exception $e) {
            throw new AssetManagerException(
                'Error occurs during dependency assets handling: assetFile: ' . $relativePath,
                0,
                $e
            );
        }
    }

    /**
     * We have to copy all the files used by item that stored not in the item folder
     * and used by direct links in the item
     *
     * @param QtiResource $qtiItemResource
     * @param $dependencies
     * @throws AssetManagerException
     * @example see QtiPackageExportTest::testExportQtiPackageWithDependencies
     */
    public function copyDependencyFiles(QtiResource $qtiItemResource, $dependencies)
    {
        $qtiFile = $this->getSource() . helpers_File::urlToPath($qtiItemResource->getFile());
        foreach ($qtiItemResource->getDependencies() as $dependenciesFile) {
            if (!isset($dependencies[$dependenciesFile])) {
                continue;
            }
            /** @var QtiResource $dependencyResource */
            $dependencyResource = $dependencies[$dependenciesFile];

            $this->copyFilesToItemDir(dirname($qtiFile), $dependencyResource);
            /** @var array $dependencies recursive dependencies */
            $secondLevelDependencies = $dependencyResource->getDependencies();
            if ($secondLevelDependencies && count($secondLevelDependencies)) {
                $this->copyDependencyFiles($qtiItemResource, $secondLevelDependencies);
            }
        }
    }

    /**
     * @param string $itemDir
     * @param QtiResource $dependencyResource
     * @throws AssetManagerException
     */
    protected function copyFilesToItemDir($itemDir, QtiResource $dependencyResource)
    {
        // copy auxiliary files to the items folder
        foreach ($dependencyResource->getAuxiliaryFiles() as $auxiliaryFile) {
            $auxiliaryPath = $this->getAbsolutePath($auxiliaryFile);
            $dest = $itemDir . '/' . $auxiliaryFile;

            if (!$this->isFileInsideDirectory($auxiliaryFile, $itemDir)) {
                continue;
            }

            if (!$this->copyFile($auxiliaryPath, $dest)) {
                throw new AssetManagerException('File ' . $auxiliaryPath . ' was not copied to the ' . $itemDir);
            }
        }
    }

    private function copyFile(string $sourcePath, string $destPath): bool
    {
        try {
            $srcIsLocal = $this->isLocalPath($sourcePath);
            $dstIsLocal = $this->isLocalPath($destPath);

            if ($srcIsLocal && $dstIsLocal) {
                return $this->copyFileLocal($sourcePath, $destPath);
            }

            return $this->copyFileStream($sourcePath, $destPath);
        } catch (\Exception $e) {
            \common_Logger::e('File copy failed: ' . $e->getMessage());
            return false;
        }
    }

    private function isLocalPath(string $path): bool
    {
        $scheme = parse_url($path, PHP_URL_SCHEME);

        return $scheme === null || $scheme === '' || $scheme === 'file';
    }

    private function isFileInsideDirectory(string $path, string $directory): bool
    {
        $base = rtrim($this->normalizePath($directory), '/');
        $target = $this->normalizePath($this->isAbsolutePath($path) ? $path : $base . '/' . $path);

        return $target === $base || str_starts_with($target, $base . '/');
    }

    private function isAbsolutePath(string $path): bool
    {
        return str_starts_with($path, '/')
            || (strlen($path) > 1 && ctype_alpha($path[0]) && $path[1] === ':');
    }

    private function normalizePath(string $path): string
    {
        $path = str_replace('\\', '/', $path);

        $segments = [];
        foreach (explode('/', $path) as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }

            if ($segment === '..') {
                array_pop($segments);
                continue;
            }

            $segments[] = $segment;
        }

        $prefix = str_starts_with($path, '/') ? '/' : '';

        return $prefix . implode('/', $segments);
    }

    private function copyFileLocal(string $sourcePath, string $destPath): bool
    {
        $destDir = dirname($destPath);
        if (!is_dir($destDir)) {
            if (!@mkdir($destDir, 0777, true) && !is_dir($destDir)) {
                \common_Logger::w('Failed to create destination directory: ' . $destDir);
                return false;
            }
        }

        if (@copy($sourcePath, $destPath)) {
            return true;
        }

        \common_Logger::w('Local copy failed: ' . $sourcePath . ' → ' . $destPath);
        return false;
    }

    private function copyFileStream(string $sourcePath, string $destPath): bool
    {
        $sourceHandle = @fopen($sourcePath, 'rb');
        if ($sourceHandle === false) {
            \common_Logger::w('Cannot open source file for reading: ' . $sourcePath);
            return false;
        }

        if ($this->isLocalPath($destPath)) {
            $destDir = dirname($destPath);
            if (!is_dir($destDir)) {
                if (!@mkdir($destDir, 0777, true) && !is_dir($destDir)) {
                    fclose($sourceHandle);
                    \common_Logger::w('Failed to create destination directory: ' . $destDir);
                    return false;
                }
            }
        }

        $destHandle = @fopen($destPath, 'wb');
        if ($destHandle === false) {
            fclose($sourceHandle);
            \common_Logger::w('Cannot open destination file for writing: ' . $destPath);
            return false;
        }

        $bytesCopied = @stream_copy_to_stream($sourceHandle, $destHandle);

        fclose($sourceHandle);
        fclose($destHandle);

        if ($bytesCopied === false || $bytesCopied === 0) {
            \common_Logger::w('Stream copy failed or copied 0 bytes: ' . $sourcePath);
            return false;
        }

        return true;
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
        return str_replace(DIRECTORY_SEPARATOR, '/', helpers_File::getRelPath($qtiFile, $absolutePath));
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
        throw new AssetManagerException(
            'Unable to import auxiliary & dependency files. No asset handler applicable to file : ' . $relativePath
        );
    }
}
