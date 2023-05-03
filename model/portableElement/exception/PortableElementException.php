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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\exception;

class PortableElementException extends \common_Exception
{
    protected $report;

    /**
     * PortableElementInvalidModelException constructor.
     * Set default message is $message is null
     *
     * @param null $message
     * @param int $code
     * @param \Exception|null $previous
     */
    public function __construct($message = null, $code = 0, \Exception $previous = null)
    {
        if (is_null($message)) {
            $message = 'Portable element validation failed';
        }
        parent::__construct($message, $code, $previous);
    }

    /**
     * Set report
     *
     * @param $report
     */
    public function setReport(\common_report_Report $report)
    {
        $this->report = $report;
    }

    /**
     * Return the report
     *
     * @return \common_report_Report
     */
    public function getReport()
    {
        return $this->report;
    }

    /**
     * Extract all report messages to simple array
     *
     * @return array
     */
    public function getReportMessages()
    {
        $messages = [];
        /** @var \common_report_Report $subReport */
        foreach ($this->report as $subReport) {
            $errors = [];
            if ($subReport->containsError()) {
                $errors = $subReport->getErrors();
            }
            $messages[] = [
                'message' => $subReport->getMessage(),
                'details' => $errors
            ];
        }
        return $messages;
    }
}
