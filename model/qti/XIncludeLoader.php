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
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\XInclude;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\exception\XIncludeException;
use oat\taoQtiItem\model\qti\exception\ParsingException;

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

    public function __construct(Item $qtiItem, ItemMediaResolver $resolver){
        $this->qtiItem = $qtiItem;
        $this->resolver = $resolver;
    }

    public function load($removeUnfoundHref = false){

        $xincludes = $this->getXIncludes();

        foreach($xincludes as $xinclude){
            //retrive the xinclude from href
            $href = $xinclude->attr('href');
            if(!empty($href)){
                $asset = $this->resolver->resolve($href);
                $filePath = $asset->getMediaSource()->download($asset->getMediaIdentifier());
                if(file_exists($filePath)){
                    $this->loadXInclude($xinclude, $filePath);
                }else if($removeUnfoundHref){
                    $xinclude->attr('href', '');
                }else{
                    throw new XIncludeException('The file referenced by href does not exist : '.$href, $xinclude);
                }
            }
        }

        $customElements = $this->getCustomElements();
        foreach($customElements as $customElement){
            $xml = new DOMDocument();
            $xml->formatOutput = true;
            $loadSuccess = $xml->loadXML($customElement->getMarkup());
            $node = $xml->documentElement;
            if($loadSuccess && !is_null($node)){
                $parser = new ParserFactory($xml);
                $xincludesNodes = $parser->queryXPath(".//*[name(.)='include']");
                foreach($xincludesNodes as $xincludeNode){
                    $href = $xincludeNode->getAttribute('href');
                    if(!empty($href)){
                        $asset = $this->resolver->resolve($href);
                        $filePath = $asset->getMediaSource()->download($asset->getMediaIdentifier());
                        if(file_exists($filePath)){
                            $fileContent = file_get_contents($filePath);
                            $xmlInclude = new DOMDocument();
                            $xmlInclude->formatOutput = true;
                            $xmlInclude->loadXML($fileContent);
                            foreach($xmlInclude->documentElement->childNodes as $node){
                                $importNode = $xml->importNode($node, true);
                                $xincludeNode->parentNode->insertBefore($importNode, $xincludeNode);
                            }
                        }else{
                            throw new XIncludeException('The file referenced by href does not exist : '.$href, $xinclude);
                        }
                    }
                    $xincludeNode->parentNode->removeChild($xincludeNode);
                    $xincludes[] = $href;
                }
            }else{
                throw new ParsingException('cannot parse pci markup');
            }
            $customElement->setMarkup($xml->saveXML());
        }
        
        return $xincludes;
    }

    private function loadXInclude(XInclude $xinclude, $filePath){
        //load DOMDocument
        $xml = new DOMDocument();
        $loadSuccess = $xml->load($filePath);
        $node = $xml->documentElement;
        if($loadSuccess && !is_null($node)){
            //parse the href content
            $parser = new ParserFactory($xml);
            $parser->loadContainerStatic($node, $xinclude->getBody());
        }else{
            throw new XIncludeException('Cannot load the XInclude DOM XML', $xinclude);
        }
    }

    private function getXIncludes(){
        $xincludes = array();
        foreach($this->qtiItem->getComposingElements() as $element){
            if($element instanceof XInclude){
                $xincludes[] = $element;
            }
        }
        return $xincludes;
    }

    private function getCustomElements(){
        $customElements = array();
        foreach($this->qtiItem->getComposingElements() as $element){
            if($element instanceof PortableCustomInteraction){
                $customElements[] = $element;
            }
        }
        return $customElements;
    }

}