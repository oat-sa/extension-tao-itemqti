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
 * 
 */

/**
 * .Crud services implements basic CRUD services, orginally intended for REST controllers/ HTTP exception handlers
 *  Consequently the signatures and behaviors is closer to REST and throwing HTTP like exceptions
 *  
 *
 * 
 */
namespace oat\taoQtiItem\controller;



use \oat\taoQtiItem\model\qti\ImportService;

class CrudItemsService
    extends \tao_models_classes_CrudService
{
    protected $itemClass = null;
   
    protected $itemsServices = null;

    protected $testService=null;

    public function __construct(){
		parent::__construct();
		$this->itemClass = new \core_kernel_classes_Class(TAO_ITEM_CLASS);
		$this->itemsServices = \taoItems_models_classes_ItemsService::singleton();
    }
    /** (non-PHPdoc)
    * @see tao_models_classes_CrudSservice::getRootClass()
    */
    public function getRootClass(){
        return $this->itemClass;
    }
    /** (non-PHPdoc)
    * @see tao_models_classes_CrudSservice::getClassService()
    */
    protected function getClassService(){
        return $this->itemsServices;
    }
     /**
     * (non-PHPdoc)
     * @see tao_models_classes_CrudService::delete()
     */    
    public function delete( $resource){
         \taoItems_models_classes_ItemsService::singleton()->deleteItem(new \core_kernel_classes_Resource($resource));
         return true;
    }


    /**
     * @param array parameters an array of property uri and values
     */
    public function createFromArray(array $propertiesValues){
	
	    if (!isset($propertiesValues[RDFS_LABEL])) {
			$propertiesValues[RDFS_LABEL] = "";
		}
		
		/*if (isset($propertiesValues[TAO_ITEM_CONTENT_PROPERTY]))*/
		$type = isset($propertiesValues[RDF_TYPE]) ? $propertiesValues[RDF_TYPE] : $this->getRootClass();
		$label = $propertiesValues[RDFS_LABEL];
		unset($propertiesValues[RDFS_LABEL]);
		unset($propertiesValues[RDF_TYPE]);

		$itemContent = null;
		if (isset($propertiesValues[TAO_ITEM_CONTENT_PROPERTY])) {
		    $itemContent = $propertiesValues[TAO_ITEM_CONTENT_PROPERTY];
		    unset($propertiesValues[TAO_ITEM_CONTENT_PROPERTY]);
		}
		$resource =  parent::create($label, $type, $propertiesValues);
		if (isset($itemContent)) {
		    $this->itemsServices->setItemContent($resource, $itemContent);
		}
		return $resource;
    }
    /**
     * 
     * @author Rashid Mumtaz & Absar - PCG Team - {absar.gilani6@gmail.com & rashid.mumtaz372@gmail.com}
     * @param $uploadedFile
     * @return common_report_Report
     */
	public function ImportQtiItem($uploadedFile){
		\helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);	//the zip extraction is a long process that can exced the 30s timeout

		try {
			$importService = ImportService::singleton();
			$itemClass = new \core_kernel_classes_Class ("http://www.tao.lu/Ontologies/TAOItem.rdf#Item") ;
			$report = $importService->importQTIPACKFile($uploadedFile, $itemClass);

		} catch (ExtractException $e) {
			$report = \common_report_Report::createFailure(__('The ZIP archive containing the IMS QTI Item cannot be extracted.'));
		} catch (ParsingException $e) {
			$report = \common_report_Report::createFailure(__('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.'));
		} catch (Exception $e) {
			$report = \common_report_Report::createFailure(__("An unexpected error occured during the import of the IMS QTI Item Package."));
		}

		\helpers_TimeOutHelper::reset();
		\tao_helpers_File::remove($uploadedFile);

		return $report;
	}
    
}
