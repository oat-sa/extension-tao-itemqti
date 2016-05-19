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

/**
 * End point of Rest item API
 *
 * @author Absar Gilani, absar.gilani6@gmail.com
 */
class RestItems extends \tao_actions_CommonRestModule
{
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
     * RestItems constructor.
     * Create CrudItemsService
     */
    public function __construct()
    {
        parent::__construct();
       $this->service = CrudItemsService::singleton();
	}

	/**
	 * Optionnaly a specific rest controller may declare
	 * aliases for parameters used for the rest communication
	 */
    protected function getParametersAliases()
    {
	    return array_merge(parent::getParametersAliases(), array(
            "model" => TAO_ITEM_CLASS,
            "qtiPackage",
	    ));
	}

    /**
     * Optionnal Requirements for parameters to be sent on every service
     * Rename file with original name
     *
     * @param $file
     * @return \common_report_Report
     */
    protected function importQtiPackage($file)
    {
        $pathinfo = pathinfo($file['tmp_name']);
        $destination = $pathinfo['dirname'] . DIRECTORY_SEPARATOR . $file['name'];
        \tao_helpers_File::move($file['tmp_name'], $destination);

        if (!in_array($file['type'], self::$accepted_types)) {
            return new \common_report_Report(\common_report_Report::TYPE_ERROR, __("Incorrect File Type"));
        }

        return $this->service->importQtiItem($destination);
    }

    /**
     * You may use either the alias or the uri, if the parameter identifier
     * is set it will become mandatory for the method/operation in $key
     * Default Parameters Requirments are applied
     * type by default is not required and the root class type is applied
     *
     * @return array
     */
    protected function getParametersRequirements()
    {
	    return array(
            "post" => array(
                "qtiPackage"
            )
	    );
	}

    /**
     * Post method handler, create an item from uploaded item package or from array
     *
     * @throws \common_exception_Error
     * @throws \common_exception_MissingParameter
     * @throws \oat\tao\helpers\FileUploadException
     */
    protected function post()
    {  
        $parameters = $this->getParameters();

        if (!isset($parameters['qtiPackage'])) {
            $data = $this->service->createFromArray($parameters);
            $this->returnSuccess($data);
        }
        $data = $this->importQtiPackage(\tao_helpers_Http::getUploadedFile('qtiPackage'));
        if ($data->getType() === \common_report_Report::TYPE_ERROR) {
            throw new \common_exception_Error($data->getMessage());
        }

        $finalReport = [];
        /** @var \common_report_Report $report */
        foreach ($data as $report) {
            $finalReport[] = $report->getMessage();
        }
        $this->returnSuccess(array('Items created' => $finalReport));
    }
}

		    
		    