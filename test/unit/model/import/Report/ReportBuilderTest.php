<?php

/**
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

use core_kernel_classes_Resource;
use InvalidArgumentException;
use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\import\ItemImportResult;
use oat\taoQtiItem\model\import\ItemInterface;
use oat\taoQtiItem\model\import\Validator\AggregatedValidationException;
use oat\taoQtiItem\model\import\Validator\ErrorValidationException;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;
use PHPUnit\Framework\TestCase;

class ReportBuilderTest extends TestCase
{
    /** @var ReportBuilder */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new ReportBuilder();
    }

    public function testBuildByResults(): void
    {
        $firstItem = $this->createMock(core_kernel_classes_Resource::class);
        $item = $this->createMock(ItemInterface::class);

        $warningException = new WarningValidationException('warning');
        $errorException = new ErrorValidationException('error');

        $sut = new ItemImportResult();
        $sut->setTotalScannedItems(3);
        $sut->setTotalSuccessfulImport(1);
        $sut->setFirstItem($firstItem);
        $sut->addException(1, new AggregatedValidationException([$errorException], [$warningException]));
        $sut->addException(2, new AggregatedValidationException([], [$warningException]));
        $sut->addItem(3, $item);

        $report = $this->subject->buildByResults($sut);

        /** @var Report $subReport1 */
        $subReport1 = $report->getChildren()[0];

        /** @var Report $subReport1p1 */
        $subReport1p1 = $subReport1->getChildren()[0];

        /** @var Report $subSubReport1p1 */
        $subSubReport1p1 = $subReport1p1->getChildren()[0];

        /** @var Report $subSubReport1p2 */
        $subSubReport1p2 = $subReport1p1->getChildren()[1];

        /** @var Report $subReport2 */
        $subReport2 = $report->getChildren()[1];

        /** @var Report $subReport2p1 */
        $subReport2p1 = $subReport2->getChildren()[0];

        /** @var Report $subSubReport2p1 */
        $subSubReport2p1 = $subReport2p1->getChildren()[0];

        $this->assertSame(
            'CSV import partially successful: 1/3 line(s) are imported (2 warning(s), 1 error(s))',
            $report->getMessage()
        );
        $this->assertSame('1 line(s) contain(s) an error and cannot be imported', $subReport1->getMessage());
        $this->assertSame('line 1: ', $subReport1p1->getMessage());
        $this->assertSame('error', $subSubReport1p1->getMessage());
        $this->assertSame('warning', $subSubReport1p2->getMessage());

        $this->assertSame('1 line(s) are imported with warnings', $subReport2->getMessage());
        $this->assertSame('line 2: ', $subReport2p1->getMessage());
        $this->assertSame('warning', $subSubReport2p1->getMessage());
    }

    public function testBuildByException(): void
    {
        $error = new InvalidArgumentException('error');

        $report = $this->subject->buildByException($error);

        /** @var Report $subReport */
        $subReport = $report->getChildren()[0];

        $this->assertCount(1, $report->getChildren());
        $this->assertSame('CSV import failed', $report->getMessage());
        $this->assertSame(
            'An unexpected error occurred during the CSV import. The system returned the following error: `error`',
            $subReport->getMessage()
        );
    }
}
