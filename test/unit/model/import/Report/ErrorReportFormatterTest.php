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

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Report;

use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\import\Parser\Exception\InvalidImportException;
use PHPUnit\Framework\TestCase;

class ErrorReportFormatterTest extends TestCase
{
    /** @var ErrorReportFormatter */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new ErrorReportFormatter();
    }

    public function testFormat(): void
    {
        $error1 = new InvalidImportException();
        $error1->addError(1, 'e1.1');
        $error1->addError(1, 'e1.2');

        $error2 = new InvalidImportException();
        $error2->addError(2, 'e2.1');
        $error2->addError(2, 'e2.2');

        $output = $this->subject->format(
            [
                1 => $error1,
                2 => $error2,
            ]
        );

        /** @var Report $report1 */
        $report1 = $output->getChildren()[0];

        /** @var Report $report2 */
        $report2 = $output->getChildren()[1];

        $this->assertCount(2, $output->getChildren());
        $this->assertSame('line 1: e1.1, e1.2', $report1->getMessage());
        $this->assertSame('line 2: e2.1, e2.2', $report2->getMessage());
    }
}
