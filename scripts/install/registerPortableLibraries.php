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
class RegisterPortableLibraries  extends InstallAction
{
    public function __invoke($params)
    {
        $portableSafeLibPath = ROOT_PATH.'taoQtiItem/views/js/portableLib';
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->register('IMSGlobal/jquery_2_1_1', $portableSafeLibPath . '/jquery_2_1_1.js');
        $clientLibRegistry->register('OAT/lodash', $portableSafeLibPath . '/lodash.js');
        $clientLibRegistry->register('OAT/async', $portableSafeLibPath . '/async.js');
        $clientLibRegistry->register('OAT/raphael', $portableSafeLibPath . '/raphael.js');
        $clientLibRegistry->register('OAT/scale.raphael', $portableSafeLibPath . '/OAT/scale.raphael.js');
        $clientLibRegistry->register('OAT/jquery.qtip', $portableSafeLibPath . '/jquery.qtip.js');
        $clientLibRegistry->register('OAT/util/xml', $portableSafeLibPath . '/OAT/util/xml.js');
        $clientLibRegistry->register('OAT/util/math', $portableSafeLibPath . '/OAT/util/math.js');
        $clientLibRegistry->register('OAT/util/html', $portableSafeLibPath . '/OAT/util/html.js');
        $clientLibRegistry->register('OAT/util/EventMgr', $portableSafeLibPath . '/OAT/util/EventMgr.js');
        $clientLibRegistry->register('OAT/util/event', $portableSafeLibPath . '/OAT/util/event.js');
        $clientLibRegistry->register('OAT/util/asset', $portableSafeLibPath . '/OAT/util/asset.js');
        $clientLibRegistry->register('OAT/util/tpl', $portableSafeLibPath . '/OAT/util/tpl.js');
        $clientLibRegistry->register('OAT/sts/common', $portableSafeLibPath . '/OAT/sts/common.js');
        $clientLibRegistry->register('OAT/interact', $portableSafeLibPath . '/interact.js');
        $clientLibRegistry->register('OAT/interact-rotate', $portableSafeLibPath . '/OAT/interact-rotate.js');
        $clientLibRegistry->register('OAT/sts/transform-helper', $portableSafeLibPath . '/OAT/sts/transform-helper.js');
        $clientLibRegistry->register('OAT/handlebars', $portableSafeLibPath . '/handlebars.js');
        $clientLibRegistry->register('OAT/sts/stsEventManager', $portableSafeLibPath . '/OAT/sts/stsEventManager.js');
        $clientLibRegistry->register('OAT/waitForMedia', $portableSafeLibPath . '/OAT/waitForMedia.js');
        $clientLibRegistry->register('OAT/customEvent', $portableSafeLibPath . '/OAT/customEvent.js');
        $clientLibRegistry->register('OAT/mediaPlayer', $portableSafeLibPath . '/OAT/mediaPlayer.js');
    }
}

