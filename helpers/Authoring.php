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

use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\Parser;
use \DOMDocument;
use \common_Logger;

/**
 * Helper to provide methods for QTI authoring
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 
 */
class Authoring
{
    
    public static function setMediaResouceUrl($data){

        $returnValue = $data;

        $data = trim($data);
        if(!empty($data)){
            try{ //Parse data and replace img src by the media service URL
                $updated = false;
                $doc = new DOMDocument;
                if($doc->loadHTML($data)){

                    $tags = array('img', 'object');
                    $srcAttr = array('src', 'data');
                    $xpath = new DOMXpath($doc);
                    $query = implode(' | ', array_map(create_function('$a', "return '//'.\$a;"), $tags));
                    foreach($xpath->query($query) as $element){
                        foreach($srcAttr as $attr){
                            if($element->hasAttribute($attr)){
                                $source = trim($element->getAttribute($attr));
                                if(!preg_match("/^http/", $source)){
                                    $updated = true;
                                    $element->setAttribute($attr, _url('getMediaResource', 'Items', 'taoItems', array('path' => $source)));
                                }
                            }
                        }
                    }
                }

                if($updated){
                    $returnValue = $doc->saveHTML();
                }
            }catch(DOMException $de){
                //we render it anyway
                common_Logger::w('DOMException in QTI data filtering');
            }
        }

        return $returnValue;
    }

    public static function restoreMediaResourceUrl($data){

        $regex = '/'.preg_quote(_url('getMediaResource', 'Items', 'taoItems').'?path=', '/').'([^"\']*)/im';
        $returnValue = preg_replace_callback(
                $regex, function ($matches){
                    return isset($matches[1]) ? urldecode($matches[1]) : urldecode($matches[0]);
                }, $data);

        return $returnValue;
    }

    public static function getAvailableAuthoringElements(){
        return array(
            'Text' => array(
                array('title' => __('Text Block'),
                    'icon' => 'font',
                    'short' => __('Text'),
                    'qtiClass' => 'text'
                ),
                array('title' => __('Rubric Block'),
                    'icon' => 'background-color',
                    'short' => __('Rubric'),
                    'qtiClass' => 'rubricBlock'
                ),
                array('title' => __('Math'),
                    'icon' => 'special-character',
                    'short' => __('Math'),
                    'qtiClass' => 'math'
                )
            ),
            'Interactions' => array(
                array('title' => __('Choice Interaction'),
                    'icon' => 'choice',
                    'short' => __('Choice'),
                    'qtiClass' => 'choiceInteraction'
                ),
                array('title' => __('Order Interaction'),
                    'icon' => 'order',
                    'short' => __('Order'),
                    'qtiClass' => 'orderInteraction'
                ),
                array('title' => __('Match Interaction'),
                    'icon' => 'match',
                    'short' => __('Match'),
                    'qtiClass' => 'matchInteraction'
                ),
                array('title' => __('Associate Interaction'),
                    'icon' => 'associate',
                    'short' => __('Associate'),
                    'qtiClass' => 'associateInteraction'
                ),
                array('title' => __('Graphic Gap Interaction'),
                    'icon' => 'graphic-gap',
                    'short' => __('Graphic Gap'),
                    'qtiClass' => 'graphicGapInteraction'
                ),
                array('title' => __('Graphic Order Interaction'),
                    'icon' => 'graphic-order',
                    'short' => __('Graphic Order'),
                    'qtiClass' => 'graphicOrderInteraction'
                ),
                array('title' => __('Hotspot Interaction'),
                    'icon' => 'hotspot',
                    'short' => __('Hotspot'),
                    'qtiClass' => 'hotspotInteraction'
                ),
                array('title' => __('Graphic Associate Interaction'),
                    'icon' => 'graphic-associate',
                    'short' => __('Graphic Associate'),
                    'qtiClass' => 'graphicAssociateInteraction'
                ),
                array('title' => __('Select Point Interaction'),
                    'icon' => 'select-point',
                    'short' => __('Select Point'),
                    'qtiClass' => 'selectPointInteraction'
                ),
                array('title' => __('Slider Interaction'),
                    'icon' => 'slider',
                    'short' => __('Slider'),
                    'qtiClass' => 'sliderInteraction'
                ),
                array('title' => __('Text Entry Interaction'),
                    'icon' => 'text-entry',
                    'short' => __('Text Entry'),
                    'qtiClass' => 'textEntryInteraction'
                ),
                array('title' => __('Extended Text Interaction'),
                    'icon' => 'text-entry',
                    'short' => __('Extended Text'),
                    'qtiClass' => 'extendedTextInteraction'
                )
            ),
            'Media' => array(
                array('title' => __('Image'),
                    'icon' => 'choice',
                    'short' => __('Image'),
                    'qtiClass' => 'img'
                ),
                array('title' => __('Video'),
                    'icon' => 'match',
                    'short' => __('Video'),
                    'qtiClass' => 'object.video'
                )
            )
        );
    }
    
    public static function validateQtiXml($qti){

        $returnValue = '';

        // render and clean the xml
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;
        $dom->preserveWhiteSpace = false;
        $dom->validateOnParse = false;
        
        common_Logger::d($qti);
        if($dom->loadXML($qti)){
            $returnValue = $dom->saveXML();

            //in debug mode, systematically check if the save QTI is standard compliant
            if(DEBUG_MODE){
                $parserValidator = new Parser($returnValue);
                $parserValidator->validate();
                if(!$parserValidator->isValid()){
                    common_Logger::w('Invalid QTI output : '.PHP_EOL.' '.$parserValidator->displayErrors());
//                    common_Logger::d(print_r(explode(PHP_EOL, $returnValue),true));
                }
            }
        }else{
            $parserValidator = new Parser($qti);
            $parserValidator->validate();
            if(!$parserValidator->isValid()){
                throw new QtiModelException('Wrong QTI item output format');
            }
        }

        return (string) $returnValue;
    }

}