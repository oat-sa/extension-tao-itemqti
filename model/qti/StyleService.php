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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti;

use \tao_models_classes_Service;
use \core_kernel_classes_Class;
use \core_kernel_classes_Resource;
use oat\taoQtiItem\model\ItemModel;
use \taoItems_models_classes_ItemsService;
use SimpleXMLElement;

class StyleService extends tao_models_classes_Service
{

    const STYLE_NAME_PATTERN = '([a-zA-Z0-9_-]*)';

    private function isQtiItem(core_kernel_classes_Resource $itemResource){
        $itemService = taoItems_models_classes_ItemsService::singleton();
        return $itemService->hasItemModel($itemResource, [ItemModel::MODEL_URI]);
    }

    /**
     * 
     * @param core_kernel_classes_Resource $itemResource
     * @param string $langCode
     * @return SimpleXMLElement
     */
    private function getItemContent(core_kernel_classes_Resource $itemResource, $langCode = ''){
        $itemService = taoItems_models_classes_ItemsService::singleton();
        if($this->isQtiItem($itemResource)){
            $itemContent = $itemService->getItemContent($itemResource, $langCode);
            if(!empty($itemContent)){
                return simplexml_load_string($itemContent);
            }
        }
        return null;
    }

    /**
     * 
     * @param core_kernel_classes_Resource $itemResource
     * @param string $langCode
     * @return SimpleXMLElement
     */
    private function setItemContent(SimpleXMLElement $content, core_kernel_classes_Resource $itemResource, $langCode = ''){
        $itemService = taoItems_models_classes_ItemsService::singleton();
        if($this->isQtiItem($itemResource)){
            return $itemService->setItemContent($itemResource, $content->asXML(), $langCode);
        }
        return false;
    }

    public function getBodyStyles(core_kernel_classes_Resource $itemResource, $langCode = ''){
        $itemContent = $this->getItemContent($itemResource, $langCode);
        if(is_null($itemContent)){
            throw new \common_Exception('cannot find valid qti item content');
        }else{
            $classAttr = (string) $itemContent->itemBody['class'];
            preg_match_all('/x-tao-style-'.self::STYLE_NAME_PATTERN.'/', $classAttr, $matches);
            if(isset($matches[1])){
                return $matches[1];
            }
        }
    }

    public function addBodyStyles($styleNames, core_kernel_classes_Resource $itemResource, $langCode = ''){
        $itemContent = $this->getItemContent($itemResource, $langCode);
        if(is_null($itemContent)){
            throw new \common_Exception('cannot find valid qti item content');
        }else{
            $classAttr = (string) $itemContent->itemBody['class'];
            foreach($styleNames as $styleName){
                if(!empty($styleName) && preg_match(self::STYLE_NAME_PATTERN, $styleName)){
                    $newClass = 'x-tao-style-'.$styleName;
                    if(strpos($classAttr, $styleName) === false){
                        $classAttr .= ' '.$newClass;
                    }
                }else{
                    throw new \common_Exception('invalid style name');
                }
            }
            $itemContent->itemBody['class'] = trim($classAttr);
            $this->setItemContent($itemContent, $itemResource);
        }
    }

    public function removeBodyStyles($styleNames, core_kernel_classes_Resource $itemResource, $langCode = ''){
        $itemContent = $this->getItemContent($itemResource, $langCode);
        if(is_null($itemContent)){
            throw new \common_Exception('cannot find valid qti item content');
        }else{
            $classAttr = (string) $itemContent->itemBody['class'];
            foreach($styleNames as $styleName){
                if(!empty($styleName) && preg_match(self::STYLE_NAME_PATTERN, $styleName)){
                    $styleName = 'x-tao-style-'.$styleName;
                    $classAttr = preg_replace('/(?:^|\\s)'.$styleName.'(?:\\s|$)/', ' ', $classAttr);
                }else{
                    throw new \common_Exception('invalid style name');
                }
            }
            $itemContent->itemBody['class'] = trim($classAttr);
            $this->setItemContent($itemContent, $itemResource);
        }
    }

    public function getClassBodyStyles(core_kernel_classes_Class $itemClass){
        $usages = [];
        $union = [];
        $intersect = [];
        $items = $itemClass->getInstances(true);
        $i = 0;
        foreach($items as $item){
            if($this->isQtiItem($item)){
                try{
                    $styles = $this->getBodyStyles($item);
                    $usages[$item->getUri()] = $styles;
                    if($i){
                        $intersect = array_intersect($styles, $intersect);
                    }else{
                        $intersect = $styles;
                    }
                    $union = array_unique(array_merge($styles, $union));
                    $i++;
                }catch(\common_Exception $e){}
            }
        }
        return [
            'all' => $union,
            'checked' => $intersect,
            'indeterminate' => array_values(array_diff($union, $intersect))
        ];
    }

    public function addClassBodyStyles($styleNames, core_kernel_classes_Class $itemClass){
        $items = $itemClass->getInstances(true);
        foreach($items as $item){
            if($this->isQtiItem($item)){
                $this->addBodyStyles($styleNames, $item);
            }
        }
    }

    public function removeClassBodyStyles($styleNames, core_kernel_classes_Class $itemClass){
        $items = $itemClass->getInstances(true);
        foreach($items as $item){
            if($this->isQtiItem($item)){
                $this->removeBodyStyles($styleNames, $item);
            }
        }
    }

}