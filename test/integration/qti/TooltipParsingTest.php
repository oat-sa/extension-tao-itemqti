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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

/**
 * @author Christophe Noël <christophe@taotesting.com>
 */

namespace oat\taoQtiItem\test\integration\qti;

use oat\taoQtiItem\model\qti\ParserFactory;
use oat\generis\test\TestCase;

// phpcs:disable PSR1.Files.SideEffects
include_once dirname(__FILE__) . '/../../../includes/raw_start.php';
// phpcs:enable PSR1.Files.SideEffects

class TooltipParsingTest extends TestCase
{
    public function testParseTooltipInItemBody()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/../samples/xml/qtiv2p2/tooltip.xml');
        $parser = new ParserFactory($xml);
        $result = $parser->load();

        $body                = $result->getBody();
        $bodyElements        = $body->getElements();
        $bodyElementsSerials = array_keys($bodyElements);

        $choiceInteractionSerial = $bodyElementsSerials[0];
        $tooltip1Serial          = $bodyElementsSerials[1];
        $tooltip2Serial          = $bodyElementsSerials[2];

        $this->assertEquals(3, count($bodyElements), 'item body contains 2 top level elements');
        $this->assertTrue(
            strpos($choiceInteractionSerial, 'interaction_choiceinteraction') === 0,
            'first element is a choice interaction, with serial: ' . $choiceInteractionSerial
        );
        $this->assertTrue(
            strpos($tooltip1Serial, '_tooltip') === 0,
            'second element is a tooltip, with serial: ' . $tooltip1Serial
        );
        $this->assertTrue(
            strpos($tooltip2Serial, '_tooltip') === 0,
            'third element is a tooltip, with serial: ' . $tooltip2Serial
        );

        $tooltip1 = $bodyElements[$tooltip1Serial];
        $tooltip2 = $bodyElements[$tooltip2Serial];

        $tooltip1Content = 'This is a container for <strong>inline choices</strong> and '
            . '<strong>inline text entries</strong>.<br/>Now you know';
        $tooltip2Content = 'Some say that the word "tooltip" does not really exist.';

        $this->assertEquals(
            'inline <i>interaction</i> container',
            $tooltip1->getBody(),
            'tooltip 1 target is ' . $tooltip1->getBody()
        );
        $this->assertEquals('_tooltip', $tooltip1->getQtiTag(), 'tooltip 1 QtiTag is ' . $tooltip1->getQtiTag());
        $this->assertEquals(
            'tooltip-target',
            $tooltip1->getAttributeValue('data-role'),
            'tooltip 1 data-role attribute is ' . $tooltip1->getAttributeValue('data-role')
        );
        $this->assertEquals(
            'tooltip_1',
            $tooltip1->getAttributeValue('aria-describedby'),
            'tooltip 1 aria-describedby attribute is ' . $tooltip1->getAttributeValue('aria-describedby')
        );
        $this->assertEquals(
            $tooltip1Content,
            $tooltip1->getContent(),
            'tooltip 1 has the right content'
        );

        $tooltip1Array = $tooltip1->toArray();
        $this->assertEquals(
            $tooltip1Content,
            $tooltip1Array['content'],
            'tooltip 1 content has been serialized correctly'
        );
        $this->assertEquals('_tooltip', $tooltip1Array['qtiClass'], 'tooltip 1 qtiClass is correct');

        $this->assertEquals('tooltip', $tooltip2->getBody(), 'tooltip 2 target is ' . $tooltip2->getBody());
        $this->assertEquals('_tooltip', $tooltip2->getQtiTag(), 'tooltip 2 QtiTag is ' . $tooltip2->getQtiTag());
        $this->assertEquals(
            'tooltip-target',
            $tooltip2->getAttributeValue('data-role'),
            'tooltip 2 data-role attribute is ' . $tooltip2->getAttributeValue('data-role')
        );
        $this->assertEquals(
            'tooltip_4',
            $tooltip2->getAttributeValue('aria-describedby'),
            'tooltip 2 aria-describedby attribute is ' . $tooltip2->getAttributeValue('aria-describedby')
        );
        $this->assertEquals(
            $tooltip2Content,
            $tooltip2->getContent(),
            'toolip 2 has the right content'
        );

        $tooltip2Array = $tooltip2->toArray();
        $this->assertEquals(
            $tooltip2Content,
            $tooltip2Array['content'],
            'tooltip 2 content has been serialized correctly'
        );
        $this->assertEquals('_tooltip', $tooltip2Array['qtiClass'], 'tooltip 2 qtiClass is correct');

