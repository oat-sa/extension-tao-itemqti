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

namespace oat\taoQtiItem\model\import\Repository;

use oat\taoQtiItem\model\import\Parser\ChoiceParser;
use oat\taoQtiItem\model\import\Parser\MetadataParser;
use oat\taoQtiItem\model\import\TemplateInterface;
use oat\taoQtiItem\model\import\Validator\Rule\OneOfRule;

interface TemplateRepositoryInterface
{
    public const DEFAULT = 'default';

    public const DEFAULT_DEFINITION = [
        'target' => [
            'templatePath' => [
                'noResponse' => 'taoQtiItem/templates/import/item_none_response.xml.tpl',
                'mapResponse' => 'taoQtiItem/templates/import/item_map_response.xml.tpl',
                'matchCorrectResponse' => 'taoQtiItem/templates/import/item_match_correct_response.xml.tpl',
            ],
            'version' => '2.2',
            'standard' => 'QTI',
        ],
        'columns' => [
            'name' => [
                'header' => 'required',
                'value' => 'required',
            ],
            'question' => [
                'header' => 'required',
                'value' => 'required|qtiXmlString',
            ],
            'shuffle' => [
                'header' => 'optional',
                'value' => 'optional|one_of:0,1,true,false:' . OneOfRule::CASE_INSENSITIVE,
                'default' => 'false',
            ],
            'language' => [
                'header' => 'optional',
                'value' => 'optional|language',
                'default' => DEFAULT_LANG,
            ],
            'min_choices' => [
                'header' => 'optional',
                'value' => 'optional|less_or_equals:max_choices|is_integer',
                'default' => 0,
            ],
            'max_choices' => [
                'header' => 'optional',
                'value' => 'optional|is_integer',
                'default' => 0,
            ],
            'choice_[1-99]' => [
                'header' => 'required|min_occurrences:2|match_header:choice_[1-99]_score',
                'value' => 'no_gaps:choice_[1-99]|min_occurrences:choice_[1-99]:2:choices',
                'parser' => ChoiceParser::class,
            ],
            'choice_[1-99]_score' => [
                'header' => 'match_header:choice_[1-99]',
                'value' => 'numeric_or_empty:choice_[1-99]_score',
            ],
            'correct_answer' => [
                'header' => 'optional',
                'value' => 'one_of_columns_or_empty:choice_[1-99]',
            ],
            'metadata_[A-Za-z0-9\-_]+' => [
                'header' => 'optional',
                'parser' => MetadataParser::class,
            ],
        ],
    ];

    public function findById(string $id): ?TemplateInterface;
}
