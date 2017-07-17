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

use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\Item;

include_once dirname(__FILE__) . '/../includes/raw_start.php';

class ParserFactoryTest extends \PHPUnit_Framework_TestCase {

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
            [__DIR__.'/samples/xml/qtiv2p1/math/math.xml', 'm'],
            [__DIR__.'/samples/xml/qtiv2p1/math/math2.xml', 'm'],
            [__DIR__.'/samples/xml/qtiv2p1/math/math3.xml', 'm'],
            [__DIR__.'/samples/xml/qtiv2p1/math/math4.xml', 'm'],
        ];
    }

    /**
     * Test array parsing
     */
    public function testParseArray() {
        $xml = new \DOMDocument();
        $xml->load(__DIR__.'/samples/xml/qtiv2p1/table.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body = $result->getBody();
        $bodyElements = $body->getElements();

        $bodyElementsSerials     = array_keys($bodyElements);
        $tableSerial             = $bodyElementsSerials[0];
        $choiceInteractionSerial = $bodyElementsSerials[1];

        $this->assertEquals(2, count($bodyElements), 'item body contains 2 top level elements');
        $this->assertTrue(strpos($tableSerial, 'table_') === 0, 'first element is a table, with serial: ' . $tableSerial);
        $this->assertTrue(strpos($choiceInteractionSerial, 'interaction_choiceinteraction_') === 0, 'second element is a choice interaction, with serial: ' . $choiceInteractionSerial);

        $choiceInteraction = $body->getElement($choiceInteractionSerial);

        $tableChoice = $choiceInteraction->getChoiceByIdentifier('choice_6');
        $tableChoiceBody = $tableChoice->getBody();
        $tableChoiceElements = $tableChoiceBody->getElements();
        $nestedTableSerial = array_keys($tableChoiceElements)[0];

        $this->assertEquals(1, count($tableChoiceElements), 'choice body contains 1 element');
        $this->assertTrue(strpos($nestedTableSerial, 'table_') === 0, 'first choice element is a table, with serial: ' . $nestedTableSerial);
    }
}