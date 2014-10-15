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

use oat\taoQtiItem\model\SharedLibrariesRegistry;
use \helpers_File;

$libBasePath = ROOT_PATH . 'taoQtiItem/views/js/portableSharedLibraries';
$libRootUrl = ROOT_URL . 'taoQtiItem/views/js/portableSharedLibraries';
$installBasePath = ROOT_PATH . 'taoQtiItem/install/local/portableSharedLibraries';

// clean directory...
helpers_File::emptyDirectory($libBasePath, true);

$registry = new SharedLibrariesRegistry($libBasePath, $libRootUrl);
$registry->registerFromFile('IMSGlobal/jquery_2_1_1', $installBasePath . '/IMSGlobal/jquery_2_1_1.js');
$registry->registerFromFile('OAT/lodash', $installBasePath . '/OAT/lodash.js');
$registry->registerFromFile('OAT/async', $installBasePath . '/OAT/async.js');
$registry->registerFromFile('OAT/raphael', $installBasePath . '/OAT/raphael.js');
$registry->registerFromFile('OAT/scale.raphael', $installBasePath . '/OAT/scale.raphael.js');