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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Export\Stylesheet;

use League\Flysystem\FileNotFoundException;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\taoMediaManager\model\fileManagement\FileManagement;
use oat\taoQtiItem\model\Export\AbstractQTIItemExporter;
use Psr\Http\Message\StreamInterface;
use tao_helpers_Uri as UriHelper;

class AssetStylesheetLoader extends ConfigurableService
{
    use OntologyAwareTrait;

    public const ASSET_CSS_DIRECTORY_NAME = 'css';
    public const ASSET_CSS_FILENAME = 'tao-user-styles.css';

    public function loadAssetFromAssetResource(string $link): ?StreamInterface
    {
        $asset = $this->getResource(UriHelper::decode($link));

        if ($asset->exists()) {
            $property = (string)$asset->getUniquePropertyValue(
                $this->getProperty(AbstractQTIItemExporter::PROPERTY_LINK)
            );

            $stylesheetPath = $this->buildAssetPathFromPropertyName($property);
            try {
                return $this->getFileManagement()->getFileStream(
                    $stylesheetPath
                );
            } catch (FileNotFoundException $exception) {
                $this->getLogger()->notice(
                    sprintf(
                        'Stylesheet %s not found to resource %s',
                        $stylesheetPath,
                        $property
                    ),
                    ["exception" => $exception, 'stylesheet' => $stylesheetPath, 'property' => $property]
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
                self::ASSET_CSS_FILENAME
            ]
        );
    }

    protected function getFileManagement(): FileManagement
    {
        return $this->getServiceLocator()->get(FileManagement::SERVICE_ID);
    }
}
