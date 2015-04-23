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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
namespace oat\taoQtiItem\test\helpers;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\helpers\Apip;

/**
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */
class ApipTest extends TaoPhpUnitTestRunner
{
    public function testExtractApipAccessibilityEmptyContent()
    {
        $doc = new \DOMDocument('1.0', 'UTF-8');
        $doc->load(dirname(__FILE__) . '/../samples/apip/apip_choice_empty_apip.xml');
        
        $apip = Apip::extractApipAccessibility($doc);
        $this->assertEquals('http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0', $apip->documentElement->namespaceURI);
    }
    
    public function testExtractApipAccessibilityNotApip()
    {
        $doc = new \DOMDocument('1.0', 'UTF-8');
        $doc->load(dirname(__FILE__) . '/../samples/apip/apip_choice_not_apip.xml');
    
        $apip = Apip::extractApipAccessibility($doc);
        $this->assertSame(null, $apip);
    }
}

?>