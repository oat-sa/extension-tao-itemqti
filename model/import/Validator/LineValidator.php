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

namespace oat\taoQtiItem\model\import\Validator;

use Exception;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\Decorator\CvsToQtiTemplateDecorator;
use oat\taoQtiItem\model\import\Parser\Exception\RecoverableLineValidationException;
use oat\taoQtiItem\model\import\TemplateInterface;
use oat\taoQtiItem\model\import\Validator\Rule\IsIntegerRule;
use oat\taoQtiItem\model\import\Validator\Rule\LessOrEqualRule;
use oat\taoQtiItem\model\import\Validator\Rule\OneOfRule;
use oat\taoQtiItem\model\import\Validator\Rule\OptionalRule;
use oat\taoQtiItem\model\import\Validator\Rule\QtiCompatibleXmlRule;
use oat\taoQtiItem\model\import\Validator\Rule\StrictNoGapsRule;
use oat\taoQtiItem\model\import\Validator\Rule\StrictNumericRule;
use oat\taoQtiItem\model\import\Validator\Rule\SupportedLanguageRule;
use oat\taoQtiItem\model\import\Validator\Rule\ValidationRuleInterface;

class LineValidator extends ConfigurableService implements ValidatorInterface
{
    /**
     * @throws RecoverableLineValidationException
     */
    public function validate(array $content, TemplateInterface $csvTemplate): void
    {
        $decorator = new CvsToQtiTemplateDecorator($csvTemplate);
        $warnings = new RecoverableLineValidationException();

        foreach ($decorator->getCsvColumns() as $headerRegex => $validations) {
            $validations = $validations['value'] ?? '';

            foreach (explode('|', $validations) as $validation) {
                $rules = explode(':', $validation);
                $name = array_shift($rules);
                $validator = $this->getValidatorMapper()->getValidator($name);
                if ($validator) {
                    try {
                        $validator->validate($content[$headerRegex], $rules, $content);
                    } catch (Exception $exception) {
                        $warnings->addWarning(0, sprintf($exception->getMessage(), $headerRegex));
                    }
                }
            }
        }
        if ($warnings->getTotalWarnings()) {
            throw $warnings;
        }
    }

    private function getValidatorMapper(): ValidationRulesMapper
    {
        return $this->getServiceLocator()->get(ValidationRulesMapper::class);
    }

}
