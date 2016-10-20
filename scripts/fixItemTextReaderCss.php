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
 * Usage:
 *
 * dry-run:
 * sudo -u www-data php taoQtiItem/scripts/fixItemTextReaderCss.php data/taoItems/itemData/ dryrun
 *
 * real:
 * sudo -u www-data php taoQtiItem/scripts/fixItemTextReaderCss.php data/taoItems/itemData/
 *
 */

require_once dirname(__FILE__) .'/../../tao/includes/raw_start.php';

common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');

$path = $argv[1];
$dryrun = ($argv[2] === 'dryrun');
if(empty($path)){
    die('the first argument should be the target directory of items to be fixed');
}
if(!is_dir($path)){
    die('target directory does not exist: '.$path);
}
if(!is_writable($path)){
    die('target directory is not writable: '.$path);
}

$itemUpdater = new \oat\taoQtiItem\model\update\ItemFixTextReaderCss($path);
$fixed = $itemUpdater->update(!$dryrun);
echo "Fixed ".count($fixed)." items";
echo PHP_EOL;
