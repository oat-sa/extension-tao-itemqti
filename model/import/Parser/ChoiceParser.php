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

namespace oat\taoQtiItem\model\import\Parser;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ParsedChoice;

class ChoiceParser extends ConfigurableService implements ColumnParserInterface
{
    public function parse(array $line, array $rules, string ...$fields): array
    {
        $parsedChoices = [];
        $columnName = $fields[0];

        $choices = $this->findKeysByMask($columnName, $line);

        $columnPattern = $this->findMatchingColumn($rules['header']);
        $choicesScores = array_map(
            'floatval',
            $this->findKeysByMask($columnPattern, $line)
        );
        foreach ($choices as $choiceId => $choice) {
            $parsedChoices[] = new ParsedChoice($choiceId, $choice, $choicesScores[$choiceId.'_score'] ?? 0.0);
        }
        return $parsedChoices;
    }

    private function findKeysByMask(string $pattern, array $input): array
    {
        $pattern = '/\b('.$pattern.')\b/';
        return array_intersect_key($input, array_flip(preg_grep($pattern, array_keys($input))));
    }

    private function findMatchingColumn(string $rules): ?string
    {
        foreach (explode('|', $rules) as $validation) {
            if (strpos($validation, 'match_header:') !== false) {
                return str_replace('match_header:', '', $validation);
            }
        }
        return null;
    }
}
