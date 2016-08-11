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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */

namespace oat\taoQtiItem\helpers;

use \core_kernel_classes_Resource;
use \taoItems_models_classes_ItemsService;

/**
 * @access public
 * @package tao
 */
class QtiFile
{
    const FILE = 'qti.xml';

    /**
     * @deprecated by fly-system ()
     *
     * @param core_kernel_classes_Resource $item
     * @param string $langCode
     * @return string
     * @throws \common_Exception
     */
    public static function getQtiFilePath(core_kernel_classes_Resource $item, $langCode = '')
    {
        $itemPath = taoItems_models_classes_ItemsService::singleton()->getItemFolder($item, $langCode);
        return $itemPath.self::FILE;
    }

    /**
     * Get content of qti.xml following an item + language
     *
     * @param core_kernel_classes_Resource $item
     * @param string $language
     * @return false|string
     * @throws \common_Exception
     */
    public static function getQtiFileContent(core_kernel_classes_Resource $item, $language = '')
    {
        $itemDirectory = taoItems_models_classes_ItemsService::singleton()->getItemDirectory($item, $language);
        return $itemDirectory->read(self::FILE);
    }
}