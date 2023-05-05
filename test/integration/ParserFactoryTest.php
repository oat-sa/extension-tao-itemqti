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

namespace oat\taoQtiItem\test\integration;

use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\Item;
use oat\generis\test\TestCase;

// phpcs:disable PSR1.Files.SideEffects
include_once dirname(__FILE__) . '/../../includes/raw_start.php';
// phpcs:enable PSR1.Files.SideEffects

class ParserFactoryTest extends TestCase
{
    /**
     * @param string $file
     * @param string $expected
     * @dataProvider findNamespaceProvider
     */
    public function testFindNamespace($file, $expected)
    {
        $xml = new \DOMDocument();
        $xml->load($file);
        $parser = new ParserFactory($xml);
        $parser->setItem(new Item([]));
        $this->assertEquals($expected, $parser->findNamespace('MathML'));
    }

    /**
     * @return array
     */
    public function findNamespaceProvider()
    {
        return [
            [__DIR__ . '/samples/xml/qtiv2p1/math/math.xml', 'm'],
            [__DIR__ . '/samples/xml/qtiv2p1/math/math2.xml', 'm'],
            [__DIR__ . '/samples/xml/qtiv2p1/math/math3.xml', 'm'],
            [__DIR__ . '/samples/xml/qtiv2p1/math/math4.xml', 'm'],
        ];
    }

    /**
     * Table parsing
     */
    public function testParseTableWithNestedInteractions()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/samples/xml/qtiv2p1/tableInteractions.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);

        $choiceInteractionSerial = $bodyElementsSerials[1];

        $tableSerial  = $bodyElementsSerials[0];
        $tableElement = $bodyElements[$tableSerial];

        $this->assertEquals(2, count($bodyElements), 'item body contains 2 top level elements');
        $this->assertTrue(
            strpos($tableSerial, 'table_') === 0,
            'first element is a table, with serial: ' . $tableSerial
        );
        $this->assertTrue(
            strpos($choiceInteractionSerial, 'interaction_choiceinteraction_') === 0,
            'second element is a choice interaction, with serial: ' . $choiceInteractionSerial
        );
        $this->assertEquals(
            $tableElement->getQtiTag(),
            'table',
            'table has the right Qti Class: ' . $tableElement->getQtiTag()
        );
        $this->assertEquals(
            $tableElement->toArray()['qtiClass'],
            'table',
            'array representation of the table element has a qtiClass index with the correct value'
        );

        $tableBody = $tableElement->getBody();

        $this->assertTrue(
            strpos($tableBody->getSerial(), 'container_containertable_') === 0,
            'tableBody is a containerTable with serial ' . $tableBody->getSerial()
        );
        $this->assertTrue(strpos($tableBody->getBody(), 'Female') !== false, 'tableBody contains the expected string ');

        $choiceInteraction = $body->getElement($choiceInteractionSerial);

        $tableChoice         = $choiceInteraction->getChoiceByIdentifier('choice_6');
        $tableChoiceBody     = $tableChoice->getBody();
        $tableChoiceElements = $tableChoiceBody->getElements();

        $nestedTableSerial  = array_keys($tableChoiceElements)[0];
        $nestedTableElement = $tableChoiceElements[$nestedTableSerial];

        $this->assertEquals(1, count($tableChoiceElements), 'choice body contains 1 element');
        $this->assertTrue(
            strpos($nestedTableSerial, 'table_') === 0,
            'first choice element is a table, with serial: ' . $nestedTableSerial
        );
        $this->assertEquals(
            $nestedTableElement->getQtiTag(),
            'table',
            'table has the right Qti Class: ' . $nestedTableElement->getQtiTag()
        );
        $this->assertEquals(
            $nestedTableElement->toArray()['qtiClass'],
            'table',
            'array representation of the table element has a qtiClass index'
        );
    }

    public function testParseTableWithNoNestedInteractions()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/samples/xml/qtiv2p1/tableNoInteractions.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);


        $tableSerial  = $bodyElementsSerials[0];
        $tableElement = $bodyElements[$tableSerial];

        $this->assertEquals(1, count($bodyElements), 'item body contains 1 top level element');
        $this->assertTrue(
            strpos($tableSerial, 'table_') === 0,
            'first element is a table, with serial: ' . $tableSerial
        );
        $this->assertEquals(
            $tableElement->getQtiTag(),
            'table',
            'table has the right Qti Class: ' . $tableElement->getQtiTag()
        );
        $this->assertEquals(
            $tableElement->toArray()['qtiClass'],
            'table',
            'array representation of the table element has a qtiClass index with the correct value'
        );

        $tableBody = $tableElement->getBody();

        $this->assertTrue(
            strpos($tableBody->getSerial(), 'container_containertable_') === 0,
            'tableBody is a containerTable with serial ' . $tableBody->getSerial()
        );
        $this->assertTrue(strpos($tableBody->getBody(), 'Female') !== false, 'tableBody contains the expected string ');

        $tableElements          = $tableBody->getElements();
        $tableElementsSerials   = array_keys($tableElements);
        $this->assertEquals(2, count($tableElements), 'table body contains 2 elements');

        $imgSerial  = $tableElementsSerials[0];
        $mathSerial = $tableElementsSerials[1];

        $this->assertTrue(strpos($imgSerial, 'img_') === 0, 'first element is an image, with serial: ' . $imgSerial);
        $this->assertTrue(strpos($mathSerial, 'math_') === 0, 'second element is a math, with serial: ' . $mathSerial);
    }
}
