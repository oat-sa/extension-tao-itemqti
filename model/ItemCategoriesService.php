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
 *
 */
namespace oat\taoQtiItem\model;

use oat\oatbox\service\ConfigurableService;

class ItemCategoriesService extends ConfigurableService
{

    const SERVICE_ID = 'taoQtiItem/ItemCategories';

    public function getCategories($itemUris){

        $categories = array();
        $lookupProperties = $this->getOption('properties');
        if(!empty($lookupProperties)){
            foreach($itemUris as $uri){
                $itemCategories = array();
                $item = new \core_kernel_classes_Resource($uri);
                $properties = $item->getPropertiesValues($lookupProperties);
                /** @var \core_kernel_classes_Property $property */
                foreach($properties as $propertyValues){
                    foreach($propertyValues as $value){
                        $itemCategories[] = ($value instanceof \core_kernel_classes_Resource)? $value->getLabel() : (string)$value;
                    }
                }
                $categories[$uri] =  $itemCategories;
            }
        }
        return $categories;
    }
}
