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
 * Copyright (c) 2013-2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 */

namespace oat\taoQtiItem\model\apip;

use oat\taoQtiItem\helpers\Apip;
use \tao_models_classes_Service;
use \taoItems_models_classes_ItemsService;
use League\Flysystem\File;

/**
 * 
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */
class ApipService extends tao_models_classes_Service
{
    public function storeApipAccessibilityContent(\core_kernel_classes_Resource $item, \DOMDocument $originalDoc)
    {
        $itemService = taoItems_models_classes_ItemsService::singleton();
        
        if (($apipContent = Apip::extractApipAccessibility($originalDoc)) !== null) {
            // Call ApipService to store the data separately.
            $dir = $itemService->getItemDirectory($item);
            $file = new File($dir->getFilesystem(), $dir->getPath().DIRECTORY_SEPARATOR.'apip.xml');
            $file->write($apipContent->saveXML());
            
            \common_Logger::i("APIP content stored for '".$item->getUri()."'.");
        }
    }

    /**
     * Return Apip data for item, null if no data found
     * 
     * @param \core_kernel_classes_Resource $item
     * @return \DOMDocument|NULL
     */
    public function getApipAccessibilityContent(\core_kernel_classes_Resource $item)
    {
        $itemService = taoItems_models_classes_ItemsService::singleton();
        $dir = $itemService->getItemDirectory($item);
        $file = new File($dir->getFilesystem(), $dir->getPath().DIRECTORY_SEPARATOR.'apip.xml');
        if ($file->exists()) {
            $apipContent = new \DOMDocument('1.0', 'UTF-8');
            $apipContent->loadXML($file->read());
            \common_Logger::i("APIP content retrieved for '".$item->getUri()."'.");
            return $apipContent;
        } else {
            return null;
        }
    }
    
    public function getDefaultApipAccessibilityContent(\core_kernel_classes_Resource $item)
    {
        // $item not in used but will be. Namespaces might depend on the APIP version in use.
        $content = new \DOMDocument('1.0', 'UTF-8');
        $content->loadXML('<apipAccessibility xmlns="http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0" xmlns:apip="http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0"/>');
        return $content;
    }
}
