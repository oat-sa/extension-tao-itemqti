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

namespace oat\taoQtiItem\model\import\Factory;

use oat\taoQtiItem\model\import\TemplateInterface;
use oat\oatbox\service\ConfigurableService;

class CsvTemplateSampleLineFactory extends ConfigurableService
{
    public function createMultiple(TemplateInterface $template): array
    {
        $correctResponse = array(
            '[please remove] EXAMPLE 1 - item with correct answer',
            'Select the correct response (no restriction on number of selectable choices).'
            . 'The value in ""correct_answer"" should be choice identifiers (listed in the column header) '
            . 'and not the actual text content of the choices. In this example, ""choice_2"" is the correct answer '
            . 'and gives the score 1',
            '0',
            'en-US',
            '0',
            '0',
            'text for choice_1',
            'text for choice_2',
            'text for choice_3',
            'text for choice_4',
            '',
            '',
            '',
            '',
            'choice_2'
        );
        $mapResponse = array(
            '[please remove] EXAMPLE 2 - item with partial score',
            'Select the correct response (the choices are shuffled, at least 1 choice must be selected and '
            . 'maximum of 2 allowed, this item uses partial scoring)',
            '1',
            'en-US',
            '1',
            '2',
            'A',
            'B',
            'C',
            'D',
            '3',
            '0',
            '-2',
            '-1',
            ''
        );
        $combinationResponse = array(
            '[please remove] EXAMPLE 3 - item with both correct answer and partial score',
            'Select the correct response (1 single choice allowed, the correct answer is ""X"" and ""Y"", '
            . 'this item uses partial scoring)',
            '0',
            'en-US',
            '0',
            '1',
            'W',
            'X',
            'Y',
            'Z',
            '-1',
            '1',
            '1',
            '0',
            'choice_2,choice_4'
        );
        return [
            $correctResponse,
            $mapResponse,
            $combinationResponse
        ];
    }
}
