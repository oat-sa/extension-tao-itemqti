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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\test\integration\model\qti\asset;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\ResponseDeclaration;
use oat\taoQtiItem\model\qti\Value;
use oat\taoQtiItem\model\qti\Parser;

/**
 * Test Response Declaration Object
 */
class ResponseDeclarationTest extends TaoPhpUnitTestRunner
{
    /**
     * Test that model to QTI serialization is correct
     */
    public function testToQti()
    {
        $responseDeclaration = new ResponseDeclaration([
            'identifier' => 'RESPONSE',
            'cardinality' => 'single',
        ]);
        $correctValue = new Value();
        $correctValue->setValue('');
        $responseDeclaration->setCorrectResponses([
            $correctValue
        ]);

        $this->assertXmlStringEqualsXmlString('<responseDeclaration  identifier="RESPONSE" cardinality="single">
        	<correctResponse>
	    	        <value><![CDATA[]]></value>
	    	</correctResponse>
            </responseDeclaration>', $responseDeclaration->toQti());
    }

    /**
     * Test that the parsing and serialization leave the xml unchanged
     */
    public function testXmlParsingAndSerialization()
    {
        $file = dirname(__FILE__) . '/samples/xml/responseDeclarationTest.xml';

        $qtiParser = new Parser($file);
        $item = $qtiParser->load();

        $this->assertXmlStringEqualsXmlString(
            $this->normalizeXml(file_get_contents($file)),
            $this->normalizeXml($item->toXML())
        );
    }

    /**
     * Normalize the xml string for comparison
     * @param string $xml
     * @return string
     */
    protected function normalizeXml($xml)
    {
        $xml = preg_replace('/toolVersion="[0-9a-zA-Z-\.]+"/', '', $xml);

        //work around DOMNode C14N error : "Relative namespace UR is invalid here"
        $xml = str_replace('xmlns:html5="html5"', 'xmlns:html5="http://www.imsglobal.org/xsd/html5"', $xml);

        //replace media url by a fixed uri
        $xml = preg_replace('/taomedia:\/\/mediamanager\/([a-zA-Z0-9_]+)/', 'taomedia://mediamanager/ASSET_URI', $xml);

        return $xml;
    }
}
