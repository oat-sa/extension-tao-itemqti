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

use oat\taoQtiItem\model\import\Parser\Exception\WarningImportException;
use PHPUnit\Framework\TestCase;

class WarningReportFormatterTest extends TestCase
{
    /** @var WarningReportFormatter */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new WarningReportFormatter();
    }

    public function testFormat(): void
    {
        $warning1 = new WarningImportException();
        $warning1->addWarning(1, 'w11');
        $warning1->addWarning(1, 'w12');

        $warning2 = new WarningImportException();
        $warning2->addWarning(2, 'w21');
        $warning2->addWarning(2, 'w22');

        $output = $this->subject->format(
            [
                1 => $warning1,
                2 => $warning2
            ]
        );

        $this->assertCount(2, $output->getChildren());
        $this->assertSame('line 1: w11, w12', $output->getChildren()[0]->getMessage());
        $this->assertSame('line 2: w21, w22', $output->getChildren()[1]->getMessage());
    }
}
