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

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\Parser\InvalidCsvImportException;
use oat\taoQtiItem\model\import\TemplateInterface;

class HeaderValidator extends ConfigurableService implements ValidatorInterface
{
    public function validate(array $content, TemplateInterface $csvTemplate): void
    {
        $validationConfig = $csvTemplate->getDefinition();

        $error = new InvalidCsvImportException();

        foreach ($validationConfig as $headerRegex => $validations) {
            $validations = explode('|', $validationConfig[$headerRegex]['header']);

            $isRequired = $this->isRequired($validations);
            $minOccurrences = $this->getMinOccurrences($validations);
            $occurrences = $this->findOccurrences($content, $headerRegex);

            if ($isRequired && $occurrences === 0) {
                $error->addMissingHeaderColumn($headerRegex);
                $error->addError(0, sprintf('Header %s is required', $headerRegex));
            }

            if ($occurrences < $minOccurrences) {
                $error->addMissingHeaderColumn($headerRegex);
                $error->addError(
                    0,
                    sprintf('Header %s must be provided at least %s times', $headerRegex, $minOccurrences)
                );
            }
        }

        if ($error->getTotalErrors() > 0) {
            throw $error;
        }
    }

    private function isRequired(array $validations): bool
    {
        return in_array('required', $validations);
    }

    private function getMinOccurrences(array $validations): int
    {
        foreach ($validations as $validation) {
            if (strpos($validation, 'min_occurrences:')) {
                return (int)str_replace('min_occurrences:', '', $validation);
            }
        }

        return 0;
    }

    private function findOccurrences(array $header, string $headerRegex): int
    {
        $occurrences = 0;

        foreach ($header as $headerName) {
            if (preg_match('/\b(' . $headerRegex . ')\b/', $headerName) === 1) {
                $occurrences++;
            }
        }

        return $occurrences;
    }
}
