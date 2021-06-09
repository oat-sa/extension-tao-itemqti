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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import;

use core_kernel_classes_Resource;
use oat\taoQtiItem\model\import\Validator\AggregatedValidationException;
use oat\taoQtiItem\model\import\Validator\ErrorValidationException;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;
use PHPUnit\Framework\TestCase;

class CsvItemResultTest extends TestCase
{
    public function testGetters(): void
    {
        $firstItem = $this->createMock(core_kernel_classes_Resource::class);
        $item = $this->createMock(ItemInterface::class);

        $warningException = new WarningValidationException('warning');
        $errorException = new ErrorValidationException('error');
        $aggregatedException = new AggregatedValidationException([$errorException], [$warningException]);

        $sut = new ItemImportResult();
        $sut->setTotalScannedItems(5);
        $sut->setTotalSuccessfulImport(4);
        $sut->setFirstItem($firstItem);
        $sut->addException(1, $aggregatedException);
        $sut->addItem(2, $item);

        $this->assertSame($firstItem, $sut->getFirstItem());
        $this->assertSame(5, $sut->getTotalScannedItems());
        $this->assertSame(4, $sut->getTotalSuccessfulImport());
        $this->assertSame(
            [
                2 => $item,
            ],
            $sut->getItems()
        );
        $this->assertSame(
            [
                1 => [
                    $errorException,
                ]
            ],
            $sut->getErrors()
        );
        $this->assertSame(
            [
                1 => [
                    $warningException,
                ]
            ],
            $sut->getWarnings()
        );
        $this->assertSame(
            [
                1 => [
                    $errorException,
                    $warningException,
                ]
            ],
            $sut->getErrorsAndWarnings()
        );
    }
}
