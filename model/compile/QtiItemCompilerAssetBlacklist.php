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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\compile;

use oat\oatbox\service\ConfigurableService;

/**
 * Short description of class oat\taoQtiItem\model\compile\QtiItemCompilerAssetBlacklist
 *
 * @access public
 * @author Antoine Robin, <antoine@taotesting.com>
 * @package taoQTI
 */
class QtiItemCompilerAssetBlacklist extends ConfigurableService
{
    public const SERVICE_ID = 'taoQtiItem/compileBlacklist';

    public const BLACKLIST = 'blacklist';

    private $blacklist = [];

    /**
     * QtiItemCompilerAssetBlacklist constructor.
     * @param array $options
     */
    public function __construct(array $options = [])
    {
        parent::__construct($options);
        $this->blacklist = ($this->hasOption(self::BLACKLIST)) ? $this->getOption(self::BLACKLIST) : [];
    }

    /**
     * Allow to know if a path is blacklisted or not
     * @param string $assetPath
     * @return bool
     */
    public function isBlacklisted($assetPath)
    {
        foreach ($this->blacklist as $pattern) {
            if (preg_match($pattern, $assetPath) === 1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get the list of blacklisted pattern
     * @return array
     */
    public function getBlacklist()
    {
        return $this->blacklist;
    }

    /**
     * set new list of blacklisted pattern
     * @param $blacklist
     */
    public function setBlacklist($blacklist)
    {
        $this->blacklist = $blacklist;
    }
}
