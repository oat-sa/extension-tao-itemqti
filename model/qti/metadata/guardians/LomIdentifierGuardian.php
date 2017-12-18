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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\guardians;

use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardian;

/**
 * LOMIdentifierGuardian is an implementation of MetadataGuardian.
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 *
 */
class LomIdentifierGuardian implements MetadataGuardian {
    
    public function guard(array $metadataValues) {
        $guard = false;
        
        // Search for a metadataValue with path:
        // http://www.imsglobal.org/xsd/imsmd_v1p2#lom
        // http://www.imsglobal.org/xsd/imsmd_v1p2#general
        // http://www.imsglobal.org/xsd/imsmd_v1p2#identifier
        
        foreach ($metadataValues as $metadataValue) {
            
            $path = $metadataValue->getPath();
            $expectedPath = array(
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier'
            );
            
            if ($path === $expectedPath) {
                // Check for such a value in database...
                $prop = new \core_kernel_classes_Property('http://www.imsglobal.org/xsd/imsmd_v1p2#identifier');
                $class = new \core_kernel_classes_Class(TaoOntology::ITEM_CLASS_URI);
                $instances = $class->searchInstances(array($prop->getUri() => $metadataValue->getValue()), array('like' => false, 'recursive' => true));
                
                if (count($instances) > 0) {
                    //var_dump($instances);
                    $guard = reset($instances);
                    break;
                }
            }
        }
        
        return $guard;
    }
}