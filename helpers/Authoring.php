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
use common_Logger;
use DOMDocument;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\Parser;
use \core_kernel_classes_Resource;
use \taoItems_models_classes_ItemsService;
use \tao_helpers_File;
use \common_exception_Error;

/**
 * Helper to provide methods for QTI authoring
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQtiItem
 */
class Authoring
{

    /**
     * Validate and format (if possible) a QTI XML string.
     * 
     * QTI XML string will be sanitized (if possible invalid elements will be removed).
     * 
     * @param string $qti
     * @return string
     * @throws QtiModelException
     */
    public static function validateQtiXml($qti){
        
        $sanitizedQti = self::sanitizeQtiXml($qti);
        
        $dom = self::loadQtiXml($sanitizedQti);
        $returnValue = $dom->saveXML();

        //in debug mode, systematically check if the save QTI is standard compliant
        if(DEBUG_MODE){
            $parserValidator = new Parser($returnValue);
            $parserValidator->validate();
            if(!$parserValidator->isValid()){
                common_Logger::w('Invalid QTI output: '.PHP_EOL.' '.$parserValidator->displayErrors());
                common_Logger::d(print_r(explode(PHP_EOL, $returnValue), true));
                throw new QtiModelException('invalid QTI item XML '.PHP_EOL.' '.$parserValidator->displayErrors());
            }
        }

        return (string) $returnValue;
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
    public static function addRequiredResources($sourceDirectory, $relativeSourceFiles, $prefix, core_kernel_classes_Resource $item, $lang){

        $returnValue = array();

        $folder = taoItems_models_classes_ItemsService::singleton()->getItemFolder($item, $lang);
        
        foreach($relativeSourceFiles as $relPath){
            if(tao_helpers_File::securityCheck($relPath, true)){
                
                $relPath = preg_replace('/^\.\//', '', $relPath);
                $source = $sourceDirectory.$relPath;
                
                $destination = tao_helpers_File::concat(array(
                    $folder,
                    $prefix ? $prefix : '',
                    $relPath
                ));
                
                if(tao_helpers_File::copy($source, $destination)){
                    $returnValue[] = $relPath;
                }else{
                    throw new common_exception_Error('the resource "'.$source.'" cannot be copied');
                }
            }else{
                throw new common_exception_Error('invalid resource file path');
            }
        }

        return $returnValue;
    }
    
    /**
     * Remove invalid elements and attributes from QTI XML. 
     * @param string $qti
     * @return string sanitized XML
     */
    public static function sanitizeQtiXml($qti)
    {
        $doc = self::loadQtiXml($qti);
        
        $xpath = new \DOMXpath($doc);
        
        foreach ($xpath->query("//*[local-name() = 'itemBody']//*[@style]") as $elementWithStyle) {
            $elementWithStyle->removeAttribute('style');
        }
        
        return $doc->saveXML();
    }
    
    /**
     * Load QTI xml and return DOMDocument instance. 
     * If string is not valid xml then QtiModelException will be thrown.
     * @param string $qti
     * @throws QtiModelException
     * @return DOMDocument
     */
    public static function loadQtiXml($qti) 
    {
        $errors = array();
        
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;
        $dom->preserveWhiteSpace = false;
        $dom->validateOnParse = false;
        
        libxml_use_internal_errors(true);
        
        if (!$dom->loadXML($qti)) {
            $errors = libxml_get_errors();
            throw new QtiModelException('Wrong QTI item output format');
        }
        
        return $dom;
    }
}
