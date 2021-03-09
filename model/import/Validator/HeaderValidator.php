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
            $totalOccurrences = count($occurrences);

            foreach ($this->getMissingMatches($headerRegex, $validations, $content, $occurrences) as $missingMatch) {
                $error->addMissingHeaderColumn($missingMatch);
                $error->addError(0, sprintf('Header %s is required', $missingMatch));
            }

            if ($isRequired && $totalOccurrences === 0) {
                $error->addMissingHeaderColumn($headerRegex);
                $error->addError(0, sprintf('Header %s is required', $headerRegex));
            }

            if ($totalOccurrences < $minOccurrences) {
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
            if (strpos($validation, 'min_occurrences:') !== false) {
                return (int)str_replace('min_occurrences:', '', $validation);
            }
        }

        return 0;
    }

    private function getMissingMatches(
        string $headerRegex,
        array $validations,
        array $headers,
        array $occurrences
    ): array {
        $matchHeader = $this->getMatchHeader($validations);

        if ($matchHeader === null) {
            return [];
        }

        $missingColumns = [];

        foreach ($occurrences as $occurrence) {
            $open = strpos($headerRegex, '[');
            $close = strpos($headerRegex, ']');
            $regex = substr($headerRegex, $open + 1, $close - $open - 1);
            $number = (int)preg_replace('/[^' . $regex . ']/', '', $occurrence);
            $search = str_replace('[' . $regex . ']', $number, $matchHeader);
            $found = false;

            foreach ($headers as $header) {
                if ($header === $search) {
                    $found = true;

                    break;
                }
            }

            if (!$found) {
                $missingColumns[] = $search;
            }
        }

        return $missingColumns;
    }

    private function getMatchHeader(array $validations): ?string
    {
        foreach ($validations as $validation) {
            if (strpos($validation, 'match_header:') !== false) {
                return str_replace('match_header:', '', $validation);
            }
        }

        return null;
    }

    private function findOccurrences(array $header, string $headerRegex): array
    {
        $occurrences = [];

        foreach ($header as $headerName) {
            if (preg_match('/\b(' . $headerRegex . ')\b/', (string)$headerName) === 1) {
                $occurrences[] = $headerName;
            }
        }

        return $occurrences;
    }
}
