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
use oat\taoQtiItem\model\import\Parser\Exception\InvalidImportException;
use oat\taoQtiItem\model\import\Parser\Exception\WarningImportException;
use oat\taoQtiItem\model\import\Validator\HeaderValidator;
use oat\taoQtiItem\model\import\Validator\LineValidator;
use oat\taoQtiItem\model\import\Validator\ValidatorInterface;
use oat\taoQtiItem\model\import\TemplateInterface;

class CsvParser extends ConfigurableService implements ParserInterface
{
    /**
     * @inheritDoc
     */
    public function parseFile(File $file, TemplateInterface $template): ItemImportResult
    {
        $logger = $this->getLogger();
        $lines = explode(PHP_EOL, $file->readPsrStream()->getContents());
        $header = $this->convertCsvLineToArray($lines[0]);
        $header = $this->trimLine($header);

        $logger->debug('Tabular import: header validation started');

        $this->getHeaderValidator()->validate($header, $template);

        $logger->debug('Tabular import: header validation finished');

        array_shift($lines);

        $items = [];
        $warningReport = [];
        $errorsReport = [];
        $currentLineNumber = 0;
        $lineValidator = $this->getLineValidator();
        $csvLineConverter = $this->getCsvLineConverter();

        foreach (array_filter($lines) as $lineNumber => $line) {
            $currentLineNumber = $lineNumber + 1;

            $logger->debug(sprintf('Tabular import: line: %s raw data: "%s"', $currentLineNumber, $line));

            $parsedLine = $this->trimLine($this->convertCsvLineToArray($line));
            $headedLine = array_combine($header, $parsedLine);

            try {
                $logger->debug(sprintf('Tabular import: line %s validation started', $lineNumber));

                $lineValidator->validate($headedLine, $template);

                $logger->debug(sprintf('Tabular import: line %s validation finished', $lineNumber));
            } catch (WarningImportException $exception) {
                if ($exception->getTotal()) {
                    $errorsReport[$currentLineNumber] = $exception;

                    continue;
                }

                $warningReport[$currentLineNumber] = $exception;
            } catch (InvalidImportException $exception) {
                $errorsReport[$currentLineNumber] = $exception;

                continue;
            }

            $logger->debug(sprintf('Tabular import: line %s transformation started', $lineNumber));

            $item = $csvLineConverter->convert($headedLine, $template, $warningReport[$currentLineNumber] ?? null);

            if ($item->isNoneResponse()) {
                $warning = new WarningImportException();
                $warning->addMessage(
                    'A value should be provided for at least one of the columns: %s',
                    [
                        'choice_[1-99]_score, correct_answer',
                    ]
                );

                $warningReport[$currentLineNumber] = $warning;
            }

            $items[$currentLineNumber] = $item;

            $logger->debug(sprintf('Tabular import: line %s transformation finished', $lineNumber));
        }

        return new ItemImportResult($items, $warningReport, $errorsReport, $currentLineNumber);
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
