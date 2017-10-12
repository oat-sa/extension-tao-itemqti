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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\tao\model\ClientLibRegistry;
use oat\tao\model\asset\AssetService;

/**
 * Register former portable shared libraries to make existing PCI implementation compatible
 */
class RegisterLegacyPortableLibraries  extends InstallAction
{
    public function __invoke($params)
    {
        //register location of portable libs to legacy share lib aliases for backward compatibility
        $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
        $portableSafeLibPath = $assetService->getJsBaseWww('taoQtiItem').'js/legacyPortableSharedLib';
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->register('IMSGlobal/jquery_2_1_1', $portableSafeLibPath . '/jquery_2_1_1');
        $clientLibRegistry->register('OAT/lodash', $portableSafeLibPath . '/lodash');
        $clientLibRegistry->register('OAT/async', $portableSafeLibPath . '/async');
        $clientLibRegistry->register('OAT/raphael', $portableSafeLibPath . '/raphael');
        $clientLibRegistry->register('OAT/scale.raphael', $portableSafeLibPath . '/OAT/scale.raphael');
        $clientLibRegistry->register('OAT/jquery.qtip', $portableSafeLibPath . '/jquery.qtip');
        $clientLibRegistry->register('OAT/util/xml', $portableSafeLibPath . '/OAT/util/xml');
        $clientLibRegistry->register('OAT/util/math', $portableSafeLibPath . '/OAT/util/math');
        $clientLibRegistry->register('OAT/util/html', $portableSafeLibPath . '/OAT/util/html');
        $clientLibRegistry->register('OAT/util/EventMgr', $portableSafeLibPath . '/OAT/util/EventMgr');
        $clientLibRegistry->register('OAT/util/event', $portableSafeLibPath . '/OAT/util/event');
        $clientLibRegistry->register('OAT/util/asset', $portableSafeLibPath . '/OAT/util/asset');
        $clientLibRegistry->register('OAT/util/tpl', $portableSafeLibPath . '/OAT/util/tpl');
        $clientLibRegistry->register('OAT/sts/common', $portableSafeLibPath . '/OAT/sts/common');
        $clientLibRegistry->register('OAT/interact', $portableSafeLibPath . '/interact');
        $clientLibRegistry->register('OAT/interact-rotate', $portableSafeLibPath . '/OAT/interact-rotate');
        $clientLibRegistry->register('OAT/sts/transform-helper', $portableSafeLibPath . '/OAT/sts/transform-helper');
        $clientLibRegistry->register('OAT/handlebars', $portableSafeLibPath . '/handlebars');
        $clientLibRegistry->register('OAT/sts/stsEventManager', $portableSafeLibPath . '/OAT/sts/stsEventManager');
        $clientLibRegistry->register('OAT/waitForMedia', $portableSafeLibPath . '/OAT/waitForMedia');
        $clientLibRegistry->register('OAT/customEvent', $portableSafeLibPath . '/OAT/customEvent');
        $clientLibRegistry->register('OAT/mediaPlayer', $portableSafeLibPath . '/OAT/mediaPlayer');
    }
}

