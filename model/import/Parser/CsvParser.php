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

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\Validator\HeaderValidator;
use oat\taoQtiItem\model\import\Validator\LineValidator;
use oat\taoQtiItem\model\import\Validator\ValidatorInterface;
use oat\taoQtiItem\model\import\TemplateInterface;

class CsvParser extends ConfigurableService implements ParserInterface
{
    public function parse(string $fileContent, TemplateInterface $template): array
    {
        $lines = explode(PHP_EOL, $fileContent);
        $header = $lines[0];

        $this->getHeaderValidator()->validate($header, $template);

        $lines = array_shift($lines);

        $lineValidator = $this->getLineValidator();

        foreach ($lines as $line) {
            $lineValidator->validate($line, $template);
        }

        return []; //@TODO Return a collection of objects to populate the QTI template
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
