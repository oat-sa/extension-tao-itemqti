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

namespace oat\taoQtiItem\model\import\Parser;

use oat\oatbox\filesystem\File;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ItemImportResult;
use oat\taoQtiItem\model\import\Validator\AggregatedValidationException;
use oat\taoQtiItem\model\import\Validator\HeaderValidator;
use oat\taoQtiItem\model\import\Validator\LineValidator;
use oat\taoQtiItem\model\import\Validator\ValidatorInterface;
use oat\taoQtiItem\model\import\TemplateInterface;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;
use Throwable;

class CsvParser extends ConfigurableService implements ParserInterface
{
    /**
     * @inheritDoc
     */
    public function parseFile(File $file, TemplateInterface $template): ItemImportResult
    {
        $results = new ItemImportResult();
        $logger = $this->getLogger();
        $lineValidator = $this->getLineValidator();
        $csvLineConverter = $this->getCsvLineConverter();
        $currentLineNumber = 0;

        $lines = explode(PHP_EOL, $file->readPsrStream()->getContents());
        $header = $this->convertCsvLineToArray($lines[0]);
        $header = $this->trimLine($header);

        try {
            $this->getHeaderValidator()->validate($header, $template);
        } catch (Throwable $exception) {
            $logger->warning(
                sprintf(
                    'Tabular import: Unexpected error on line %s: %s',
                    1,
                    $exception->getMessage()
                )
            );

            return $results->addException(1, $exception);
        }

        array_shift($lines);

        foreach (array_filter($lines) as $lineNumber => $line) {
            $currentLineNumber = $lineNumber + 1;
            $aggregatedException = null;

            $parsedLine = $this->trimLine($this->convertCsvLineToArray($line));
            $headedLine = array_combine($header, $parsedLine);

            try {
                $lineValidator->validate($headedLine, $template);
            } catch (AggregatedValidationException $aggregatedException) {
                $results->addException($currentLineNumber, $aggregatedException);

                if ($aggregatedException->hasErrors()) {
                    continue;
                }
            } catch (Throwable $exception) {
                $results->addException($currentLineNumber, $exception);

                $logger->error(
                    sprintf(
                        'Tabular import: Unexpected error on line %s: %s',
                        $currentLineNumber,
                        $exception->getMessage()
                    )
                );
            }

            $item = $csvLineConverter->convert($headedLine, $template, $aggregatedException);

            if ($item->isNoneResponse()) {
                $results->addException(
                    $currentLineNumber,
                    new WarningValidationException(
                        'A value should be provided for at least one of the columns: %s',
                        [
                            'choice_[1-99]_score, correct_answer',
                        ]
                    )
                );
            }

            $results->addItem($currentLineNumber, $item);
        }

        $results->setTotalScannedItems($currentLineNumber);

        return $results;
    }

    private function trimLine(array $line): array
    {
        $newLine = [];

        foreach ($line as $value) {
            $newLine[] = trim((string)$value);
        }

        return $newLine;
    }

    private function convertCsvLineToArray(string $line): array
    {
        return str_getcsv($line);
    }

    private function getHeaderValidator(): ValidatorInterface
    {
        return $this->getServiceLocator()->get(HeaderValidator::class);
    }

    private function getLineValidator(): ValidatorInterface
    {
        return $this->getServiceLocator()->get(LineValidator::class);
    }

    private function getCsvLineConverter(): CsvLineConverter
    {
        return $this->getServiceLocator()->get(CsvLineConverter::class);
    }
}
