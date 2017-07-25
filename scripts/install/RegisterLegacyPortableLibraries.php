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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\tao\model\ClientLibRegistry;

/**
 * Register former portable shared libraries to make existing PCI implementation compatible
 */
class RegisterLegacyPortableLibraries  extends InstallAction
{
    public function __invoke($params)
    {
        //register location of portable libs to legacy share lib aliases for backward compatibility
        $portableSafeLibPath = ROOT_URL.'taoQtiItem/views/js/portableLib';
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->set('IMSGlobal/jquery_2_1_1', $portableSafeLibPath . '/jquery_2_1_1');
        $clientLibRegistry->set('OAT/lodash', $portableSafeLibPath . '/lodash');
        $clientLibRegistry->set('OAT/async', $portableSafeLibPath . '/async');
        $clientLibRegistry->set('OAT/raphael', $portableSafeLibPath . '/raphael');
        $clientLibRegistry->set('OAT/scale.raphael', $portableSafeLibPath . '/OAT/scale.raphael');
        $clientLibRegistry->set('OAT/jquery.qtip', $portableSafeLibPath . '/jquery.qtip');
        $clientLibRegistry->set('OAT/util/xml', $portableSafeLibPath . '/OAT/util/xml');
        $clientLibRegistry->set('OAT/util/math', $portableSafeLibPath . '/OAT/util/math');
        $clientLibRegistry->set('OAT/util/html', $portableSafeLibPath . '/OAT/util/html');
        $clientLibRegistry->set('OAT/util/EventMgr', $portableSafeLibPath . '/OAT/util/EventMgr');
        $clientLibRegistry->set('OAT/util/event', $portableSafeLibPath . '/OAT/util/event');
        $clientLibRegistry->set('OAT/util/asset', $portableSafeLibPath . '/OAT/util/asset');
        $clientLibRegistry->set('OAT/util/tpl', $portableSafeLibPath . '/OAT/util/tpl');
        $clientLibRegistry->set('OAT/sts/common', $portableSafeLibPath . '/OAT/sts/common');
        $clientLibRegistry->set('OAT/interact', $portableSafeLibPath . '/interact');
        $clientLibRegistry->set('OAT/interact-rotate', $portableSafeLibPath . '/OAT/interact-rotate');
        $clientLibRegistry->set('OAT/sts/transform-helper', $portableSafeLibPath . '/OAT/sts/transform-helper');
        $clientLibRegistry->set('OAT/handlebars', $portableSafeLibPath . '/handlebars');
        $clientLibRegistry->set('OAT/sts/stsEventManager', $portableSafeLibPath . '/OAT/sts/stsEventManager');
        $clientLibRegistry->set('OAT/waitForMedia', $portableSafeLibPath . '/OAT/waitForMedia');
        $clientLibRegistry->set('OAT/customEvent', $portableSafeLibPath . '/OAT/customEvent');
        $clientLibRegistry->set('OAT/mediaPlayer', $portableSafeLibPath . '/OAT/mediaPlayer');
    }
}

