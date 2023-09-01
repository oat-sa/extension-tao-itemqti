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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\tao\model\ClientLibRegistry;
use oat\tao\model\asset\AssetService;

/**
 * Register the paths of frontend modules which are installed from npm packages
 *
 * @author Martin Nicholson <martin@taotesting.com>
 */
class RegisterNpmPaths extends InstallAction
{
    public function __invoke($params)
    {
        $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
        $taoQtiItemNpmDist = $assetService->getJsBaseWww('taoQtiItem')
            . 'node_modules/@oat-sa/tao-item-runner-qti/dist/';
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->register('taoQtiItem/qtiCommonRenderer', $taoQtiItemNpmDist . 'qtiCommonRenderer');
        $clientLibRegistry->register('taoQtiItem/reviewRenderer', $taoQtiItemNpmDist . 'reviewRenderer');
        $clientLibRegistry->register('taoQtiItem/qtiItem', $taoQtiItemNpmDist . 'qtiItem');
        $clientLibRegistry->register('taoQtiItem/qtiRunner', $taoQtiItemNpmDist . 'qtiRunner');
        $clientLibRegistry->register('taoQtiItem/runner', $taoQtiItemNpmDist . 'runner');
        $clientLibRegistry->register('taoQtiItem/scoring', $taoQtiItemNpmDist . 'scoring');

        return \common_report_Report::createSuccess('extra paths for taoQtiItem set up.');
    }
}
