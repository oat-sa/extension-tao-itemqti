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

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;

class OneOfRule extends ConfigurableService implements ValidationRuleInterface
{
    public const EMPTY_VALUE = '_empty_';
    public const CASE_INSENSITIVE = 'CASE_INSENSITIVE';

    /**
     * @inheritDoc
     */
    public function validate(string $column, $value, $rules = null, array $context = []): void
    {
        $allowedValuesRule = $rules[0];
        $allowedValues = explode(',', $allowedValuesRule);

        $flags = $rules[1];

        if ($flags === self::CASE_INSENSITIVE) {
            $allowedValues = array_map('strtolower', $allowedValues);
            $value = strtolower($value);
        }

        $allowedValues = str_ireplace(self::EMPTY_VALUE, '', $allowedValues);

        if (!in_array($value, $allowedValues)) {
            $exception = new WarningValidationException(
                'invalid value for `%s`(%s), expected values are [%s]',
                [
                    $column,
                    $value,
                    $allowedValuesRule
                ]
            );

            $exception->setColumn($column);

            throw $exception;
        }
    }
}
