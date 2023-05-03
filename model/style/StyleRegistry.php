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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\style;

use oat\oatbox\AbstractRegistry;
use common_ext_ExtensionsManager;
use common_Logger;

/**
 *
 * Registry to store available style classes
 *
 * @author Sam, sam@taotesting.com
 */
class StyleRegistry extends AbstractRegistry
{
    /**
     * @see \oat\oatbox\AbstractRegistry::getConfigId()
     */
    protected function getConfigId()
    {
        return 'style_class_registry';
    }

    /**
     * @see \oat\oatbox\AbstractRegistry::getExtension()
     */
    protected function getExtension()
    {
        return common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
    }

    /**
     * Get all styles available from the registry
     *
     * @return array
     */
    public function getAllStyles()
    {
        $styles = [];
        foreach (self::getRegistry()->getMap() as $id => $styleData) {
            $styles[$id] = $styleData;
        }
        return $styles;
    }

    /**
     * Check if the array contains sufficient style data
     *
     * @param array $data
     * @return boolean
     */
    public function isValidStyleData($data)
    {
        return isset($data['label']) && !empty($data['label']);
    }

    /**
     * Register a style
     *
     * @param string $id
     * @param array $styleData
     */
    public function register($id, $styleData)
    {
        if (self::getRegistry()->isRegistered($id)) {
            common_Logger::w('Style already registered');
        }
        if ($this->isValidStyleData($styleData)) {
            self::getRegistry()->set($id, $styleData);
        } else {
            common_Logger::w('Invalid style data format');
        }
    }
}
