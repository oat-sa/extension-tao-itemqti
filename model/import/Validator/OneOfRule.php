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

namespace oat\taoQtiItem\model\import\Validator;


use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\Parser\RecoverableLineValidationException;
use oat\taoQtiItem\model\import\Validator\Rule\ValidationRuleInterface;

class OneOfRule extends ConfigurableService implements ValidationRuleInterface
{

    /**
     * @throws RecoverableLineValidationException
     */
    public function validate($value, $rules = null, array $context = []): void
    {
        if (in_array($value, explode(',', $rules[0]))) {
            throw new RecoverableLineValidationException(
                sprintf('%s is invalid, must be one of (%s)', '%s', $rules[0])
            );
        }
    }
}
