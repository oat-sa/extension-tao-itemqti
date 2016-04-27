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
 */
/**
 *
 * @author Absar Gilani, absar.gilani6@gmail.com
 */
namespace oat\taoQtiItem\controller;

//use oat\taoQtiItem\controller\CrudItemsService;

class RestItems extends \tao_actions_CommonRestModule {

    const TAO_ITEM_MODEL_PROPERTY = 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemModel'; 
    
    private static $accepted_types = array(
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    );
    
    public function __construct(){
        parent::__construct();
	//The service taht implements or inherits get/getAll/getRootClass ... for that particular type of resources
       $this->service = CrudItemsService::singleton();
	}

	/**
	 * Optionnaly a specific rest controller may declare
	 * aliases for parameters used for the rest communication
	 */
    protected function getParametersAliases(){
	return array_merge(parent::getParametersAliases(), array(
            "model"=> TAO_ITEM_MODEL_PROPERTY,
            "qtiPackage",
	    ));
	}
	/**
	 * Optionnal Requirements for parameters to be sent on every service
	 *
	 */
    protected function importQtiPackage($file)
    {
       // print_r($file);
        //die();
        $mimeType = \tao_helpers_File::getMimeType($file['tmp_name']);
        if (!in_array($mimeType, self::$accepted_types)) {
            return new \common_report_Report(\common_report_Report::TYPE_ERROR, __("Incorrect File Type"));
        }
        return $this->service->importQtiItem($file['tmp_name']);
    }
    
    protected function getParametersRequirements() {
	return array(
	    "post" => array(
                "qtiPackage"
                )
		/** you may use either the alias or the uri, if the parameter identifier
		 *  is set it will become mandatory for the method/operation in $key
		* Default Parameters Requirents are applied
		* type by default is not required and the root class type is applied
		*/	
	    );
	}
        
    protected function post()
    {  
        $parameters = $this->getParameters();
        if(isset($parameters['qtiPackage'])){
            $data = $this->importQtiPackage(\tao_helpers_Http::getUploadedFile("qtiPackage"));
            if ($data->getType() === \common_report_Report::TYPE_ERROR) {
                $e = new \common_exception_Error($data->getMessage());
                return $this->returnFailure($e);
            } else {
                foreach ($data as $r) {
                    $values = $r->getData();
                    $itemId = $values->getUri();
                    $data = array(                
                    'Items' => $itemId);
                    return $this->returnSuccess($data);
                }
        }
        }else{
            try{
            $data = $this->service->createFromArray($parameters);
		} catch (Exception $e) {
		    return $this->returnFailure($e);
		}
		return $this->returnSuccess($data);
        }
    }
}
?>

		    
		    