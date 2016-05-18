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

/**
 * Crud services implements basic CRUD services, orginally intended for REST controllers/ HTTP exception handlers
 * Consequently the signatures and behaviors is closer to REST and throwing HTTP like exceptions
 *
 * This CRUD Service is the base of RestItems API
 */
class CrudItemsService extends \tao_models_classes_CrudService
{
	/**
	 * Class of current CRUD
	 *
	 * @var \core_kernel_classes_Class
	 */
    protected $itemClass = null;

	/**
	 * Service to manage Class of current CRUD
	 *
	 * @var \taoItems_models_classes_ItemsService
	 */
    protected $itemsService = null;

    public function __construct()
	{
		$this->itemClass = new \core_kernel_classes_Class(TAO_ITEM_CLASS);
		$this->itemsService = \taoItems_models_classes_ItemsService::singleton();
    }

    /**
	 * (non-PHPdoc)
     * @see tao_models_classes_CrudSservice::getRootClass()
     */
    public function getRootClass()
	{
        return $this->itemClass;
    }

    /**
	 * (non-PHPdoc)
     * @see tao_models_classes_CrudSservice::getClassService()
     */
    protected function getClassService()
	{
        return $this->itemsService;
    }

     /**
      * (non-PHPdoc)
      * @see tao_models_classes_CrudService::delete()
      */
    public function delete($uri)
	{
		$resource = new \core_kernel_classes_Resource($uri);
		if ($resource->exists()) {
			return $this->itemsService->deleteResource($resource);
		}
		throw new \common_exception_NotFound('Unable to find an item associated to the uri ' . $uri);
    }

	/**
	 * Create an instance of item based on post parameters
	 *
	 * @param array $propertiesValues Array of property uri and values
	 * @return \core_kernel_classes_Resource
	 */
    public function createFromArray(array $propertiesValues)
	{
		$label = isset($propertiesValues[RDFS_LABEL]) ? $propertiesValues[RDFS_LABEL] : '';
		$type = isset($propertiesValues[RDF_TYPE]) ? $propertiesValues[RDF_TYPE] : $this->getRootClass();
		$itemContent = isset($propertiesValues[TAO_ITEM_CONTENT_PROPERTY]) ? $propertiesValues[TAO_ITEM_CONTENT_PROPERTY] : null;

		unset($propertiesValues[RDFS_LABEL]);
		unset($propertiesValues[RDF_TYPE]);
		unset($propertiesValues[TAO_ITEM_CONTENT_PROPERTY]);

		$resource =  parent::create($label, $type, $propertiesValues);
		if (isset($itemContent)) {
		    $this->itemsService->setItemContent($resource, $itemContent);
		}
		return $resource;
    }

    /**
     * Import uploaded zip through ImportService
	 *
     * @author Rashid Mumtaz & Absar - PCG Team - {absar.gilani6@gmail.com & rashid.mumtaz372@gmail.com}
     * @param $uploadedFile
     * @return \common_report_Report
     */
	public function ImportQtiItem($uploadedFile)
	{
		//the zip extraction is a long process that can exced the 30s timeout
		\helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);

		try {
			$importService = ImportService::singleton();
			$itemClass = new \core_kernel_classes_Class(TAO_ITEM_CLASS) ;
			$report = $importService->importQTIPACKFile($uploadedFile, $itemClass);
		} catch (ExtractException $e) {
			$report = \common_report_Report::createFailure(__('The ZIP archive containing the IMS QTI Item cannot be extracted.'));
		} catch (ParsingException $e) {
			\common_Logger::d($e->getMessage());
			$report = \common_report_Report::createFailure(__('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.'));
		} catch (\Exception $e) {
			$report = \common_report_Report::createFailure(__("An unexpected error occured during the import of the IMS QTI Item Package."));
		}

		\helpers_TimeOutHelper::reset();
		\tao_helpers_File::remove($uploadedFile);

		return $report;
	}
    
}
