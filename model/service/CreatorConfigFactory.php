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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\model\service;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\CreatorConfig;

/**
 * Creator Config service encapsulation
 * Class CreatorConfigService
 * @author Bartlomiej Marszal
 */
class CreatorConfigFactory extends ConfigurableService
{
    public const SERVICE_ID = 'taoQtiItem/CreatorConfigFactory';
    public const OPTION_EXTENDED_CONTROL_ENDPOINTS = 'extendedControlEndpoints';
    public const OPTION_EXTENDED_PROPERTIES = 'extendedProperties';
    /**
     * @return CreatorConfig
     */
    public function getCreatorConfig()
    {
        return new CreatorConfig(
            $this->getOption(self::OPTION_EXTENDED_PROPERTIES, []),
            $this->getOption(self::OPTION_EXTENDED_CONTROL_ENDPOINTS, [])
        );
    }
}
