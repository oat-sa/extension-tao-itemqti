<?php
/*
 *
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

use oat\taoQtiItem\model\import\Parser\Exception\InvalidImportException;

class MinOccurrencesRule extends AbstractGroupRule implements ValidationRuleInterface
{

    /**
     * @throws InvalidImportException
     */
    public function validate($value, $rules = null, array $context = []): void
    {
        $groupName = $rules[0];
        $minCount = $rules[1];

        $occurrences = $this->getGroupValues($context, $groupName);

        if ($minCount > count(array_filter($occurrences))) {
            throw new InvalidImportException(
                __('%s is invalid, must have at least %s values', $groupName, $minCount)
            );
        }
    }
}
