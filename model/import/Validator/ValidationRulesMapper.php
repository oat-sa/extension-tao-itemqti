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
use oat\taoQtiItem\model\import\Validator\Rule\IsIntegerRule;
use oat\taoQtiItem\model\import\Validator\Rule\LessOrEqualRule;
use oat\taoQtiItem\model\import\Validator\Rule\MinOccurrencesRule;
use oat\taoQtiItem\model\import\Validator\Rule\NumericOrEmptyRule;
use oat\taoQtiItem\model\import\Validator\Rule\OneOfColumnsOrEmptyRule;
use oat\taoQtiItem\model\import\Validator\Rule\OneOfRule;
use oat\taoQtiItem\model\import\Validator\Rule\OptionalRule;
use oat\taoQtiItem\model\import\Validator\Rule\QtiCompatibleXmlRule;
use oat\taoQtiItem\model\import\Validator\Rule\RequireRule;
use oat\taoQtiItem\model\import\Validator\Rule\StrictNoGapsRule;
use oat\taoQtiItem\model\import\Validator\Rule\StrictNumericRule;
use oat\taoQtiItem\model\import\Validator\Rule\SupportedLanguageRule;
use oat\taoQtiItem\model\import\Validator\Rule\ValidationRuleInterface;

class ValidationRulesMapper extends ConfigurableService
{
    public function getValidator(string $key): ?ValidationRuleInterface
    {
        $mapper = [
            'is_integer' => IsIntegerRule::class,
            'language' => SupportedLanguageRule::class,
            'less_or_equals' => LessOrEqualRule::class,
            'no_gaps' => StrictNoGapsRule::class,
            'one_of' => OneOfRule::class,
            'optional' => OptionalRule::class,
            'required' => RequireRule::class,
            'qtiXmlString' => QtiCompatibleXmlRule::class,
            'strict_numeric' => StrictNumericRule::class,
            'numeric_or_empty' => NumericOrEmptyRule::class,
            'min_occurrences' => MinOccurrencesRule::class,
            'one_of_columns_or_empty' => OneOfColumnsOrEmptyRule::class,
        ];

        if (isset($mapper[$key])) {
            return $this->getServiceLocator()->get($mapper[$key]);
        }

        return null;
    }
}
