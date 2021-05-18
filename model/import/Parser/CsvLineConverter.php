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
use oat\taoQtiItem\model\import\Decorator\CvsToQtiTemplateDecorator;
use oat\taoQtiItem\model\import\ItemInterface;
use oat\taoQtiItem\model\import\Parser\Exception\RecoverableLineValidationException;
use oat\taoQtiItem\model\import\TemplateInterface;

class CsvLineConverter extends ConfigurableService
{
    public function convert(array $line, TemplateInterface $template, $validationReport = null): ItemInterface
    {
        $decorator = new CvsToQtiTemplateDecorator($template);

        $validationConfig = $decorator->getCsvColumns();
        $parsed = [];
        foreach ($validationConfig as $columnName => $rules) {
            if (!empty($rules['parser'])) {
                /** @var ColumnParserInterface $parser */
                $parser = $this->getServiceLocator()->get($rules['parser']);
                $parsed[$columnName] = $parser->parse($line, $rules, ['columnName' => $columnName]);
            } else {
                $isInvalid = $validationReport && $this->hasValidationIssues($columnName, $validationReport);
                $isOmitted = !array_key_exists($columnName, $line) || $line[$columnName] === '';
                $parsed[$columnName] = ($isInvalid || $isOmitted) ? ($rules['default'] ?? null) : $line[$columnName];
            }
        }

        return new CsvItem(
            $parsed['name'],
            $parsed['question'],
            $this->normalizeShuffle($parsed['shuffle']), //@TODO make normalizers configurable
            (int)$parsed['min_choices'],
            (int)$parsed['max_choices'],
            $this->normalizeLanguage($parsed['language']),
            $parsed['choice_[1-99]'],
            $parsed['metadata_[a-z0-9\-_]+'] ?? []
        );
    }

    private function hasValidationIssues(string $field, RecoverableLineValidationException $report): bool
    {
        return in_array($field, array_column($report->getWarnings(), 'field'));
    }

    private function normalizeLanguage(string $language): string
    {
        $groups = explode('-', $language);
        return sprintf('%s-%s', strtolower($groups[0] ?? ''), strtoupper($groups[1] ?? ''));
    }

    private function normalizeShuffle($value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

}
