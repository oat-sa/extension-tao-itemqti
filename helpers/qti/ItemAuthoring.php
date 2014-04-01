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
 * Copyright (c) 2013 (original work) Open Assessment Techonologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

namespace oat\taoQtiItem\helpers\qti;

use oat\taoQtiItem\helpers\qti\ItemAuthoring;
use \HTMLPurifier;
use \HTMLPurifier_Config;
use \common_Logger;
use \DOMDocument;
use \DOMXPath;

require_once(ROOT_PATH.'/tao/lib/htmlpurifier/HTMLPurifier.auto.php');

/**
 * Helper to provide methods for QTI authoring
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 * @subpackage helpers_qti
 */
class ItemAuthoring
{

    static protected $purifiers = array();

    /**
     * Get the definition of HTML purifier
     *
     * @param string $filterModel
     * @return HTMLPurifier
     */
    public static function getQTIhtmlPurifier($filterModel = 'blockStatic'){

        if(!isset(self::$purifiers[$filterModel]) || !self::$purifiers[$filterModel] instanceof HTMLPurifier){ //configure purifier here:
            $math = array(
                'math', 'maction', 'maligngroup', 'malignmark', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mlongdiv', 'mmultiscripts', 'mn',
                'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mscarries', 'mscarry', 'msgroup', 'msline', 'mspace', 'msqrt', 'mrow', 'mstack', 'mstyle', 'msub', 'msup', 'msubsup',
                'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'semantics', 'annotation', 'annotation-xml'
            );
            $math = array();

            $simpleInline = array(
                'a',
                'abbr',
                'acronym',
                'b',
                'big',
                'cite',
                'code',
                'dfn',
                'em',
                'i',
                'kbd',
                'q',
                'samp',
                'small',
                'span',
                'strong',
                'sub',
                'sup',
                'tt',
                'var'
            );

            $atomicInline = array(
                'br',
                'img' //attr !=
            );

            $object = array(
                'object', //attributes(objectFlow, data, type, width, height)
                'param', //attributes(name,value,valuetype,type)
            );

            $inlineStatic = array_merge($atomicInline, $simpleInline, $object, $math);


            $simpleBlock = array(
                'blockquote'
            );

            $atomicBlock = array(
                'address',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'pre' //not include img, object, big, small,sub, sup
            );

            $table = array(
                'table', //attributes(summary, caption, col, colgroup, thead, tfoot, tbody)
                'caption',
                'col',
                'colgroup',
                'thead',
                'tfoot',
                'tbody',
                'tr',
                'th', //scope,abbr
                'td',
            );

            $blockStatic = array_merge(
                    array(
                'div',
                'dl',
                'hr',
                'ol',
                'ul',
                'li',
                'dt',
                'dd',
                    ), $atomicBlock, $simpleBlock, $table, $inlineStatic, //block contains flow
                    $math
            );

            $flowStatic = array_merge($blockStatic, $atomicInline); //block contains "math"

            $qtiTags = array();
            $purifierDefinition = 'qti-custom.html';
            $allowedAttributes = 'id,class,lang,img.src,img.alt,img.height,img.width,object.data,object.type,object.height,object.width,param.name,param.value,param.valuetype,param.type,a.href';
            switch($filterModel){
                //for prompt:
                case 'inlineStatic':{
                        $qtiTags = $inlineStatic;
                        $purifierDefinition .= ' inlineStatic';
                        break;
                    }
                //for simple choice
                case 'flowStatic':{
                        $qtiTags = $flowStatic;
                        $purifierDefinition .= ' flowStatic';
                        $allowedAttributes .= ',blockquote.cite,table.summary,col.span,colgroup.span,td.scope,td.rowspan,td.colspan,th.scope,th.rowspan,th.colspan';
                        break;
                    }
                //for item body, share the same restrictions from authorized HTML tags perspective
                case 'bodyElement':
                //for gap match and hottext interactions
                case 'blockStatic':
                default:{
                        $qtiTags = $blockStatic;
                        $purifierDefinition .= ' blockStatic';
                        $allowedAttributes .= ',blockquote.cite,table.summary,col.span,colgroup.span,td.scope,td.rowspan,td.colspan,th.scope,th.rowspan,th.colspan';
                        break;
                    }
            }

            $config = HTMLPurifier_Config::createDefault();
            $config->set('Cache.SerializerPath', ROOT_PATH.'tao/data/cache/htmlpurifier');
            if(DEBUG_MODE){
                $config->set('Cache.DefinitionImpl', null); //to prevent the definition to be cached
            }
            $config->set('HTML.AllowedElements', implode(',', $qtiTags));
            $config->set('HTML.DefinitionID', $purifierDefinition);
            $config->set('HTML.DefinitionRev', 1);
            $config->set('HTML.BlockWrapper', 'p');
            $config->set('Attr.EnableID', true); //need to manually allow id, which is removed overwise
            $config->set('HTML.AllowedAttributes', $allowedAttributes);
            $config->set('HTML.Doctype', 'XHTML 1.0 Strict');
            if($def = $config->maybeGetRawHTMLDefinition()){

                common_Logger::i('QTI-html purifier cache has been recreated', array('QTIdebug'));

                $img = $def->addElement(
                        'img', // name
                        'Inline', // content set
                        'Empty', // allowed children
                        'Common', // attribute collection
                        array(// attributes
                    'src*' => 'URI',
                    'alt' => 'CDATA',
                    'longdesc' => 'CDATA',
                    'height' => 'Length',
                    'width' => 'Length',
                        )
                );

                $object = $def->addElement(
                        'object', 'Block', 'Flow', 'Common', array(
                    'data*' => 'URI',
                    'type' => 'CDATA',
                    'width' => 'Length',
                    'height' => 'Length'
                        )
                );

                //can only apprear in object
                $param = $def->addElement(
                        'param', 'Block', //false : need to manually register param
                        'Empty', 'Common', array(
                    'name*' => 'URI',
                    'value*' => 'CDATA',
                    'valuetype' => 'Enum#DATA|REF',
                    'type' => 'CDATA'
                        )
                );

                $def->addAttribute('th', 'abbr', 'CDATA');
                $def->addAttribute('th', 'scope', 'Enum#row|col|rowgroup|colgroup');
                $def->addAttribute('td', 'abbr', 'CDATA');
                $def->addAttribute('td', 'scope', 'Enum#row|col|rowgroup|colgroup');
            }

            self::$purifiers[$filterModel] = new HTMLPurifier($config);
        }

        return self::$purifiers[$filterModel];
    }

    /**
     * Clean and format HTML input
     *
     * @param string $html
     * @param string $filterModel
     * @return string
     */
    public static function cleanHTML($html, $filterModel = 'blockStatic'){

        $html = self::getQTIhtmlPurifier($filterModel)->purify($html);

        return $html;
    }

    /**
     * Filter the data for the authoring needs
     *
     * @param string $data
     * @return string
     */
    public static function filterData($data, $filterModel = 'blockStatic'){

        $returnValue = $data;

        $data = trim($data);
        if(!empty($data)){
            $returnValue = self::cleanHTML($data, $filterModel);
            $returnValue = self::setMediaResouceUrl($returnValue);
        }

        return $returnValue;
    }

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
                    'short' => __('Image')
                ),
                array('title' => __('Video'),
                    'icon' => 'match',
                    'short' => __('Video')
                )
            )
        );
    }

}