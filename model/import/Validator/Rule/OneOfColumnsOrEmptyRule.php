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

class OneOfColumnsOrEmptyRule extends AbstractGroupRule implements ValidationRuleInterface
{
    /**
     * @inheritDoc
     */
    public function validate($value, $rules = null, array $context = []): void
    {
        if (empty(trim($value))) {
            return;
        }

        $groupName = $rules[0];

        $allowedValues = array_keys($this->getGroupValues($context, $groupName));

        $searchValues = explode(',', str_replace(' ', '', $value));

        if (count(array_intersect($searchValues, $allowedValues)) !== count($searchValues)) {
            throw new InvalidImportException(
                __("Error: %s doesn't contain the allowed values")
            );
        }
    }
}
