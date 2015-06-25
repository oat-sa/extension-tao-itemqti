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
 *
 */

namespace oat\taoQtiItem\test\helpers;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\helpers\Authoring;

/**
 * Test QTI authiring helper methods
 * 
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 * @package taoQtiItem
 */
class AuthoringTest extends TaoPhpUnitTestRunner
{
    /**
     * tests initialization
     */
    public function setUp()
    {
        TaoPhpUnitTestRunner::initTest();
    }
    
    public function testSanitizeQtiXml()
    {
        $xmlStr = file_get_contents(dirname(__FILE__) . '/samples/authoring/sanitizeQtiXml.xml');
        $xml = simplexml_load_string($xmlStr);
        
        $this->assertTrue(count($xml->xpath("//*[local-name() = 'itemBody']//*[@style]")) > 0);
        
        $sanitizedXmlStr = Authoring::sanitizeQtiXml($xmlStr);
        
        $sanitizedXml = simplexml_load_string($sanitizedXmlStr);
        
        $this->assertTrue(count($sanitizedXml->xpath("//*[local-name() = 'itemBody']//*[@style]")) === 0);
    }
    
    public function testLoadQtiXml()
    {
        $xmlStr = file_get_contents(dirname(__FILE__) . '/samples/authoring/loadQtiXml.xml');
        $this->assertTrue(Authoring::loadQtiXml($xmlStr) instanceof \DOMDocument);
    }
    
    /**
     * @expectedException        oat\taoQtiItem\model\qti\exception\QtiModelException
     * @expectedExceptionMessage Wrong QTI item output format
     */
    public function testLoadWrongQtiXml()
    {
        $xmlStr = file_get_contents(dirname(__FILE__) . '/samples/authoring/loadWrongQtiXml.xml');
        Authoring::loadQtiXml($xmlStr);
    }
    
}