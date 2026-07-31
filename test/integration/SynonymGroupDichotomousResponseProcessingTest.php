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

class SynonymGroupDichotomousResponseProcessingTest extends TaoPhpUnitTestRunner
{
    private const SAMPLE_FILE = __DIR__
        . '/samples/xml/qtiv2p1/responseProcessing/synonym_group_dichotomous_scoring.xml';

    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
    }

    public function testSampleUsesTempScoreThresholdWithoutMapping(): void
    {
        $xml = file_get_contents(self::SAMPLE_FILE);

        $this->assertNotFalse($xml);
        $this->assertStringContainsString('stringMatch', $xml);
        $this->assertStringContainsString('TEMP_SCORE', $xml);
        $this->assertStringContainsString('<gte>', $xml);
        $this->assertStringNotContainsString('<responseElseIf>', $xml);
        $this->assertStringNotContainsString('mapResponse', $xml);
        $this->assertStringNotContainsString('<mapping', $xml);
        $this->assertStringNotContainsString('<mapEntry', $xml);
    }

    /**
     * @dataProvider scoringScenarioProvider
     * @throws MarshallerNotFoundException
     */
    public function testQtismAppliesDichotomousThresholdOnTempScore(
        ?string $response,
        ?string $response1,
        ?string $response2,
        float $expectedTempScore,
        float $expectedScore
    ): void {
        $item = $this->loadAssessmentItem(self::SAMPLE_FILE);
        $responseProcessing = $item->getResponseProcessing();

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

        $engine = new ResponseProcessingEngine($responseProcessing, $state);
        $engine->process();

        $this->assertSame($expectedTempScore, $this->getOutcomeFloatValue($state, 'TEMP_SCORE'));
        $this->assertSame($expectedScore, $this->getOutcomeFloatValue($state, 'SCORE'));
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

    public function scoringScenarioProvider(): array
    {
        return [
            'three matches at or above threshold' => ['Francja', 'Polska', 'Germany', 3.0, 1.0],
            'two matches meet threshold' => ['Francja', 'Polska', 'Italy', 2.0, 1.0],
            'one match below threshold' => ['Francja', 'Italy', 'Spain', 1.0, 0.0],
            'zero matches' => ['Italy', 'Spain', 'Portugal', 0.0, 0.0],
        ];
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
