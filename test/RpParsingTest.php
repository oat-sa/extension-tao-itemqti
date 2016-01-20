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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 *
 */
namespace oat\taoQtiItem\test;

use common_ext_ExtensionsManager;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\Parser;

class RpParsingTest extends TaoPhpUnitTestRunner {
    
    public function testParseRpCustom(){

        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/custom.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();
        
        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\Custom',$item->getResponseProcessing());

        //a response processing
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/custom_based_on_template.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();

        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\Custom',$item->getResponseProcessing());
    }

    public function testParseRpTemplateDriven(){

        /**
         * a rp using standard template will be parsed into a template driven rp (for authoring purpose)
         */
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/template.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();
        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\TemplatesDriven',$item->getResponseProcessing());

        //check if the rp is serialized correctly
        $xml = simplexml_load_string($item->toXML());
        $this->assertEquals('http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct', (string) $xml->responseProcessing[0]['template']);


        /**
         * tao custom rp build using the tao "recognizable" response condition, with 2 interactions
         */
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/templateDrivenMultiple.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();
        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\TemplatesDriven',$item->getResponseProcessing());

        //check if the rp is serialized correctly
        $xml = simplexml_load_string($item->toXML());
        $this->assertEmpty((string) $xml->responseProcessing[0]['template']);


        /**
         * tao custom rp build using the tao "recognizable" response condition, with one interaction with the responseIdentifier RESPONSE_1
         */
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/templateDrivenSingle.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();
        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\TemplatesDriven',$item->getResponseProcessing());

        //check if the rp is serialized correctly
        $xml = simplexml_load_string($item->toXML());
        $this->assertEmpty((string) $xml->responseProcessing[0]['template']);

        /**
         * tao custom rp build using the tao "recognizable" response condition, with one unique interaction that has the "right" responseIdentifier RESPONSE
         */
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/templateDrivenSingleRESPONSE.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();
        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\TemplatesDriven',$item->getResponseProcessing());

        $xml = simplexml_load_string($item->toXML());
        $this->assertEquals('http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response', (string) $xml->responseProcessing[0]['template']);


        /**
         * orphaned response conditions must not lead to a custom response processing
         */
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/templateDrivenOrphanedResponseConditions.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();
        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\TemplatesDriven',$item->getResponseProcessing());

        $response = current($item->getResponses());
        $this->assertEquals('http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct', $response->getHowMatch());

        /**
         * tao rp to match multiple choices
         */
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/responseProcessing/templateDrivenMatchChoices.xml';
        $qtiParser = new Parser($file);
        $qtiParser->validate();
        $this->assertTrue($qtiParser->isValid());

        $item = $qtiParser->load();
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);
        $this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\response\\TemplatesDriven',$item->getResponseProcessing());
        
        print_r($item->toArray());
    }
    
}