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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\Parser;

/**
 *
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 */
class OptimizeJsonTest extends TaoPhpUnitTestRunner
{

    /**
     * tests initialization
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
    }

    /**
     * test the building and exporting out the items
     */
    public function testToQTI(){
        
        $itemCount = 0;
        $jsonStr = '';
        
        foreach(array_merge(glob(dirname(__FILE__).'/samples/xml/qtiv2p1/*.xml')) as $file){

            $qtiParser = new Parser($file);
            $item = $qtiParser->load();
            $itemData = $item->toArray();
            $itemJson = json_encode($itemData);
            
            $jsonStr .= $itemJson;
            $itemCount++;
        }
        
        var_dump($itemCount, strlen($jsonStr));
    }

}