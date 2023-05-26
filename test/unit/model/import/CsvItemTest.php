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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\import;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\import\CsvItem;
use oat\taoQtiItem\model\import\ParsedChoice;

class CsvItemTest extends TestCase
{
    /** @var CsvItem */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new CsvItem(
            'name',
            'question',
            true,
            5,
            10,
            'en-US',
            [],
            []
        );
    }

    public function testGetters(): void
    {
        $this->assertSame('name', $this->subject->getName());
        $this->assertSame('question', $this->subject->getQuestion());
        $this->assertSame(5, $this->subject->getMinChoices());
        $this->assertSame(10, $this->subject->getMaxChoices());
        $this->assertSame(0.0, $this->subject->getMaxScore());
        $this->assertSame([], $this->subject->getChoices());
        $this->assertSame([], $this->subject->getMetadata());
        $this->assertTrue($this->subject->isShuffle());
    }

    /**
     * @dataProvider getMaxScoreProvider
     * @covers CsvItem::isMatchCorrectResponse
     * @covers CsvItem::isMapResponse
     * @covers CsvItem::isNoneResponse
     */
    public function testGetMaxScore(
        array $choices,
        int $minChoices,
        int $maxChoices,
        float $maxScore,
        string $isTrue
    ): void {
        $subject = new CsvItem(
            'name',
            'question',
            true,
            $minChoices,
            $maxChoices,
            'en-US',
            $choices,
            []
        );

        $this->assertSame($subject->getMaxScore(), $maxScore);
        $this->assertTrue($subject->$isTrue());
    }

    public function getMaxScoreProvider(): array
    {
        return [
            // Correct answer is considered only when all scores are 0 and at least one choice isCorrect
            'correct_answer' => [
                'choices' => [
                    new ParsedChoice('id', 'choice', 0, true),
                    new ParsedChoice('id', 'choice', 0, true),
                    new ParsedChoice('id', 'choice', 0, false),
                ],
                'minChoices' => 1,
                'maxChoices' => 1,
                'maxScore' => 1.0,
                'isTrue' => 'isMatchCorrectResponse',
            ],
            // Even if isCorrect is provided, since scores are also provided, it will be considered a map response
            'force_map_response_OVER_correct_answer' => [
                'choices' => [
                    new ParsedChoice('id', 'choice', 1, true),
                    new ParsedChoice('id', 'choice', 2, true),
                    new ParsedChoice('id', 'choice', 0, false),
                ],
                'minChoices' => 1,
                'maxChoices' => 2,
                'maxScore' => 3.0,
                'isTrue' => 'isMapResponse',
            ],
            // Map response is considered whenever we have at least one score
            'map_response' => [
                'choices' => [
                    new ParsedChoice('id', 'choice', 1, false),
                    new ParsedChoice('id', 'choice', 2, false),
                    new ParsedChoice('id', 'choice', -1, false),
                    new ParsedChoice('id', 'choice', 3, false),
                ],
                'minChoices' => 1,
                'maxChoices' => 0,
                'maxScore' => 6.0,
                'isTrue' => 'isMapResponse',
            ],
            // Map response max score is based on max number of choices
            'map_response_slice' => [
                'choices' => [
                    new ParsedChoice('id', 'choice', 1, false),
                    new ParsedChoice('id', 'choice', 2, false),
                    new ParsedChoice('id', 'choice', -1, false),
                    new ParsedChoice('id', 'choice', 3, false),
                ],
                'minChoices' => 1,
                'maxChoices' => 2,
                'maxScore' => 5.0,
                'isTrue' => 'isMapResponse',
            ],
            // If no score is provided and no correct answer, than there is none response processing
            'none_response' => [
                'choices' => [
                    new ParsedChoice('id', 'choice', 0, false),
                    new ParsedChoice('id', 'choice', 0, false),
                    new ParsedChoice('id', 'choice', 0, false),
                    new ParsedChoice('id', 'choice', 0, false),
                ],
                'minChoices' => 1,
                'maxChoices' => 1,
                'maxScore' => 0.0,
                'isTrue' => 'isNoneResponse',
            ]
        ];
    }
}
