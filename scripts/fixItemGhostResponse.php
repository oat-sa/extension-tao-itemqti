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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

require_once dirname(__FILE__) .'/../../tao/includes/raw_start.php';

common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');

$serviceManager = \oat\oatbox\service\ServiceManager::getServiceManager();
$fsService = $serviceManager->get(\oat\oatbox\filesystem\FileSystemService::SERVICE_ID);

if ($fsService instanceof League\Flysystem\Filesystem) {
    $adapters = $fsService->getOption('adapters');
    $adapterUri = 'http://tao.local/mytao.rdf#i145813022277374';
    if (in_array($adapterUri, array_keys($adapters))) {
        if (isset($adapters[$adapterUri]['options']) && isset($adapters[$adapterUri]['options']['root'])) {
            $rootPath = $adapters[$adapterUri]['options']['root'];
            echo "Fixing ghost response in items...\n";
            $itemUpdater = new \oat\taoQtiItem\model\update\ItemFixGhostResponse($rootPath);
            $itemUpdater->update(true);
            echo "Done !\n";
            exit;
        }
    }
}

echo "Error on fixing ghost item !\n";
