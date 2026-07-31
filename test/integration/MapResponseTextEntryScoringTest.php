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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\integration;

use DOMDocument;
use oat\tao\test\TaoPhpUnitTestRunner;
use qtism\common\datatypes\QtiFloat;
use qtism\common\datatypes\QtiString;
use qtism\data\AssessmentItem;
use qtism\data\storage\xml\marshalling\MarshallerNotFoundException;
use qtism\data\storage\xml\marshalling\Qti21MarshallerFactory;
use qtism\runtime\common\OutcomeVariable;
use qtism\runtime\common\ResponseVariable;
use qtism\runtime\common\State;
use qtism\runtime\processing\ResponseProcessingEngine;

/**
 * Confirms Qtism scoring for 3 textEntryInteractions with map-response RP.
 *
 * Covers:
 * - simple sum (template-driven map into SCORE)
 * - dichotomous scoring model (map into TEMP_SCORE, single threshold -> SCORE)
 * - polytomous scoring model (map into TEMP_SCORE, multi-threshold ladder -> SCORE)
 */
class MapResponseTextEntryScoringTest extends TaoPhpUnitTestRunner
{
    private const SIMPLE_SUM_FILE = __DIR__
        . '/samples/xml/qtiv2p1/responseProcessing/map_response_three_text_entry_simple_sum.xml';

    private const DICHOTOMOUS_FILE = __DIR__
        . '/samples/xml/qtiv2p1/responseProcessing/map_response_three_text_entry_dichotomous.xml';