        $bodyContent = $body->getBody();

        $this->assertEquals(
            substr_count($bodyContent, 'tooltip-content'),
            1,
            'Tooltip content tags have been parsed and removed from body except one'
        );
        $this->assertTrue(
            strpos($bodyContent, '<span data-role="tooltip-content" aria-hidden="true" id="tooltip_ORPHAN">') !== false,
            'The remaining tooltip content tag is the correct one'
        );
        $this->assertTrue(
            strpos($bodyContent, '<span data-role="tooltip-target" aria-describedby="tooltip_IDONTEXIST">') !== false,
            'Tooltip with no corresponding content has not been parsed'
        );
        $this->assertTrue(
            strpos($bodyContent, '<span data-role="tooltip-target" aria-describedby="">I\'m orphan</span>') !== false,
            'Tooltip with no content id has not been parsed'
        );
    }

    public function testParseTooltipInPrompt()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/../samples/xml/qtiv2p2/tooltip.xml');
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
        $this->assertTrue(
            strpos($tooltipSerial, '_tooltip') === 0,
            'element is a tooltip, with serial: ' . $tooltipSerial
        );

        $tooltip = $promptElements[$tooltipSerial];

        $tooltipContent = 'The text before the question.';

        $this->assertEquals(
            'QTI <strong>prompt</strong>',
            $tooltip->getBody(),
            'tooltip target is ' . $tooltip->getBody()
        );
        $this->assertEquals('_tooltip', $tooltip->getQtiTag(), 'tooltip QtiTag is ' . $tooltip->getQtiTag());
        $this->assertEquals(
            'tooltip-target',
            $tooltip->getAttributeValue('data-role'),
            'tooltip data-role attribute is ' . $tooltip->getAttributeValue('data-role')
        );
        $this->assertEquals(
            'tooltip_3',
            $tooltip->getAttributeValue('aria-describedby'),
            'tooltip aria-describedby attribute is ' . $tooltip->getAttributeValue('aria-describedby')
        );
        $this->assertEquals(
            $tooltipContent,
            $tooltip->getContent(),
            'tooltip has the right content'
        );

        $tooltip1Array = $tooltip->toArray();
        $this->assertEquals(
            $tooltipContent,
            $tooltip1Array['content'],
            'tooltip content has been serialized correctly'
        );
        $this->assertEquals('_tooltip', $tooltip1Array['qtiClass'], 'tooltip qtiClass is correct');

        $promptContent = $prompt->getBody();

        $this->assertTrue(
            strpos($promptContent, 'tooltip-content') === false,
            'Tooltip content tags have been parsed and removed from prompt body'
        );
    }

    public function testParseTooltipInChoice()
    {
        $xml = new \DOMDocument();
        $xml->load(__DIR__ . '/../samples/xml/qtiv2p2/tooltip.xml');
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
        $this->assertTrue(
            strpos($tooltipSerial, '_tooltip') === 0,
            'element is a tooltip, with serial: ' . $tooltipSerial
        );

        $tooltip = $choiceElements[$tooltipSerial];

        $tooltipContent = 'But it will <i>not</i> be revealed here.';

        $this->assertEquals('<i>strange</i> word', $tooltip->getBody(), 'tooltip target is ' . $tooltip->getBody());
        $this->assertEquals('_tooltip', $tooltip->getQtiTag(), 'tooltip QtiTag is ' . $tooltip->getQtiTag());
        $this->assertEquals(
            'tooltip-target',
            $tooltip->getAttributeValue('data-role'),
            'tooltip data-role attribute is ' . $tooltip->getAttributeValue('data-role')
        );
        $this->assertEquals(
            'tooltip_2',
            $tooltip->getAttributeValue('aria-describedby'),
            'tooltip aria-describedby attribute is ' . $tooltip->getAttributeValue('aria-describedby')
        );
        $this->assertEquals(
            $tooltipContent,
            $tooltip->getContent(),
            'tooltip has the right content'
        );

        $tooltip1Array = $tooltip->toArray();
        $this->assertEquals(
            $tooltipContent,
            $tooltip1Array['content'],
            'tooltip content has been serialized correctly'
        );
        $this->assertEquals('_tooltip', $tooltip1Array['qtiClass'], 'tooltip qtiClass is correct');

        $promptContent = $choice->getBody();

        $this->assertTrue(
            strpos($promptContent, 'tooltip-content') === false,
            'Tooltip content tags have been parsed and removed from choice body'
        );
    }
}
