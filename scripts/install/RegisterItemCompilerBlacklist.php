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
use oat\taoQtiItem\model\compile\QtiItemCompilerAssetBlacklist;
use oat\taoQtiItem\model\Export\ApipPackageExportHandler;
use oat\taoQtiItem\model\Export\ItemMetadataByClassExportHandler;
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
class RegisterItemCompilerBlacklist  extends InstallAction
{
    public function __invoke($params)
    {
        $assetBlacklistService = new QtiItemCompilerAssetBlacklist([
            QtiItemCompilerAssetBlacklist::BLACKLIST => [
                '/^https?:\/\/(www\.youtube\.[a-zA-Z]*|youtu\.be)\//',
                '/^data:[^\/]+\/[^;]+(;charset=[\w]+)?;base64,/'
            ]
        ]);

        $this->getServiceManager()->register(QtiItemCompilerAssetBlacklist::SERVICE_ID, $assetBlacklistService);

    }
}
