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

namespace oat\taoQtiItem\model\portableElement\clientConfigRegistry;

use oat\tao\model\ClientLibConfigRegistry;

/**
 * Class AbstractPortableElementRegistry
 * @package oat\taoQtiItem\model\portableElement\clientConfigRegistry
 * @author Sam <sam@taotesting.com>
 */
abstract class AbstractPortableElementRegistry extends ClientLibConfigRegistry
{
    public const CI_REGISTRY = "taoQtiItem/portableElementRegistry/ciRegistry";

    abstract protected function getClientModule();

    /**
     * @param $name
     * @param $module
     * @throws \common_exception_InvalidArgumentType
     */
    public function registerProvider($name, $module)
    {
        if (!is_string($name)) {
            throw new \common_exception_InvalidArgumentType('The registry name must be a string!');
        }
        if (!is_string($module)) {
            throw new \common_exception_InvalidArgumentType('The registry module must be a string!');
        }

        $config = [];
        $registry = self::getRegistry();
        if ($registry->isRegistered($this->getClientModule())) {
            $config = $registry->get($this->getClientModule());
        }

        $entries = [];
        if (isset($config['providers'])) {
            foreach ($config['providers'] as $entry) {
                if ($entry['module'] != $module) {
                    $entries[] = $entry;
                }
            }
        }

        $entries[] = [
            'name' => $name,
            'module' => $module
        ];

        $config['providers'] = $entries;
        $registry->set($this->getClientModule(), $config);
    }

    /**
     * @param $name
     * @param $module
     */
    public function removeProvider($name, $module)
    {
        $config = [];
        $registry = self::getRegistry();

        if ($registry->isRegistered($this->getClientModule())) {
            $config = $registry->get($this->getClientModule());
        }

        if (!isset($config['providers'])) {
            return;
        }

        $entries = $config['providers'];

        $entry = [
            'name' => $name,
            'module' => $module
        ];

        $key = array_search($entry, $entries);
        if (is_numeric($key)) {
            unset($entries[$key]);
        }

        $config['providers'] = $entries;
        $registry->set($this->getClientModule(), $config);
    }
}
