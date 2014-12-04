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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\scripts\update;

use oat\taoQtiItem\model\SharedLibrariesRegistry;
use oat\tao\model\ClientLibRegistry;

/**
 * 
 * @author Sam <sam@taotesting.com>
 */
class Updater extends \common_ext_ExtensionUpdater
{

    /**
     * 
     * @param string $initialVersion
     * @return string
     */
    public function update($initialVersion){

        $currentVersion = $initialVersion;

        //migrate from 2.6 to 2.7.0
        if($currentVersion == '2.6'){

            //add portable shared libraries:
            $libBasePath = ROOT_PATH.'taoQtiItem/views/js/portableSharedLibraries';
            $libRootUrl = ROOT_URL.'taoQtiItem/views/js/portableSharedLibraries';
            $installBasePath = ROOT_PATH.'taoQtiItem/install/local/portableSharedLibraries';

            $registry = new SharedLibrariesRegistry($libBasePath, $libRootUrl);
            $registry->registerFromFile('IMSGlobal/jquery_2_1_1', $installBasePath.'/IMSGlobal/jquery_2_1_1.js');
            $registry->registerFromFile('OAT/lodash', $installBasePath.'/OAT/lodash.js');
            $registry->registerFromFile('OAT/async', $installBasePath.'/OAT/async.js');
            $registry->registerFromFile('OAT/raphael', $installBasePath.'/OAT/raphael.js');
            $registry->registerFromFile('OAT/scale.raphael', $installBasePath.'/OAT/scale.raphael.js');
            $registry->registerFromFile('OAT/util/xml', $installBasePath.'/OAT/util/xml.js');
            $registry->registerFromFile('OAT/util/math', $installBasePath.'/OAT/util/math.js');
            $registry->registerFromFile('OAT/util/html', $installBasePath.'/OAT/util/html.js');
            $registry->registerFromFile('OAT/util/EventMgr', $installBasePath.'/OAT/util/EventMgr.js');
            $registry->registerFromFile('OAT/util/event', $installBasePath.'/OAT/util/event.js');

            $currentVersion = '2.7.0';
        }
        if ($currentVersion == '2.7.0') {
            //sharelib was not registered as clientLib before, it is now the case
            $libBasePath = ROOT_PATH.'taoQtiItem/views/js/portableSharedLibraries';
            $libRootUrl = ROOT_URL.'taoQtiItem/views/js/portableSharedLibraries';
            
            $registry = new SharedLibrariesRegistry($libBasePath, $libRootUrl);
            foreach ($registry->getMap() as $id => $url){
                $file = pathinfo($url);
                $path = str_replace($file['basename'], $file['filename'],$url);
                
                ClientLibRegistry::getRegistry()->register($id, $path);
            }
            $currentVersion = '2.7.1';
        }
        return $currentVersion;
    }

}