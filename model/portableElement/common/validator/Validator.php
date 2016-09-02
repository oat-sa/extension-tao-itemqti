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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\common\validator;

use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInvalidFieldException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInvalidModelException;

class Validator
{
    const NotEmpty         = 'NotEmpty';
    const AlphaNum         = 'AlphaNum';
    const Callback         = 'Callback';
    const DateTime         = 'DateTime';
    const Email            = 'Email';
    const Equals           = 'Equals';
    const FileMimeType     = 'FileMimeType';
    const FileName         = 'FileName';
    const FileSize         = 'FileSize';
    const IndexIdentifier  = 'IndexIdentifier';
    const Integer          = 'Integer';
    const Length           = 'Length';
    const Numeric          = 'Numeric';
    const Password         = 'Password';
    const PasswordStrength = 'PasswordStrength';
    const Regex            = 'Regex';
    const Unique           = 'Unique';
    const Url              = 'Url';
    const isArray          = 'isArray';
    const isString         = 'isString';
    const isVersion        = 'isVersion';

    protected static $customValidators = [
        self::isArray        => 'isValidArray',
        self::isString       => 'isValidString',
        self::isVersion      => 'isValidVersion'
    ];

    protected static function getValidConstraints(array $requirements, $validationGroup=array())
    {
        $validConstraints = [];

        foreach ($requirements as $field => $constraints) {

            if (!empty($validationGroup) && !in_array($field, $validationGroup)) {
                continue;
            }

            if (is_array($constraints)) {
                $validators = $constraints;
            } else {
                $validators = explode(',', $constraints);
            }

            foreach ($validators as $validator) {
                if (array_key_exists($validator, self::$customValidators)) {
                    $validConstraints[$field][] = $validator;
                } else {
                    $validConstraints[$field][] = \tao_helpers_form_FormFactory::getValidator($validator);
                }
            }
        }

        return $validConstraints;
    }

    /**
     * @param Validatable $validatable
     * @param array $validationGroup
     * @return bool
     * @throws PortableElementInconsistencyModelException
     */
    public static function validate(Validatable $validatable, $validationGroup=array())
    {
        $constraints = self::getValidConstraints($validatable->getConstraints(), $validationGroup);
        $errorReport = \common_report_Report::createFailure('Portable element validation has failed.');

        foreach ($constraints as $field => $constraint) {
            foreach ($constraint as $validator) {
                $getter = 'get' . ucfirst($field);
                if (! method_exists($validatable->getModel(), $getter)) {
                    throw new PortableElementInconsistencyModelException(
                        'Validator is not correctly set for model ' . get_class($validatable->getModel()));
                }
                $value = $validatable->getModel()->$getter();

                if ($validator instanceof \tao_helpers_form_Validator) {
                    if (! $validator->evaluate($value)) {
                        $subReport = \common_report_Report::createFailure(
                            __('Unable to validate %s', $field), array($validator->getName() => $validator->getMessage())
                        );
                        $errorReport->add($subReport);
                    }
                    continue;
                }

                if (is_string($validator)) {
                    if (array_key_exists($validator, self::$customValidators)) {
                        $callable = self::$customValidators[$validator];
                        try {
                            self::$callable($value);
                        } catch (PortableElementInvalidFieldException $e) {
                            $subReport = \common_report_Report::createFailure(
                                __('Unable to validate "%s" field.', $field), array($validator => $e->getMessage())
                            );
                            $errorReport->add($subReport);
                        }
                    }
                    continue;
                }

                return false;
            }
        }
        if ($errorReport->containsError()) {
            $exception = new PortableElementInvalidModelException();
            $exception->setReport($errorReport);
            throw $exception;
        }
        return true;
    }

    /**
     * @param $value
     * @return bool
     * @throws PortableElementInvalidFieldException
     */
    public static function isValidString($value)
    {
        if (!is_string($value)) {
            throw new PortableElementInvalidFieldException('Unable to validate the given value as valid string.');
        }
        return true;
    }

    /**
     * @param $value
     * @return bool
     * @throws PortableElementInvalidFieldException
     */
    public static function isValidArray($value)
    {
        if (!is_array($value)) {
            throw new PortableElementInvalidFieldException('Unable to validate the given value as valid array.');
        }
        return true;
    }

    /**
     * @param $value
     * @return bool
     * @throws PortableElementInvalidFieldException
     */
    public static function isValidVersion($value)
    {
        $validator = \tao_helpers_form_FormFactory::getValidator(self::Regex, array('format' => '/\d+(?:\.\d+)+/'));
        if (!$validator->evaluate($value)) {
            throw new PortableElementInvalidFieldException('Unable to validate the given value as valid version.');
        }
        return true;
    }
}