    private const POLYTOMOUS_FILE = __DIR__
        . '/samples/xml/qtiv2p1/responseProcessing/map_response_three_text_entry_polytomous.xml';

    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
    }

    public function testSimpleSumSampleUsesMapResponseIntoScore(): void
    {
        $xml = file_get_contents(self::SIMPLE_SUM_FILE);

        $this->assertNotFalse($xml);
        $this->assertStringContainsString('mapResponse', $xml);
        $this->assertStringContainsString('identifier="RESPONSE"', $xml);
        $this->assertStringContainsString('identifier="RESPONSE_1"', $xml);
        $this->assertStringContainsString('identifier="RESPONSE_2"', $xml);
        $this->assertStringNotContainsString('TEMP_SCORE', $xml);
        $this->assertStringNotContainsString('<gte>', $xml);
    }

    public function testDichotomousSampleUsesTempScoreThreshold(): void
    {
        $xml = file_get_contents(self::DICHOTOMOUS_FILE);

        $this->assertNotFalse($xml);
        $this->assertStringContainsString('mapResponse', $xml);
        $this->assertStringContainsString('TEMP_SCORE', $xml);
        $this->assertStringContainsString('<gte>', $xml);
        $this->assertStringNotContainsString('<responseElseIf>', $xml);
        $this->assertStringContainsString("data-scoring-model='{\"2\":1}'", $xml);
    }

    public function testPolytomousSampleUsesTempScoreThresholdLadder(): void
    {
        $xml = file_get_contents(self::POLYTOMOUS_FILE);

        $this->assertNotFalse($xml);
        $this->assertStringContainsString('mapResponse', $xml);
        $this->assertStringContainsString('TEMP_SCORE', $xml);
        $this->assertStringContainsString('<gte>', $xml);
        $this->assertStringContainsString('<responseElseIf>', $xml);
        $this->assertStringContainsString("data-scoring-model='{\"3\":2,\"2\":1}'", $xml);
        $this->assertStringContainsString('<baseValue baseType="float">3</baseValue>', $xml);
        $this->assertStringContainsString('<baseValue baseType="float">2</baseValue>', $xml);
    }

    /**
     * @dataProvider simpleSumScenarioProvider
     * @throws MarshallerNotFoundException
     */
    public function testSimpleSumScoresEachMappedResponse(
        ?string $response,
        ?string $response1,
        ?string $response2,
        float $expectedScore
    ): void {
        $state = $this->processItem(self::SIMPLE_SUM_FILE, $response, $response1, $response2);

        $this->assertSame($expectedScore, $this->getOutcomeFloatValue($state, 'SCORE'));
    }

    /**
     * @dataProvider dichotomousScenarioProvider
     * @throws MarshallerNotFoundException
     */
    public function testDichotomousScoresViaTempScoreThreshold(
        ?string $response,
        ?string $response1,
        ?string $response2,
        float $expectedTempScore,
        float $expectedScore
    ): void {
        $state = $this->processItem(self::DICHOTOMOUS_FILE, $response, $response1, $response2);

        $this->assertSame($expectedTempScore, $this->getOutcomeFloatValue($state, 'TEMP_SCORE'));
        $this->assertSame($expectedScore, $this->getOutcomeFloatValue($state, 'SCORE'));
    }

    /**
     * @dataProvider polytomousScenarioProvider
     * @throws MarshallerNotFoundException
     */
    public function testPolytomousScoresViaTempScoreThresholdLadder(
        ?string $response,
        ?string $response1,
        ?string $response2,
        float $expectedTempScore,
        float $expectedScore
    ): void {
        $state = $this->processItem(self::POLYTOMOUS_FILE, $response, $response1, $response2);

        $this->assertSame($expectedTempScore, $this->getOutcomeFloatValue($state, 'TEMP_SCORE'));
        $this->assertSame($expectedScore, $this->getOutcomeFloatValue($state, 'SCORE'));
    }

    public function simpleSumScenarioProvider(): array
    {
        return [
            'all three mapped answers' => ['Orange', 'Banana', 'Apple', 3.0],
            'two mapped answers' => ['Orange', 'Banana', 'Wrong', 2.0],
            'one mapped answer' => ['Orange', 'Wrong', 'Wrong', 1.0],
            'no mapped answers' => ['Wrong', 'Wrong', 'Wrong', 0.0],
            'synonym variants still map' => ['Oranges', 'Banans', 'Apples', 3.0],
        ];
    }

    public function dichotomousScenarioProvider(): array
    {
        return [
            'three correct meets threshold' => ['Orange', 'Banana', 'Apple', 3.0, 1.0],
            'two correct meets threshold' => ['Orange', 'Banana', 'Wrong', 2.0, 1.0],
            'one correct below threshold' => ['Orange', 'Wrong', 'Wrong', 1.0, 0.0],
            'zero correct' => ['Wrong', 'Wrong', 'Wrong', 0.0, 0.0],
        ];
    }

    public function polytomousScenarioProvider(): array
    {
        return [
            'three correct full credit' => ['Orange', 'Banana', 'Apple', 3.0, 2.0],
            'two correct partial credit' => ['Orange', 'Banana', 'Wrong', 2.0, 1.0],
            'one correct no credit' => ['Orange', 'Wrong', 'Wrong', 1.0, 0.0],
            'zero correct' => ['Wrong', 'Wrong', 'Wrong', 0.0, 0.0],
        ];
    }

    /**
     * @throws MarshallerNotFoundException
     */
    private function processItem(
        string $file,
        ?string $response,
        ?string $response1,
        ?string $response2
    ): State {
        $item = $this->loadAssessmentItem($file);
        $variables = [];

        foreach ($item->getResponseDeclarations()->getArrayCopy() as $responseDeclaration) {
            $variables[] = ResponseVariable::createFromDataModel($responseDeclaration);
        }
        foreach ($item->getOutcomeDeclarations()->getArrayCopy() as $outcomeDeclaration) {
            $variables[] = OutcomeVariable::createFromDataModel($outcomeDeclaration);
        }

        $state = new State($variables);

        foreach ($item->getOutcomeDeclarations()->getArrayCopy() as $outcomeDeclaration) {
            $state->getVariable($outcomeDeclaration->getIdentifier())->applyDefaultValue();
        }

        foreach ($item->getResponseDeclarations()->getArrayCopy() as $responseDeclaration) {
            $state->getVariable($responseDeclaration->getIdentifier())->setValue(new QtiString(''));
        }

        if ($response !== null) {
            $state->getVariable('RESPONSE')->setValue(new QtiString($response));
        }
        if ($response1 !== null) {
            $state->getVariable('RESPONSE_1')->setValue(new QtiString($response1));
        }
        if ($response2 !== null) {
            $state->getVariable('RESPONSE_2')->setValue(new QtiString($response2));
        }

        $engine = new ResponseProcessingEngine($item->getResponseProcessing(), $state);
        $engine->process();

        return $state;
    }

    private function getOutcomeFloatValue(State $state, string $identifier): float
    {
        $value = $state->getVariable($identifier)->getValue();

        if ($value === null) {
            return 0.0;
        }

        $this->assertInstanceOf(QtiFloat::class, $value);

        return $value->getValue();
    }

    /**
     * @throws MarshallerNotFoundException
     */
    private function loadAssessmentItem(string $file): AssessmentItem
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->load($file);

        $factory = new Qti21MarshallerFactory();
        $marshaller = $factory->createMarshaller($dom->documentElement);
        $item = $marshaller->unmarshall($dom->documentElement);

        $this->assertInstanceOf(AssessmentItem::class, $item);

        return $item;
    }
}
