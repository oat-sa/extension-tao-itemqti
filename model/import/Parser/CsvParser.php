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
use oat\taoQtiItem\model\import\CsvItem;
use oat\taoQtiItem\model\import\Validator\HeaderValidator;
use oat\taoQtiItem\model\import\Validator\LineValidator;
use oat\taoQtiItem\model\import\Validator\ValidatorInterface;
use oat\taoQtiItem\model\import\TemplateInterface;

class CsvParser extends ConfigurableService implements ParserInterface
{
    public function parseFile(File $file, TemplateInterface $template): array
    {
        $lines = explode(PHP_EOL, $file->readPsrStream()->getContents());
        $header = $this->convertCsvLineToArray($lines[0]);

        $this->getHeaderValidator()->validate($header, $template);

        array_shift($lines);

        $lineValidator = $this->getLineValidator();

        $items = [];

        foreach ($lines as $line) {
            $parsedLine = $this->convertCsvLineToArray($line);

            $lineValidator->validate($parsedLine, $template);

            $items[] = $this->convertLineToItem($parsedLine, $template);
        }

        return $items;
    }

    private function convertLineToItem(array $line, TemplateInterface $template): CsvItem
    {
        /**
         * @TODO Conversion will be done later DYNAMICALLY based on $template
         */
        return new CsvItem(
            '',
            '',
            true,
            0,
            1,
            'en-US',
            [],
            [],
            7.5
        );
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
}
