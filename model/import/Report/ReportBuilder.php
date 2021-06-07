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
use oat\oatbox\reporting\Report;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ItemImportResult;
use Throwable;

class ReportBuilder extends ConfigurableService
{
    public function buildByResults(ItemImportResult $results, core_kernel_classes_Resource $resource = null): Report
    {
        $reportType = $this->getReportType($results);
        $subReportType = in_array($reportType, [Report::TYPE_INFO, Report::TYPE_SUCCESS])
            ? Report::TYPE_SUCCESS
            : $reportType;

        $report = $this->createReportByResults($reportType, $results);
        $report->setData($resource ?? []);
        $report->add($this->createReportByResults($subReportType, $results));

        return $report;
    }

    public function buildByException(Throwable $exception): Report
    {
        $report = Report::create(Report::TYPE_ERROR, 'CSV import failed');
        $report->add(
            Report::create(
                Report::TYPE_ERROR,
                'An unexpected error occurred during the CSV import. The system returned the following error: `%s`',
                [
                    $exception->getMessage(),
                ]
            )
        );

        return $report;
    }

    private function createReportByResults(string $type, ItemImportResult $importerResults): Report
    {
        if (0 === count($importerResults->getErrorReports()) && 0 === count($importerResults->getWarningReports())) {
            return Report::create(
                $type,
                'CSV import successful: %s/%s line(s) are imported',
                [
                    $importerResults->getTotalSuccessfulImport(),
                    $importerResults->getTotalScannedItems()
                ]
            );
        }

        if (0 === $importerResults->getTotalSuccessfulImport()) {
            return Report::create(
                $type,
                'CSV import failed: %s/%s line(s) are imported',
                [
                    $importerResults->getTotalSuccessfulImport(), $importerResults->getTotalScannedItems()
                ]
            );
        }

        return Report::create(
            $type,
            'CSV import partially successful: %s/%s line(s) are imported (%s warning(s), %s error(s))',
            [
                $importerResults->getTotalSuccessfulImport(),
                $importerResults->getTotalScannedItems(),
                count($importerResults->getWarningReports()),
                count($importerResults->getErrorReports())
            ]
        );
    }

    private function getReportType(ItemImportResult $results): string
    {
        if ($results->getTotalSuccessfulImport() === 0) {
            return Report::TYPE_ERROR;
        }

        if (count($results->getWarningReports()) === 0 && count($results->getErrorReports()) === 0) {
            return Report::TYPE_SUCCESS;
        }

        return Report::TYPE_INFO;
    }
}
