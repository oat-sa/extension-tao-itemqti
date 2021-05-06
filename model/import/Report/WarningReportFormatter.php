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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Report;

use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\import\Parser\WarningImportException;

class WarningReportFormatter extends AbstractReportFormatter
{

    /**
     * @param  WarningImportException[]  $report
     */
    public function format(array $report): Report
    {
        return Report::createWarning(
            __(
                '%s line(s) are imported with warnings %s %s' ,
                count($report),
                '<br>',
                implode('<br>', $this->buildLineMessages($report))
            )
        );
    }

}
