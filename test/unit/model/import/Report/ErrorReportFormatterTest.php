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

namespace oat\taoQtiItem\model\import\Report;

use oat\taoQtiItem\model\import\Parser\InvalidImportException;
use oat\taoQtiItem\model\import\Parser\WarningImportException;
use PHPUnit\Framework\TestCase;

class ErrorReportFormatterTest extends TestCase
{

    public function testFormat()
    {
        $sut = new ErrorReportFormatter();

        $error2 = new InvalidImportException();
        $error2->addError(2, 'oh');
        $error2->addError(2, 'ah');
        $error2->addError(2, 'oi');

        $error1 = new InvalidImportException();
        $error1->addError(1, 'e1');
        $error1->addError(1, 'e2');
        $error1->addError(1, 'e3');

        $reports = [
            2 => $error2,
            1 => $error1
        ];
        $output = $sut->format($reports);
        $this->assertCount(2, $output->getChildren());
        $this->assertContains('e1', $output->getChildren()[0]->getMessage());
    }
}
