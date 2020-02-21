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
 * Copyright (c) 2020 Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\qti\attribute;

use oat\taoQtiItem\model\qti\attribute\Interpretation;
use oat\taoQtiItem\model\qti\attribute\Attribute;

/**
 * The externalScored attribute
 *
 * @access public
 * @author Anshul Sharma, <ansul@taotesting.com>
 * @package taoQTI

 */
class ExternalScored extends Attribute
{

    static protected $name = 'externalScored';
    static protected $type = 'oat\\taoQtiItem\\model\\qti\\datatype\\ExternalScored';
    static protected $defaultValue = null;
    static protected $required = false;

}
