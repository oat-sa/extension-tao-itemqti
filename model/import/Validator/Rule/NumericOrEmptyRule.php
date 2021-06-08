<?php

/**
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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Validator\Rule;

use oat\taoQtiItem\model\import\Validator\ErrorValidationException;

class NumericOrEmptyRule extends AbstractGroupRule implements ValidationRuleInterface
{
    /**
     * @inheritDoc
     */
    public function validate(string $column, $value, $rules = null, array $context = []): void
    {
        $groupName = $rules[0];
        $occurrences = $this->getGroupValues($context, $groupName);

        $errors = [];

        foreach ($occurrences as $columnName => $occurrence) {
            if (!empty($occurrence) && !is_numeric($occurrence)) {
                $errors[] = $columnName;
            }
        }

        if (count($errors) > 0) {
            $exception = new ErrorValidationException(
                '`%s` is invalid, must be numeric or empty',
                [
                    $column,
                ]
            );

            $exception->setColumn($column);

            throw $exception;
        }
    }
}
