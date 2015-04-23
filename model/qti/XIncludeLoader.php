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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA
 *               
 */

namespace oat\taoQtiItem\model\qti;

use DOMDocument;
use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\exception\XIncludeException;

/**
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI

 */
class XIncludeLoader
{

    protected $qtiItem = null;
    protected $resolver = null;

    public function __construct($qtiItem, $resolver){
        $this->qtiItem = $qtiItem;
        $this->resolver = $resolver;
    }

    public function load(){

        $xincludes = $this->getXIncludes();
        foreach($xincludes as $xinclude){
            //retrive the xinclude from href
            $href = $xinclude->attr('href');
            if(!empty($href)){
                $asset = $this->resolver->resolve($href);
                $filePath = $asset->getMediaSource()->download($asset->getMediaIdentifier());
                if(file_exists($filePath)){
                    $this->loadXInclude($xinclude, $filePath);
                }else{
                    throw new XIncludeException('The file referenced by href does not exist : '.$href);
                }
            }
        }

        return $xincludes;
    }

    private function loadXInclude($xinclude, $filePath){
        //load DOMDocument
        $xml = new DOMDocument();
        $xml->load($filePath);
        $node = $xml->documentElement;
        if(!is_null($node)){
            //parse the href content
            $parser = new ParserFactory($xml);
            $parser->loadContainerStatic($node, $xinclude->getBody());
        }else{
            throw new XIncludeException('Cannot load the XInclude DOM XML');
        }
    }

    private function getXIncludes(){
        $xincludes = array();
        $xincludeClass = 'oat\taoQtiItem\model\qti\XInclude';
        foreach($this->qtiItem->getComposingElements() as $element){
            if($element instanceof $xincludeClass){
                $xincludes[] = $element;
            }
        }
        return $xincludes;
    }

}