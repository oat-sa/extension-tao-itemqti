<?php

/*
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
 *
 */

namespace oat\taoQtiItem\helpers;

//use oat\taoQtiItem\helpers\Authoring;
use DOMDocument;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use \core_kernel_classes_Resource;
use \taoItems_models_classes_ItemsService;
use \common_exception_Error;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\AuthoringService;

/**
 * Helper to provide methods for QTI authoring
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQtiItem
 * @deprecated please use AuthoringService
 */
class Authoring
{

    /**
     * Validate a QTI XML string.
     * 
     * @param string $qti File path or XML string
     * @throws QtiModelException
     */
    public static function validateQtiXml($qti)
    {
        self::getService()->validateQtiXml($qti);
    }

    /**
     * Simple function to check if the item is not missing any of the required asset configuration path
     * @param string $qti
     * @throws QtiModelException
     * @throws common_exception_Error
     */
    public static function checkEmptyMedia($qti){
        self::getService()->checkEmptyMedia($qti);
    }

    /**
     * Add a list of required resources files to an RDF item and keeps the relative path structure
     * For instances, required css, js etc.
     * 
     * @param string $sourceDirectory
     * @param array $relativeSourceFiles
     * @param core_kernel_classes_Resource $item
     * @param string $lang
     * @return array
     * @throws common_exception_Error
     */
    public static function addRequiredResources($sourceDirectory, $relativeSourceFiles, $prefix, core_kernel_classes_Resource $item, $lang)
    {

        $returnValue = array();

        $directory = taoItems_models_classes_ItemsService::singleton()->getItemDirectory($item, $lang);
        return self::getService()->addRequiredResources($sourceDirectory, $relativeSourceFiles, $prefix, $directory);
    }
    
    /**
     * Remove invalid elements and attributes from QTI XML. 
     * @param string $qti File path or XML string
     * @return string sanitized XML
     */
    public static function sanitizeQtiXml($qti)
    {
        return self::getService()->sanitizeQtiXml($qti);
    }
    
    /**
     * Load QTI xml and return DOMDocument instance. 
     * If string is not valid xml then QtiModelException will be thrown.
     *
     * @param string|File $file If it's a string it can be a file path or an XML string
     * @throws QtiModelException
     * @throws common_exception_Error
     * @return DOMDocument
     */
    public static function loadQtiXml($file) 
    {
        return self::getService()->loadQtiXml($file);
    }

    /**
     * @return AuthoringService
     */
    private static function getService() {
        return ServiceManager::getServiceManager()->get(AuthoringService::SERVICE_ID);
    }
}
