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

    /** @var boolean */
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
        return $this->maxScore;
    }
}
