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
use oat\taoQtiItem\model\import\Parser\NopeParser;
use oat\taoQtiItem\model\import\TemplateInterface;

interface TemplateRepositoryInterface
{
    public const DEFAULT = 'default';
    public const DEFAULT_DEFINITION = [
        'name' => [
            'header' => 'required',
        ],
        'question' => [
            'header' => 'required',
            'value' => 'qtiXmlString',
        ],
        'shuffle' => [
            'header' => 'optional',
            'value' => 'optional|one_of:0,1,true,false',
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
            'parser' => ChoiceParser::class,
        ],
        'choice_[1-99]_score' => [
            'header' => 'required|min_occurrences:1|match_header:choice_[1-99]',
            'parser' => NopeParser::class,
            'value' => 'strict_numeric',
        ],
        'metadata_[a-z0-9\-_]' => [
            'header' => 'optional',
        ],
    ];
    public const DEFAULT_XML = 'taoQtiItem/model/import/Template/item.xml.tpl';

    public function findById(string $id): ?TemplateInterface;
}
