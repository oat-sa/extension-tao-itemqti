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
use oat\taoQtiItem\model\import\Parser\RecoverableLineValidationException;
use oat\taoQtiItem\model\import\TemplateInterface;
use oat\taoQtiItem\model\import\Validator\Rule\LessOrEqualRule;
use oat\taoQtiItem\model\import\Validator\Rule\OptionalRule;use oat\taoQtiItem\model\import\Validator\Rule\QtiCompatibleXmlRule;
use oat\taoQtiItem\model\import\Validator\Rule\SupportedLanguageRule;
use oat\taoQtiItem\model\import\Validator\Rule\ValidationRuleInterface;

class LineValidator extends HeaderValidator
{
    public function validate(array $content, TemplateInterface $csvTemplate): void
    {
        parent::validate(
            array_keys(
                array_filter(
                    $content,
                    function ($value) {
                        return !is_null($value) && $value !== '';
                    }
                )
            ),
            $csvTemplate
        );

        $this->validateLine($content, $csvTemplate);
    }

    protected function getErrorMessagePrefix(): string
    {
        return '';
    }

    /**
     * @throws RecoverableLineValidationException
     */
    private function validateLine(array $content, TemplateInterface $csvTemplate): void
    {
        $warnings = new RecoverableLineValidationException();
        $validationConfig = $csvTemplate->getDefinition();
        foreach ($validationConfig as $headerRegex => $validations) {
            $validations = $validations['value'] ??'';

            foreach (explode('|',$validations) as $validation) {
                $rules = explode(':',$validation);
                $name = array_shift($rules);
                $validator = $this->getValidator($name);
                if ($validator){
                    try{
                        $validator->validate($content[$headerRegex], $rules, $content);
                    }catch (Exception $exception){
                        $warnings->addWarning(0, sprintf($exception->getMessage(), $headerRegex));
                    }
                }
            }
        }
        if ($warnings->getTotalWarnings()){
            throw $warnings;
        }
    }

    private function getValidator(string $key): ?ValidationRuleInterface
    {
        $mapper = [
            'less_or_equals' => LessOrEqualRule::class,
            'language' => SupportedLanguageRule::class,
            'qtiXmlString' => QtiCompatibleXmlRule::class,
            'optional' => OptionalRule::class,
            'one_of' => OneOfRule::class,
            'is_integer' => IsIntegerRule::class,
            'strict_numeric' => StrictNumericRule::class,
            'no_gaps' => StrictNoGapsRule::class,
        ];

        if (isset($mapper[$key])) {
            return $this->getServiceLocator()->get($mapper[$key]);
        }

        return null;
    }

}
