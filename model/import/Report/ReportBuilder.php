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

use oat\oatbox\reporting\Report;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ItemImportResult;

class ReportBuilder extends ConfigurableService
{
    public function buildReportsContainer(
        string $outerHeader,
        string $innerHeader,
        ItemImportResult $importerResults = null
    ): Report {
        if ($importerResults && 0 === $importerResults->getTotalSuccessfulImport()) {
            $report = Report::createError($outerHeader, []);
            $report->add(Report::createError($innerHeader, []));
        } else {
            $report = Report::createInfo($outerHeader, []);
            if (0 == count($importerResults->getWarningReports()) && 0 === count($importerResults->getErrorReports())) {
                $report = Report::createSuccess($outerHeader, []);
            }
            $report->add(Report::createSuccess($innerHeader, []));
        }
        return $report;
    }

    public function getReportTitle(ItemImportResult $importerResults): string
    {
        $title = __('CSV import partially successful: %s/%s line(s) are imported (%s warning(s), %s error(s))');
        if (0 === count($importerResults->getErrorReports()) && 0 === count($importerResults->getWarningReports())) {
            $title = __('CSV import successful: %s/%s line(s) are imported');
        }
        if (0 === $importerResults->getTotalSuccessfulImport()) {
            $title = __('CSV import failed: %s/%s line(s) are imported');
        }

        return sprintf(
            $title,
            $importerResults->getTotalSuccessfulImport(),
            $importerResults->getTotalScannedItems(),
            count($importerResults->getWarningReports()),
            count($importerResults->getErrorReports())
        );
    }
}
