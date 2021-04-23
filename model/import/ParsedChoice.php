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

class ParsedChoice
{
    /** @var string */
    private $choice;

    /** @var float */
    private $choiceScore;

    /** @var string */
    private $id;

    public function __construct(string $id, string $choice, float $choiceScore)
    {
        $this->choice = $choice;
        $this->choiceScore = $choiceScore;
        $this->id = $id;
    }

    public function getChoiceScore(): float
    {
        return $this->choiceScore;
    }

    public function getChoice(): string
    {
        return $this->choice;
    }

    public function getId(): string
    {
        return $this->id;
    }
}
