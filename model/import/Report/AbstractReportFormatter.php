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

use Exception;
use oat\oatbox\reporting\Report;
use oat\oatbox\service\ConfigurableService;

abstract class AbstractReportFormatter extends ConfigurableService implements ReportFormatter
{
    /**
     * @param Exception[] $exceptions
     *
     * @return Report[]
     */
    protected function buildLineReports(string $type, array $exceptions): array
    {
        $reports = [];

        foreach ($exceptions as $lineNumber => $lineReport) {
            $reports[$lineNumber] = Report::create(
                $type,
                'line %s: %s',
                [
                    $lineNumber,
                    rtrim($lineReport->getMessage(), ', '),
                ]
            );
        }

        return $reports;
    }
}
