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
use oat\taoQtiItem\model\import\CsvItem;
use oat\taoQtiItem\model\import\TemplateInterface;

class CsvLineConverter extends ConfigurableService
{
    public function convert(array $line, TemplateInterface $template): CsvItem
    {
        $validationConfig = $template->getDefinition();
        $parsed = [];
        foreach ($validationConfig as $columnName => $rules) {
            if ($rules['parser'] ?? null) {
                /** @var ColumnParserInterface $parser */
                $parser = $this->getServiceLocator()->get($rules['parser']);
                $parsed[$columnName] = $parser->parse($line, $rules, $columnName);
            } else {
                $parsed[$columnName] = $line[$columnName] ?? $rules['default'] ?? '';
            }
        }

        return new CsvItem(
            $parsed['name'],
            $parsed['question'],
            (bool)$parsed['shuffle'],
            (int)$parsed['min_choices'],
            (int)$parsed['max_choices'],
            $parsed['language'],
            $parsed['choice_[1-99]'],
            $parsed['metaData'] ?? [],
            $parsed['maxScore'] ?? 0.0
        );
    }
    
}
