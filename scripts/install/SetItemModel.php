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
 *
 */

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoQtiItem\model\Export\ApipPackageExportHandler;
use oat\taoQtiItem\model\Export\ItemMetadataByClassExportHandler;
use oat\taoQtiItem\model\Export\Qti3Package\Handler as Qti3PackageExportHandler;
use oat\taoQtiItem\model\Export\QtiPackage22ExportHandler;
use oat\taoQtiItem\model\Export\QtiPackageExportHandler;
use oat\taoQtiItem\model\import\QtiItemImport;
use oat\taoQtiItem\model\import\QtiPackageImport;
use oat\taoQtiItem\model\ItemModel;

/**
 * Set config for Item Model
 *
 * @author Antoine ROBIN <antoine@taotesting.com>
 */
class SetItemModel extends InstallAction
{
    public function __invoke($params)
    {

        $options = [
            ItemModel::EXPORT_HANDLER => [
                new ItemMetadataByClassExportHandler(),
                new ApipPackageExportHandler(),
                new QtiPackageExportHandler(),
                new QtiPackage22ExportHandler(),
                new Qti3PackageExportHandler()
            ],
            ItemModel::IMPORT_HANDLER => [
                new QtiItemImport(),
                new QtiPackageImport(),
            ]
        ];

        if (
            \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->hasConfig(ItemModel::COMPILER)
        ) {
            $options[ItemModel::COMPILER] = \common_ext_ExtensionsManager::singleton()
                ->getExtensionById('taoQtiItem')
                ->getConfig(ItemModel::COMPILER);
            \common_ext_ExtensionsManager::singleton()
                ->getExtensionById('taoQtiItem')
                ->unsetConfig(ItemModel::COMPILER);
        } else {
            $options[ItemModel::COMPILER] = 'oat\\taoQtiItem\\model\\QtiItemCompiler';
        }

        $itemModelService = new ItemModel($options);

        $this->getServiceManager()->propagate($itemModelService);

        $this->getServiceManager()->register(ItemModel::SERVICE_ID, $itemModelService);
    }
}
