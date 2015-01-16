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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\qti;

use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\container\Container;
use oat\taoQtiItem\model\qti\Object as QtiObject;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\StyleSheet;
use oat\taoQtiItem\model\qti\InfoControl;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use \SimpleXMLElement;

/**
 * Parse and Extract all assets of an item.
 *
 * @package taoQtiItem
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class AssetParser
{

    /**
     * The item to parse
     * @var Item
     */
    private $item;

    /**
     * The extracted assets
     * @var array
     */
    private $assets = array();

    /**
     * Creates a new parser from an item
     * @param Item $item the item to parse
     */
    public function __construct(Item $item){
        $this->item = $item;
    }

    /**
     * Extract all assets from the current item
     * @return array the assets by type
     */
    public function extract(){
        foreach($this->item->getComposingElements() as $element){
            $this->extractImg($element);
            $this->extractObject($element);
            $this->extractStyleSheet($element);
            $this->extractCustomElement($element);
        }
        return $this->assets;
    }

    private function extractImg(Element $element){
        if($element instanceof Container){
            foreach($element->getElements('oat\taoQtiItem\model\qti\Img') as $img){
                $this->addAsset('img', $img->attr('src'));
            }
        }
    }

    private function extractObject(Element $element){
        if($element instanceof Container){
            foreach($element->getElements('oat\taoQtiItem\model\qti\Object') as $object){
                $this->loadObjectAssets($object);
            }
        }
        if($element instanceof QtiObject){
            $this->loadObjectAssets($element);
        }
    }

    public function extractStyleSheet(Element $element){
        if($element instanceof StyleSheet){
            $this->addAsset('css', $element->attr('href'));
        }
    }

    public function extractCustomElement(Element $element){
        if($element instanceof Container){
            foreach($element->getElements('oat\taoQtiItem\model\qti\interaction\CustomInteraction') as $interaction){
                $this->loadCustomElementAssets($interaction);
            }

            foreach($element->getElements('oat\taoQtiItem\model\qti\interaction\CustomInteraction') as $interaction){
                $this->loadCustomElementAssets($interaction);
            }
        }
        if($element instanceof CustomInteraction){
            $this->loadCustomElementAssets($element);
        }
        if($element instanceof InfoControl){
            $this->loadCustomElementAssets($element);
        }
    }

    /**
     * Loads assets from an QTI object element
     * @param QtiObject $object the object
     */
    private function loadObjectAssets(QtiObject $object){

        $type = $object->attr('type');

        if(strpos($type, "image") !== false){
            $this->addAsset('img', $object->attr('data'));
        }
        else if (strpos($type, "video") !== false  || strpos($type, "ogg") !== false){
            $this->addAsset('video', $object->attr('data'));
        }
        else if (strpos($type, "audio") !== false){
            $this->addAsset('audio', $object->attr('data'));
        }
    }

    /**
     * Add the asset to the current list
     * @param string $type the asset type: img, css, js, audio, video, font, etc.
     * @param string $uri the asset URI
     */
    private function addAsset($type, $uri){
        if(!array_key_exists($type, $this->assets)){
            $this->assets[$type] = array();
        }
        if(!empty($uri) && !in_array($uri, $this->assets[$type])){
            $this->assets[$type][] = $uri;
        }
    }


    private function loadCustomElementAssets(Element $element){

        if($element instanceof PortableCustomInteraction || $element instanceof PortableInfoControl){
            $this->addAsset('js', $element->getEntryPoint());
            foreach($element->getLibraries() as $lib){
                $this->addAsset('js', $lib);
            }
        }

        //parse and extract assets from markup using XPATH
        if($element instanceof CustomInteraction || $element instanceof InfoControl){
            $xml = new SimpleXMLElement($element->getMarkup());
            foreach($xml->xpath('//img') as $img){
                $this->addAsset('img', (string)$img['src']);
            }
            foreach($xml->xpath('//video') as $video){
                $this->addAsset('video', (string)$video['src']);
            }
            foreach($xml->xpath('//audio') as $audio){
                $this->addAsset('audio', (string)$audio['src']);
            }
        }
    }
}
