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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Export\Stylesheet;

use League\Flysystem\StorageAttributes;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\filesystem\FilesystemException;
use oat\oatbox\filesystem\FilesystemInterface;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ConfigurableService;

/** @todo fix the implementation as taoQtiItem MUST NOT depend on taoMediaManager */
use oat\taoMediaManager\model\fileManagement\FlySystemManagement;
use oat\taoQtiItem\model\Export\AbstractQTIItemExporter;
use tao_helpers_Uri as UriHelper;

class AssetStylesheetLoader extends ConfigurableService
{
    use OntologyAwareTrait;

    public const ASSET_CSS_DIRECTORY_NAME = 'css';

    public function loadAssetsFromAssetResource(string $link): ?array
    {
        // fetch multiple
        $asset = $this->getResource(UriHelper::decode($link));

        if ($asset->exists()) {
            $property = (string)$asset->getUniquePropertyValue(
                $this->getProperty(AbstractQTIItemExporter::PROPERTY_LINK)
            );

            $stylesheetPath = $this->buildAssetPathFromPropertyName($property);
            try {
                $cssFiles = $this->getFileSystem()->listContents($stylesheetPath)->toArray();
                $cssFilesInfo = [];

                foreach ($cssFiles as $key => $file) {
                    $cssFilesInfo[$key] = $file instanceof StorageAttributes ? $file->jsonSerialize() : $file;
                    $cssFilesInfo[$key]['stream'] = $this->getFileSystem()->readStream(
                        $stylesheetPath . DIRECTORY_SEPARATOR . basename($file['path'])
                    );
                }

                return $cssFilesInfo;
            } catch (FilesystemException $exception) {
                $this->getLogger()->notice(
                    sprintf(
                        'Stylesheet %s not found for resource %s',
                        $exception->getPath(),
                        $property
                    ),
                    ['exception' => $exception, 'directory' => $stylesheetPath, 'property' => $property]
                );
            }
        }

        return null;
    }

    private function buildAssetPathFromPropertyName(string $property)
    {
        return implode(
            DIRECTORY_SEPARATOR,
            [
                dirname($property),
                self::ASSET_CSS_DIRECTORY_NAME,
            ]
        );
    }

    private function getFileSystem(): FilesystemInterface
    {
        return $this->getFileSystemService()
            ->getFileSystem($this->getFlySystemManagement()->getOption(FlySystemManagement::OPTION_FS));
    }

    private function getFileSystemService(): FileSystemService
    {
        return $this->getServiceLocator()->get(FileSystemService::SERVICE_ID);
    }

    private function getFlySystemManagement(): FlySystemManagement
    {
        // FIXME this violates the order of dependencies.
        //  taoQtiItem cannot depend on taoMediaManager as it causes a circular dependency
        //  caused by [#1766](https://github.com/oat-sa/extension-tao-itemqti/pull/1766)
        return $this->getServiceLocator()->get(FlySystemManagement::SERVICE_ID);
    }
}
