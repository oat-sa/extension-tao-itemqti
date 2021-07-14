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

namespace oat\taoQtiItem\model\import\Validator\Rule;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;

class QtiCompatibleXmlRule extends ConfigurableService implements ValidationRuleInterface
{
    /**
     * @inheritDoc
     */
    public function validate(string $column, $value, $rules = null, array $context = []): void
    {
        if (!$this->isQtiCompliant($value)) {
            $exception = new WarningValidationException(
                '`%s` is invalid',
                [
                    $column,
                ]
            );

            $exception->setColumn($column);

            throw $exception;
        }
    }

    private function isQtiCompliant(string $value): bool
    {
        //@TODO Do proper QTI Validation or remove it if not necessary
        return true;
    }
}
