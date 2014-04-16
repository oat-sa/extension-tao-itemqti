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

namespace oat\taoQtiItem\helpers;

use qtism\runtime\common\Variable;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;

/**
 * Qti Item Runner helper
 *
 * @author OAT
 * @package taoQtiItem

 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class QtiRunner
{

    public static function getVariableValues(Variable $variable){

        $returnValue = array();

        $baseType = $variable->getBaseType();
        $cardinalityType = $variable->getCardinality();

        if($baseType === BaseType::IDENTIFIER){
            if($cardinalityType === Cardinality::SINGLE){
                $returnValue[] = $variable->getValue()->getValue();
            }else if($cardinalityType === Cardinality::MULTIPLE){
                foreach($variable->getValue() as $value){
                    $returnValue[] = $value->getValue();
                }
            }
        }

        return $returnValue;
    }

}