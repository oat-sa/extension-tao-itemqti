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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\qti\parser;

use common_Exception;
use common_Logger;
use common_report_Report;
use oat\oatbox\filesystem\File;

class ValidationException extends common_Exception
{
    private $errors;
    private $xmlFile;

    /**
     * @param string|File $file
     * @param array $errors
     */
    public function __construct($file, $errors)
    {
        $this->errors = $errors;
        $this->xmlFile  = $file;

        parent::__construct('Failed to validate ' . $this->getFilename());
    }

    /**
     * return string
     */
    private function getFilename()
    {
        $filename = $this->xmlFile;
        if ($this->xmlFile instanceof File) {
            $filename = $this->xmlFile->getBasename();
        }
        return $filename;
    }

    /**
     * @return common_report_Report
     */
    public function getReport()
    {
        return common_report_Report::createFailure(
            __("Malformed XML[%s]:\n%s", $this->getFilename(), implode("\n", $this->errors))
        );
    }

    /**
     * @return int
     */
    public function getSeverity()
    {
        return common_Logger::ERROR_LEVEL;
    }
}
