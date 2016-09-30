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
 *
 */
namespace oat\taoQtiItem\model;

use oat\oatbox\service\ConfigurableService;

/**
 *
 * @author Antoine Robin, <antoine@taotesting.com>
 * @package taoQtiItem
 */
class ItemCategoriesService extends ConfigurableService
{

    const SERVICE_ID = 'taoQtiItem/ItemCategories';

    /**
     *
     * Get the categories link to the list of items in parameter.
     * Theses categories come from a configurable list of properties
     * @param \core_kernel_classes_Resource[] $items
     * @return array
     */
    public function getCategories(array $items)
    {
        $categories = array();
        $lookupProperties = $this->getOption('properties');
        if (!empty($lookupProperties)) {
            /** @var \core_kernel_classes_Resource $item */
            foreach ($items as $item) {
                $itemCategories = array();
                $properties = $item->getPropertiesValues($lookupProperties);
                /** @var \core_kernel_classes_Property $property */
                foreach ($properties as $propertyValues) {
                    foreach ($propertyValues as $value) {
                        $itemCategories[] = ($value instanceof \core_kernel_classes_Resource) ? $value->getUri() : (string)$value;
                    }
                }
                $categories[$item->getUri()] = $itemCategories;
            }
        }

        return $categories;
    }
}
