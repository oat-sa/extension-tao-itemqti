<?php

/*
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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import;

class CsvItem implements ItemInterface
{
    /** @var string */
    private $name;

    /** @var string */
    private $question;

    /** @var bool */
    private $shuffle;

    /** @var int */
    private $minChoices;

    /** @var int */
    private $maxChoices;

    /** @var string */
    private $language;

    /** @var ParsedChoice[] */
    private $choices;

    /** @var Metadata[] */
    private $metadata;

    /** @var float */
    private $maxScore;

    public function __construct(
        string $name,
        string $question,
        bool $shuffle,
        int $minChoices,
        int $maxChoices,
        string $language,
        array $choices,
        array $metadata,
        float $maxScore
    )
    {
        $this->name = $name;
        $this->question = $question;
        $this->shuffle = $shuffle;
        $this->minChoices = $minChoices;
        $this->maxChoices = $maxChoices;
        $this->language = $language;
        $this->choices = $choices;
        $this->metadata = $metadata;
        $this->maxScore = $maxScore;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getQuestion(): string
    {
        return $this->question;
    }

    public function isShuffle(): bool
    {
        return $this->shuffle;
    }

    public function getMinChoices(): int
    {
        return $this->minChoices;
    }

    public function getMaxChoices(): int
    {
        return $this->maxChoices;
    }

    public function getLanguage(): string
    {
        return $this->language;
    }

    /**
     * @return ParsedChoice[]
     */
    public function getChoices(): array
    {
        return $this->choices;
    }

    /**
     * @return Metadata[]
     */
    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getMaxScore(): float
    {
        /*
        WHEN choice_1_score … choice_N_score and correct_answer are ALL EMPTY
            THEN system shall consider this as warning
            set Response Processing to none (survey use case)
            set MAXSCORE to 0
        */

        // If max_choices = 0 (unlimited), it will be the sum of all choice_N_score without include negative values.
        if ($this->maxChoices === 0) { // unlimited choices map_response
            $totalScore = 0;

            foreach ($this->choices as $choice) {
                if ($choice->getChoiceScore() > 0) {
                    $totalScore += $choice->getChoiceScore();
                }
            }

            return $totalScore;
        }

        // If max_choices = 1, it will be the higher choice_N_score value.
        if ($this->maxChoices === 1) { // match_correct
            $scores = [];

            foreach ($this->choices as $choice) {
                if ($choice->getChoiceScore() > 0) {
                    $scores[$choice->getChoiceScore()] = $choice->getChoiceScore();
                }
            }

            return count($scores) ? max($scores) : 0;
        }

        // If max_choices = 2..N, it will be higher possible sum of choice_N_score.
        if ($this->maxChoices > 1) {
            $scores = [];

            foreach ($this->choices as $choice) {
                if ($choice->getChoiceScore() > 0) {
                    $scores[] = $choice->getChoiceScore();
                }
            }

            rsort($scores);

            $totalScore = 0;

            for ($i = 0; $i < $this->maxChoices; $i++) {
                $totalScore += current($scores);

                next($scores);
            }

            return $totalScore;
        }

        return 0;
    }

    public function isMatchCorrectResponse(): bool
    {
        foreach ($this->choices as $choice) {
            if ($choice->isCorrect()) {
                return true;
            }
        }

        return false;
    }

    public function isMapResponse(): bool
    {
        return !$this->isMatchCorrectResponse() && $this->getScoreCount() > 1;
    }

    public function isNoneResponse(): bool
    {
        return $this->getScoreCount() === 0;
    }

    private function getScoreCount(): int
    {
        $totalScores = 0;

        // map_response: In case there is more than one choice_N_score.
        foreach ($this->choices as $choice) {
            if ($choice->getChoiceScore() > 0) {
                $totalScores++;
            }
        }

        return $totalScores;
    }
}
