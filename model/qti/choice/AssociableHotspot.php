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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\qti\choice;

/**
 * QTI Hotspot definition
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI

 */
class AssociableHotspot extends Hotspot
{
    /**
     * the QTI tag name as defined in QTI standard
     *
     * @access protected
     * @var string
     */
    protected static $qtiTagName = 'associableHotspot';

    protected function getUsedAttributes()
    {
        return array_merge(
            parent::getUsedAttributes(),
            [
                'oat\\taoQtiItem\\model\\qti\\attribute\\MatchMax',
                'oat\\taoQtiItem\\model\\qti\\attribute\\MatchMin',
                'oat\\taoQtiItem\\model\\qti\\attribute\\DataStart',
                'oat\\taoQtiItem\\model\\qti\\attribute\\DataEnd'
            ]
        );
    }
}
