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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\oatbox\event\EventManager;
use oat\oatbox\service\ServiceManager;

if (\common_ext_ExtensionsManager::singleton()->isInstalled('taoMediaManager')) {
    $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoMediaManager');
    $event = new \common_ext_event_ExtensionInstalled($extension);
    \oat\taoQtiItem\model\update\QtiManager::catchEvent($event);
}

$eventManager = ServiceManager::getServiceManager()->get(EventManager::CONFIG_ID);
$eventManager->attach(
    'common_ext_event_ExtensionInstalled',
    array('oat\\taoQtiItem\\model\\update\\QtiManager', 'catchEvent')
);
ServiceManager::getServiceManager()->register(EventManager::CONFIG_ID, $eventManager);