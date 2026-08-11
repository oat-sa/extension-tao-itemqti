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
use qtism\common\datatypes\QtiInteger;
use qtism\common\datatypes\QtiString;
use qtism\data\AssessmentItem;
use qtism\data\storage\xml\marshalling\MarshallerNotFoundException;
use qtism\data\storage\xml\marshalling\Qti21MarshallerFactory;
use qtism\runtime\common\OutcomeVariable;
use qtism\runtime\common\ResponseVariable;
use qtism\runtime\common\State;
use qtism\runtime\processing\ResponseProcessingEngine;

class SynonymGroupResponseProcessingTest extends TaoPhpUnitTestRunner
{
    private const SAMPLE_FILE = __DIR__ . '/samples/xml/qtiv2p1/responseProcessing/synonym_group_scoring.xml';

    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
    }

    public function testSampleUsesStringMatchWithoutMapping(): void
    {
        $xml = file_get_contents(self::SAMPLE_FILE);

        $this->assertNotFalse($xml);
        $this->assertStringContainsString('stringMatch', $xml);
        $this->assertStringNotContainsString('mapResponse', $xml);
        $this->assertStringNotContainsString('<mapping', $xml);
        $this->assertStringNotContainsString('<mapEntry', $xml);
    }

    /**
     * @dataProvider scoringScenarioProvider
     * @throws MarshallerNotFoundException
     */
    public function testQtismScoresSynonymGroupsHolistically(
        ?string $r1,
        ?string $r2,
        int $expectedGermanyFound,
        int $expectedFranceFound,
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

        if ($r1 !== null) {
            $state->getVariable('R1')->setValue(new QtiString($r1));
        }
        if ($r2 !== null) {
            $state->getVariable('R2')->setValue(new QtiString($r2));
        }

        $engine = new ResponseProcessingEngine($responseProcessing, $state);
        $engine->process();

        $this->assertSame($expectedGermanyFound, $this->getOutcomeIntegerValue($state, 'GERMANY_FOUND'));
        $this->assertSame($expectedFranceFound, $this->getOutcomeIntegerValue($state, 'FRANCE_FOUND'));
        $this->assertSame($expectedScore, $this->getOutcomeFloatValue($state, 'SCORE'));
    }

    private function getOutcomeIntegerValue(State $state, string $identifier): int
    {
        $value = $state->getVariable($identifier)->getValue();

        if ($value === null) {
            return 0;
        }

        $this->assertInstanceOf(QtiInteger::class, $value);

        return $value->getValue();
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
            'single germany synonym' => ['Federal Republic of Germany', null, 1, 0, 1.0],
            'duplicate germany synonyms across fields' => ['Germany', 'Federal Republic of Germany', 1, 0, 1.0],
            'germany and france' => ['Germany', 'France', 1, 1, 2.0],
            'no match' => ['Italy', 'Spain', 0, 0, 0.0],
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
