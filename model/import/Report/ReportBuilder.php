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
use oat\taoQtiItem\model\import\Validator\AbstractValidationException;
use oat\taoQtiItem\model\import\Validator\ErrorValidationException;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;
use Throwable;

class ReportBuilder extends ConfigurableService
{
    public function buildByResults(ItemImportResult $results, core_kernel_classes_Resource $resource = null): Report
    {
        $reportType = $this->getReportType($results);
        $subReportType = in_array($reportType, [Report::TYPE_INFO, Report::TYPE_SUCCESS])
            ? Report::TYPE_SUCCESS
            : $reportType;

        $subReport = $this->createReportByResults($subReportType, $results);
        $subReport->setData($resource ?? []);

        $report = $this->createReportByResults($reportType, $results);
        $report->setData($resource ?? []);
        $report->add($subReport);

        $onlyWarningReports = [];
        $warningAndErrorReports = [];

        /** @var WarningValidationException[]|ErrorValidationException[] $exceptions */
        foreach ($results->getErrorsAndWarnings() as $lineNumber => $exceptions) {
            $warningReports = [];
            $errorReports = [];

            foreach ($exceptions as $exception) {
                if ($exception instanceof WarningValidationException) {
                    $warningReports[] = $this->createReportByException($exception);
                }

                if ($exception instanceof ErrorValidationException) {
                    $errorReports[] = $this->createReportByException($exception);
                }
            }

            if (empty($errorReports) && empty($warningReports)) {
                continue;
            }

            $lineMainReport = Report::create(
                empty($errorReports) ? Report::TYPE_WARNING : Report::TYPE_ERROR,
                'line %s: %s',
                [
                    $lineNumber,
                    '',
                ]
            );

            foreach ($errorReports as $errorReport) {
                $lineMainReport->add($errorReport);
            }

            foreach ($warningReports as $warningReport) {
                $lineMainReport->add($warningReport);
            }

            if (empty($errorReports)) {
                $onlyWarningReports[$lineNumber] = $lineMainReport;
            }

            if (!empty($errorReports)) {
                $warningAndErrorReports[$lineNumber] = $lineMainReport;
            }
        }

        if (!empty($warningAndErrorReports)) {
            $this->createAndAddSubReport(
                $report,
                $warningAndErrorReports,
                Report::TYPE_ERROR,
                '%s line(s) contain(s) an error and cannot be imported'
            );
        }

        if (!empty($onlyWarningReports)) {
            $this->createAndAddSubReport(
                $report,
                $onlyWarningReports,
                Report::TYPE_WARNING,
                '%s line(s) are imported with warnings'
            );
        }

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

    private function createAndAddSubReport(
        Report $mainReport,
        array $reports,
        string $reportType,
        string $message
    ): void {
        $newReport = Report::create(
            $reportType,
            $message,
            [
                count($reports),
            ]
        );

        foreach ($reports as $subReport) {
            $newReport->add($subReport);
        }

        $mainReport->add($newReport);
    }

    private function createReportByResults(string $type, ItemImportResult $results): Report
    {
        if (0 === $results->getTotalSuccessfulImport() || $results->getTotalScannedItems() === 0) {
            return Report::create(
                $type,
                'CSV import failed: %s/%s line(s) are imported',
                [
                    $results->getTotalSuccessfulImport(), $results->getTotalScannedItems()
                ]
            );
        }

        if (0 === $results->getTotalErrors() && 0 === $results->getTotalWarnings()) {
            return Report::create(
                $type,
                'CSV import successful: %s/%s line(s) are imported',
                [
                    $results->getTotalSuccessfulImport(),
                    $results->getTotalScannedItems()
                ]
            );
        }

        return Report::create(
            $type,
            'CSV import partially successful: %s/%s line(s) are imported (%s warning(s), %s error(s))',
            [
                $results->getTotalSuccessfulImport(),
                $results->getTotalScannedItems(),
                $results->getTotalWarnings(),
                $results->getTotalErrors()
            ]
        );
    }

    private function createReportByException(AbstractValidationException $exception): Report
    {
        if ($exception instanceof WarningValidationException) {
            return Report::create(
                Report::TYPE_WARNING,
                $exception->getMessage(),
                $exception->getInterpolationData()
            );
        }

        if ($exception instanceof ErrorValidationException) {
            return Report::create(
                Report::TYPE_ERROR,
                $exception->getMessage(),
                $exception->getInterpolationData()
            );
        }
    }

    private function getReportType(ItemImportResult $results): string
    {
        if ($results->getTotalSuccessfulImport() === 0) {
            return Report::TYPE_ERROR;
        }

        if ($results->getTotalWarnings() === 0 && $results->getTotalErrors() === 0) {
            return Report::TYPE_SUCCESS;
        }

        return Report::TYPE_INFO;
    }
}
