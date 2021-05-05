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

use oat\taoQtiItem\model\import\Parser\WarningImportException;
use PHPUnit\Framework\TestCase;

class WarningReportFormatterTest extends TestCase
{

    public function testFormat()
    {
        $sut = new WarningReportFormatter();

        $wr2 = new WarningImportException();
        $wr2->addWarning(2, 'w21');
        $wr2->addWarning(2, 'w22');
        $wr2->addWarning(2, 'w23');

        $wr1 = new WarningImportException();
        $wr1->addWarning(1, 'w11');
        $wr1->addWarning(1, 'w12');
        $wr1->addWarning(1, 'w13');

        $reports = [
            2 => $wr2,
            1 => $wr1
        ];
        $output = $sut->format($reports);
//        $this->assertIsArray($output->getData());
//        $this->assertSame([1 => 'line 1: w11, w12, w13', 2 => 'line 2: w21, w22, w23'], $output->getData());
        $this->assertSame(sprintf('%s line{{s}} are imported with warnings <br> line 1: w11, w12, w13<br>line 2: w21, w22, w23', count($reports)), $output->getMessage());
    }
}
