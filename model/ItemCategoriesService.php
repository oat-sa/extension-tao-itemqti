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
 *
 * @deprecated Use oat\taoItems\model\CategoryService instead
 */
class ItemCategoriesService extends ConfigurableService
{
    public const SERVICE_ID = 'taoQtiItem/ItemCategories';

    /**
     * Get the categories link to the list of items in parameter.
     * Theses categories come from a configurable list of properties.
     * The category label is also set in a configurable list
     * @param \core_kernel_classes_Resource[] $items
     * @return array of categories for specified items
     * ['itemUri' => ['CATEGORY1', 'CATEGORY2']]
     */
    public function getCategories(array $items)
    {
        $categories = [];
        $lookupProperties = $this->getOption('properties');
        if (!empty($lookupProperties)) {
            foreach ($items as $item) {
                $itemCategories = [];
                if ($item instanceof \core_kernel_classes_Resource) {
                    $properties = $item->getPropertiesValues(array_keys($lookupProperties));
                    foreach ($properties as $property => $propertyValues) {
                        foreach ($propertyValues as $value) {
                            $propertyValue = ($value instanceof \core_kernel_classes_Resource)
                                ? $value->getUri()
                                : (string)$value;

                            if (isset($lookupProperties[$property][$propertyValue])) {
                                $itemCategories[] = $lookupProperties[$property][$propertyValue];
                            }
                        }
                    }
                    $categories[$item->getUri()] = $itemCategories;
                }
            }
        }

        return $categories;
    }
}
