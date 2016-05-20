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

use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use \oat\taoQtiItem\model\qti\ImportService;

class ItemRestImportService
{
	/**
	 * Service to manage $itemClass import
	 *
	 * @var ImportService
	 */
    protected $importService = null;

	/**
	 * Class to import e.q. item class
	 *
	 * @var \core_kernel_classes_Class
	 */
	protected $itemClass;

	/**
	 * ItemRestImportService constructor.
	 * Init importService and itemClass
	 */
    public function __construct()
	{
		$this->importService = ImportService::singleton();
		$this->itemClass = new \core_kernel_classes_Class(TAO_ITEM_CLASS);
    }

    /**
     * Import uploaded zip through ImportService
	 *
     * @param $uploadedFile
     * @return \common_report_Report
     */
	public function ImportQtiItem($uploadedFile)
	{
		//the zip extraction is a long process that can exced the 30s timeout
		\helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);

		try {
			$report = $this->importService->importQTIPACKFile($uploadedFile, $this->itemClass);
		} catch (ExtractException $e) {
			$report = \common_report_Report::createFailure(__('The ZIP archive containing the IMS QTI Item cannot be extracted.'));
		} catch (ParsingException $e) {
			$report = \common_report_Report::createFailure(__('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.'));
		} catch (\Exception $e) {
			$report = \common_report_Report::createFailure(__("An unexpected error occured during the import of the IMS QTI Item Package."));
		}

		\helpers_TimeOutHelper::reset();
		\tao_helpers_File::remove($uploadedFile);

		return $report;
	}

	/**
	 * Create an empty item with optional $label & $comment
	 *
	 * @param string $label
	 * @param string $comment
	 * @return string
	 */
	public function createQtiItem($label = '', $comment = '')
	{
		$resource = $this->itemClass->createInstance($label, $comment);
		return $resource->getUri();
	}
}
