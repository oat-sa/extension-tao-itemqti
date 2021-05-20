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

    /** @var ParsedMetadatum[] */
    private $metadata;

    public function __construct(
        string $name,
        string $question,
        bool $shuffle,
        int $minChoices,
        int $maxChoices,
        string $language,
        array $choices,
        array $metadata
    ) {
        $this->name = $name;
        $this->question = $question;
        $this->shuffle = $shuffle;
        $this->minChoices = $minChoices;
        $this->maxChoices = $maxChoices;
        $this->language = $language;
        $this->choices = $choices;
        $this->metadata = $metadata;
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

    public function getCorrectChoices(): array
    {
        $choices = [];

        foreach ($this->choices as $choice) {
            if ($choice->isCorrect()) {
                $choices[] = $choice;
            }
        }

        return $choices;
    }

    /**
     * @return ParsedMetadatum[]
     */
    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getMaxScore(): float
    {
        if ($this->isMatchCorrectResponse()) {
            return 1;
        }

        if ($this->isNoneResponse()) {
            return 0;
        }

        if ($this->maxChoices === 0) {
            return $this->getMaxTotalScore();
        }

        if ($this->maxChoices === 1) {
            return $this->getHigherScore();
        }

        if ($this->maxChoices > 1) {
            return $this->getHigherPossibleTotalScore();
        }

        return 0;
    }

    public function isMatchCorrectResponse(): bool
    {
        return $this->getScoreCount() === 0 && $this->hasAtLeastOneCorrectAnswer();
    }

    public function isMapResponse(): bool
    {
        return $this->getScoreCount() > 0;
    }

    public function isNoneResponse(): bool
    {
        return $this->getScoreCount() === 0 && !$this->hasAtLeastOneCorrectAnswer();
    }

    private function hasAtLeastOneCorrectAnswer(): bool
    {
        return count($this->getCorrectChoices()) > 0;
    }

    private function getMaxTotalScore(): float
    {
        $totalScore = 0;

        foreach ($this->choices as $choice) {
            if ($choice->getChoiceScore() > 0) {
                $totalScore += $choice->getChoiceScore();
            }
        }

        return $totalScore;
    }

    private function getHigherScore(): float
    {
        $scores = [];

        foreach ($this->choices as $choice) {
            if ($choice->getChoiceScore() > 0) {
                $scores[$choice->getChoiceScore()] = $choice->getChoiceScore();
            }
        }

        return count($scores) ? max($scores) : 0;
    }

    private function getHigherPossibleTotalScore(): float
    {
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

    private function getScoreCount(): int
    {
        $totalScores = 0;

        foreach ($this->choices as $choice) {
            if ($choice->getChoiceScore() > 0) {
                $totalScores++;
            }
        }

        return $totalScores;
    }
}
