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
 */

namespace oat\taoQtiItem\controller;

use \Request;

/**
 * End point of Rest item API
 *
 * @author Absar Gilani, absar.gilani6@gmail.com
 */
class RestQtiItem extends \tao_actions_RestController
{
    const RESTITEM_PACKAGE_NAME = 'content';

    /**
     * Accepted archive types
     *
     * @var array
     */
    private static $accepted_types = array(
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    );

    /**
     * @return ItemRestImportService
     */
    public function getItemRestImportService()
    {
        if (!$this->service) {
            $this->service = new ItemRestImportService();
        }
        return $this->service;
    }

    /**
     * Only import method is available, so index return failure response
     */
    public function index()
    {
        $this->returnFailure(new \common_exception_NotImplemented('This API does not support this call.'));
    }

    /**
     * Import file entry point by using $this->service
     * Check POST method & get valid uploaded file
     */
    public function import()
    {
        try {
            // Check if it's post method
            if ($this->getRequestMethod()!=Request::HTTP_POST) {
                throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
            }

            // Get valid package parameter
            $package = $this->getUploadedPackage();

            // Call service to import package
            $report = $this->getItemRestImportService()->importQtiItem($package);

            if ($report->getType()==\common_report_Report::TYPE_ERROR) {
                throw new \common_Exception('Error during item importing: ' . $report->getMessage());
            }

            $finalReport = [];
            /** @var \common_report_Report $report */
            foreach ($report as $subReport) {
                $finalReport[] = $subReport->getData()->getUri();
            }
            $this->returnSuccess(array('Items' => $finalReport));

        } catch (\Exception $e) {
            \common_Logger::w($e->getMessage());
            $this->returnFailure($e);
        }
    }

    /**
     * Return a valid uploaded file
     *
     * @return string
     * @throws \common_Exception
     * @throws \common_exception_Error
     * @throws \common_exception_MissingParameter
     * @throws \common_exception_NotAcceptable
     * @throws \oat\tao\helpers\FileUploadException
     */
    protected function getUploadedPackage()
    {
        if (!$this->hasRequestParameter(self::RESTITEM_PACKAGE_NAME)) {
            throw new \common_exception_MissingParameter(self::RESTITEM_PACKAGE_NAME, __CLASS__);
        }

        $file = \tao_helpers_Http::getUploadedFile(self::RESTITEM_PACKAGE_NAME);

        if (!in_array($file['type'], self::$accepted_types)) {
            throw new \common_exception_NotAcceptable('Uploaded file has to be a valid archive.');
        }

        $pathinfo = pathinfo($file['tmp_name']);
        $destination = $pathinfo['dirname'] . DIRECTORY_SEPARATOR . $file['name'];
        \tao_helpers_File::move($file['tmp_name'], $destination);

        return $destination;
    }
}

		    
		    