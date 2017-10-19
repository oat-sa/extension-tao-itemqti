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
     * Table parsing
     */
    public function testParseTableWithNestedInteractions() {
        $xml = new \DOMDocument();
        $xml->load(__DIR__.'/samples/xml/qtiv2p1/tableInteractions.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);

        $choiceInteractionSerial = $bodyElementsSerials[1];

        $tableSerial  = $bodyElementsSerials[0];
        $tableElement = $bodyElements[$tableSerial];

        $this->assertEquals(2, count($bodyElements), 'item body contains 2 top level elements');
        $this->assertTrue(strpos($tableSerial, 'table_') === 0, 'first element is a table, with serial: ' . $tableSerial);
        $this->assertTrue(strpos($choiceInteractionSerial, 'interaction_choiceinteraction_') === 0, 'second element is a choice interaction, with serial: ' . $choiceInteractionSerial);
        $this->assertEquals($tableElement->getQtiTag(), 'table', 'table has the right Qti Class: ' . $tableElement->getQtiTag());
        $this->assertEquals($tableElement->toArray()['qtiClass'], 'table', 'array representation of the table element has a qtiClass index with the correct value');

        $tableBody = $tableElement->getBody();

        $this->assertTrue(strpos($tableBody->getSerial(), 'container_containertable_') === 0, 'tableBody is a containerTable with serial ' . $tableBody->getSerial());
        $this->assertTrue(strpos($tableBody->getBody(), 'Female') !== false, 'tableBody contains the expected string ');

        $choiceInteraction = $body->getElement($choiceInteractionSerial);

        $tableChoice         = $choiceInteraction->getChoiceByIdentifier('choice_6');
        $tableChoiceBody     = $tableChoice->getBody();
        $tableChoiceElements = $tableChoiceBody->getElements();

        $nestedTableSerial  = array_keys($tableChoiceElements)[0];
        $nestedTableElement = $tableChoiceElements[$nestedTableSerial];

        $this->assertEquals(1, count($tableChoiceElements), 'choice body contains 1 element');
        $this->assertTrue(strpos($nestedTableSerial, 'table_') === 0, 'first choice element is a table, with serial: ' . $nestedTableSerial);
        $this->assertEquals($nestedTableElement->getQtiTag(), 'table', 'table has the right Qti Class: ' . $nestedTableElement->getQtiTag());
        $this->assertEquals($nestedTableElement->toArray()['qtiClass'], 'table', 'array representation of the table element has a qtiClass index');
    }

    public function testParseTableWithNoNestedInteractions() {
        $xml = new \DOMDocument();
        $xml->load(__DIR__.'/samples/xml/qtiv2p1/tableNoInteractions.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);


        $tableSerial  = $bodyElementsSerials[0];
        $tableElement = $bodyElements[$tableSerial];

        $this->assertEquals(1, count($bodyElements), 'item body contains 1 top level element');
        $this->assertTrue(strpos($tableSerial, 'table_') === 0, 'first element is a table, with serial: ' . $tableSerial);
        $this->assertEquals($tableElement->getQtiTag(), 'table', 'table has the right Qti Class: ' . $tableElement->getQtiTag());
        $this->assertEquals($tableElement->toArray()['qtiClass'], 'table', 'array representation of the table element has a qtiClass index with the correct value');

        $tableBody = $tableElement->getBody();

        $this->assertTrue(strpos($tableBody->getSerial(), 'container_containertable_') === 0, 'tableBody is a containerTable with serial ' . $tableBody->getSerial());
        $this->assertTrue(strpos($tableBody->getBody(), 'Female') !== false, 'tableBody contains the expected string ');

        $tableElements          = $tableBody->getElements();
        $tableElementsSerials   = array_keys($tableElements);
        $this->assertEquals(2, count($tableElements), 'table body contains 2 elements');

        $imgSerial  = $tableElementsSerials[0];
        $mathSerial = $tableElementsSerials[1];

        $this->assertTrue(strpos($imgSerial, 'img_') === 0, 'first element is an image, with serial: ' . $imgSerial);
        $this->assertTrue(strpos($mathSerial, 'math_') === 0, 'second element is a math, with serial: ' . $mathSerial);

    }

    /**
     * Tooltips parsing
     */
    public function testParseTooltipInItemBody() {
        $xml = new \DOMDocument();
        $xml->load(__DIR__.'/samples/xml/qtiv2p2/tooltip.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);

        $choiceInteractionSerial = $bodyElementsSerials[0];
        $tooltip1Serial          = $bodyElementsSerials[1];
        $tooltip2Serial          = $bodyElementsSerials[2];

        $this->assertEquals(3, count($bodyElements), 'item body contains 2 top level elements');
        $this->assertTrue(strpos($choiceInteractionSerial, 'interaction_choiceinteraction') === 0, 'first element is a choice interaction, with serial: ' . $choiceInteractionSerial);
        $this->assertTrue(strpos($tooltip1Serial, '_tooltip') === 0, 'second element is a tooltip, with serial: ' . $tooltip1Serial);
        $this->assertTrue(strpos($tooltip2Serial, '_tooltip') === 0, 'third element is a tooltip, with serial: ' . $tooltip2Serial);

        $tooltip1 = $bodyElements[$tooltip1Serial];
        $tooltip2 = $bodyElements[$tooltip2Serial];

        $tooltip1Content = 'This is a container for <strong>inline choices</strong> and <strong>inline text entries</strong>.';
        $tooltip2Content = 'Some say that the word "tooltip" does not really exist.';

        $this->assertEquals('inline interaction container', $tooltip1->getBody(), 'tooltip 1 target is ' . $tooltip1->getBody());
        $this->assertEquals('_tooltip', $tooltip1->getQtiTag(), 'tooltip 1 QtiTag is ' . $tooltip1->getQtiTag());
        $this->assertEquals('tooltip-target', $tooltip1->getAttributeValue('data-role'), 'tooltip 1 data-role attribute is ' . $tooltip1->getAttributeValue('data-role'));
        $this->assertEquals('tooltip_1', $tooltip1->getAttributeValue('aria-describedby'), 'tooltip 1 aria-describedby attribute is ' . $tooltip1->getAttributeValue('aria-describedby'));
        $this->assertEquals(
            $tooltip1Content,
            $tooltip1->getContent(),
            'tooltip 1 has the right content'
        );

        $tooltip1Array = $tooltip1->toArray();
        $this->assertEquals($tooltip1Content, $tooltip1Array['content'], 'tooltip 1 content has been serialized correctly');
        $this->assertEquals('_tooltip', $tooltip1Array['qtiClass'], 'tooltip 1 qtiClass is correct');

        $this->assertEquals('tooltip', $tooltip2->getBody(), 'tooltip 2 target is ' . $tooltip2->getBody());
        $this->assertEquals('_tooltip', $tooltip2->getQtiTag(), 'tooltip 2 QtiTag is ' . $tooltip2->getQtiTag());
        $this->assertEquals('tooltip-target', $tooltip2->getAttributeValue('data-role'), 'tooltip 2 data-role attribute is ' . $tooltip2->getAttributeValue('data-role'));
        $this->assertEquals('tooltip_4', $tooltip2->getAttributeValue('aria-describedby'), 'tooltip 2 aria-describedby attribute is ' . $tooltip2->getAttributeValue('aria-describedby'));
        $this->assertEquals(
            $tooltip2Content,
            $tooltip2->getContent(),
            'toolip 2 has the right content'
        );

        $tooltip2Array = $tooltip2->toArray();
        $this->assertEquals($tooltip2Content, $tooltip2Array['content'], 'tooltip 2 content has been serialized correctly');
        $this->assertEquals('_tooltip', $tooltip2Array['qtiClass'], 'tooltip 2 qtiClass is correct');

        $bodyContent = $body->getBody();

        $this->assertTrue(strpos($bodyContent, 'tooltip-content') === false, 'Tooltip content tags have been parsed and removed from body');
    }

    public function testParseTooltipInPrompt() {
        $xml = new \DOMDocument();
        $xml->load(__DIR__.'/samples/xml/qtiv2p2/tooltip.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);

        $choiceInteractionSerial = $bodyElementsSerials[0];

        $choiceInteraction = $bodyElements[$choiceInteractionSerial];

        $prompt                 = $choiceInteraction->getPrompt();
        $promptElements         = $prompt->getElements();
        $promptElementsSerials  = array_keys($promptElements);

        $tooltipSerial = $promptElementsSerials[0];

        $this->assertEquals(1, count($promptElements), 'prompt body contains 1 element');
        $this->assertTrue(strpos($tooltipSerial, '_tooltip') === 0, 'element is a tooltip, with serial: ' . $tooltipSerial);

        $tooltip = $promptElements[$tooltipSerial];

        $tooltipContent = 'The text before the question.';

        $this->assertEquals('prompt', $tooltip->getBody(), 'tooltip target is ' . $tooltip->getBody());
        $this->assertEquals('_tooltip', $tooltip->getQtiTag(), 'tooltip QtiTag is ' . $tooltip->getQtiTag());
        $this->assertEquals('tooltip-target', $tooltip->getAttributeValue('data-role'), 'tooltip data-role attribute is ' . $tooltip->getAttributeValue('data-role'));
        $this->assertEquals('tooltip_3', $tooltip->getAttributeValue('aria-describedby'), 'tooltip aria-describedby attribute is ' . $tooltip->getAttributeValue('aria-describedby'));
        $this->assertEquals(
            $tooltipContent,
            $tooltip->getContent(),
            'tooltip has the right content'
        );

        $tooltip1Array = $tooltip->toArray();
        $this->assertEquals($tooltipContent, $tooltip1Array['content'], 'tooltip content has been serialized correctly');
        $this->assertEquals('_tooltip', $tooltip1Array['qtiClass'], 'tooltip qtiClass is correct');

        $promptContent = $prompt->getBody();

        $this->assertTrue(strpos($promptContent, 'tooltip-content') === false, 'Tooltip content tags have been parsed and removed from prompt body');
    }

    public function testParseTooltipInChoice() {
        $xml = new \DOMDocument();
        $xml->load(__DIR__.'/samples/xml/qtiv2p2/tooltip.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);

        $choiceInteractionSerial = $bodyElementsSerials[0];

        $allChoices        = $bodyElements[$choiceInteractionSerial]->getChoices();
        $allChoicesSerials = array_keys($allChoices);

        $choice                 = $allChoices[$allChoicesSerials[0]]; // get first choice
        $choiceElements         = $choice->getBody()->getElements();
        $choiceElementsSerials  = array_keys($choiceElements);

        $tooltipSerial = $choiceElementsSerials[0];

        $this->assertEquals(1, count($choiceElements), 'choice body contains 1 element');
        $this->assertTrue(strpos($tooltipSerial, '_tooltip') === 0, 'element is a tooltip, with serial: ' . $tooltipSerial);

        $tooltip = $choiceElements[$tooltipSerial];

        $tooltipContent = 'But it will <i>not</i> be revealed here.';

        $this->assertEquals('word', $tooltip->getBody(), 'tooltip target is ' . $tooltip->getBody());
        $this->assertEquals('_tooltip', $tooltip->getQtiTag(), 'tooltip QtiTag is ' . $tooltip->getQtiTag());
        $this->assertEquals('tooltip-target', $tooltip->getAttributeValue('data-role'), 'tooltip data-role attribute is ' . $tooltip->getAttributeValue('data-role'));
        $this->assertEquals('tooltip_2', $tooltip->getAttributeValue('aria-describedby'), 'tooltip aria-describedby attribute is ' . $tooltip->getAttributeValue('aria-describedby'));
        $this->assertEquals(
            $tooltipContent,
            $tooltip->getContent(),
            'tooltip has the right content'
        );

        $tooltip1Array = $tooltip->toArray();
        $this->assertEquals($tooltipContent, $tooltip1Array['content'], 'tooltip content has been serialized correctly');
        $this->assertEquals('_tooltip', $tooltip1Array['qtiClass'], 'tooltip qtiClass is correct');

        $promptContent = $choice->getBody();

        $this->assertTrue(strpos($promptContent, 'tooltip-content') === false, 'Tooltip content tags have been parsed and removed from choice body');
    }

}