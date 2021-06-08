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

class StrictNoGapsRule extends AbstractGroupRule implements ValidationRuleInterface
{
    /**
     * @inheritDoc
     */
    public function validate(string $column, $value, $rules = null, array $context = []): void
    {
        $groupName = $rules[0];
        ksort($context, SORT_NATURAL);

        $occurrences = $this->getGroupValues($context, $groupName);

        while (in_array(end($occurrences), ['', null], true)) {
            array_pop($occurrences);
        }

        $missingChoices = [];

        foreach ($occurrences as $k => $v) {
            if (empty($v)) {
                $missingChoices[] = $k;
            }
        }

        if (!empty($missingChoices)) {
            $exception = new ErrorValidationException(
                'Error: %s is empty, although it is mandatory.',
                [
                    implode(', ', $missingChoices),
                ]
            );

            $exception->setColumn($column);

            throw $exception;
        }
    }
}
