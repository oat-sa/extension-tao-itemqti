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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiItem\model;

use oat\tao\model\ClientLibConfigRegistry;

/**
 * Class QtiCreatorClientConfigRegistry
 * @package oat\taoQtiItem\models
 * @author Ivan Klimchuk <klimchuk@1pt.com>
 */
class QtiCreatorClientConfigRegistry extends ClientLibConfigRegistry
{
    public const CREATOR = "taoQtiItem/controller/creator/index";

    /**
     * @param $name
     * @param $module
     * @param $category
     * @param null $position
     * @throws \common_exception_InvalidArgumentType
     */
    public function registerPlugin($name, $module, $category, $position = null)
    {
        if (!is_string($name)) {
            throw new \common_exception_InvalidArgumentType('The plugin name must be a string!');
        }
        if (!is_string($module)) {
            throw new \common_exception_InvalidArgumentType('The module path must be a string!');
        }
        if (!is_string($category)) {
            throw new \common_exception_InvalidArgumentType('The category name must be a string!');
        }
        if (!is_null($position) && !is_string($position) && !is_numeric($position)) {
            throw new \common_exception_InvalidArgumentType('The position must be a string or a number!');
        }

        $config = [];
        $registry = self::getRegistry();
        if ($registry->isRegistered(self::CREATOR)) {
            $config = $registry->get(self::CREATOR);
        }

        $plugins = [];
        if (isset($config['plugins'])) {
            foreach ($config['plugins'] as $plugin) {
                if ($plugin['module'] != $module) {
                    $plugins[] = $plugin;
                }
            }
        }

        $plugins[] = [
            'name' => $name,
            'module' => $module,
            'category' => $category,
            'position' => $position,
        ];

        $config['plugins'] = array_values($plugins);
        $registry->set(self::CREATOR, $config);
    }

    /**
     * @param $name
     * @param $module
     * @param $category
     * @param null $position
     */
    public function removePlugin($name, $module, $category, $position = null)
    {
        $config = [];
        $registry = self::getRegistry();

        if ($registry->isRegistered(self::CREATOR)) {
            $config = $registry->get(self::CREATOR);
        }

        if (!isset($config['plugins'])) {
            return;
        }

        $plugins = $config['plugins'];

        $plugin = [
            'name' => $name,
            'module' => $module,
            'category' => $category,
            'position' => $position,
        ];

        $key = array_search($plugin, $plugins);
        if (is_numeric($key)) {
            unset($plugins[$key]);
        }

        $config['plugins'] = array_values($plugins);
        $registry->set(self::CREATOR, $config);
    }

    /**
     * Quick access to the plugins
     * @return array the registered plugins
     */
    public function getPlugins()
    {
        $config = [];
        $registry = self::getRegistry();

        if ($registry->isRegistered(self::CREATOR)) {
            $config = $registry->get(self::CREATOR);
        }

        if (!isset($config['plugins'])) {
            return [];
        }

        return $config['plugins'];
    }
}
