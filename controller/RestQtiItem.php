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
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\ItemModel;
use oat\generis\model\OntologyAwareTrait;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;

/**
 * End point of Rest item API
 *
 * @author Absar Gilani, absar.gilani6@gmail.com
 */
class RestQtiItem extends \tao_actions_RestController
{
    use OntologyAwareTrait;
    
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
     * Class items will be created in
     * 
     * @return \core_kernel_classes_Class
     */
    protected function getDestinationClass()
    {
        return $this->getClass(TAO_ITEM_CLASS);
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
            \helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);
            $report = ImportService::singleton()->importQTIPACKFile($package, $this->getDestinationClass());
            \helpers_TimeOutHelper::reset();
            
            \tao_helpers_File::remove($package);
            if ($report->getType() == \common_report_Report::TYPE_ERROR) {
                $this->returnFailure(new \common_Exception(__("An unexpected error occured during the import of the IMS QTI Item Package.")));
            } else {
        
                $itemIds = [];
                /** @var \common_report_Report $subReport */
                foreach ($report as $subReport) {
                    $itemIds[] = $subReport->getData()->getUri();
                }
                $this->returnSuccess(array('items' => $itemIds));
            }
        } catch (ExtractException $e) {
            $this->returnFailure(new \common_Exception(__('The ZIP archive containing the IMS QTI Item cannot be extracted.')));
        } catch (ParsingException $e) {
            $this->returnFailure(new \common_Exception(__('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.')));
        } catch (\Exception $e) {
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
     * @throws \common_exception_BadRequest
     * @throws \oat\tao\helpers\FileUploadException
     */
    protected function getUploadedPackage()
    {
        if (!$this->hasRequestParameter(self::RESTITEM_PACKAGE_NAME)) {
            throw new \common_exception_MissingParameter(self::RESTITEM_PACKAGE_NAME, __CLASS__);
        }

        $file = \tao_helpers_Http::getUploadedFile(self::RESTITEM_PACKAGE_NAME);

        if (!in_array($file['type'], self::$accepted_types)) {
            throw new \common_exception_BadRequest('Uploaded file has to be a valid archive.');
        }

        $pathinfo = pathinfo($file['tmp_name']);
        $destination = $pathinfo['dirname'] . DIRECTORY_SEPARATOR . $file['name'];
        \tao_helpers_File::move($file['tmp_name'], $destination);

        return $destination;
    }

    /**
     * Create an empty item
     */
    public function createQtiItem()
    {
        try {
            // Check if it's post method
            if ($this->getRequestMethod()!=Request::HTTP_POST) {
                throw new \common_exception_NotImplemented('Only post method is accepted to create empty item.');
            }

            $label = $this->hasRequestParameter('label') ? $this->getRequestParameter('label') : '';
            // Call service to import package
            $item = $this->getDestinationClass()->createInstance($label);
            
            //set the QTI type
            $itemService = \taoItems_models_classes_ItemsService::singleton();
            $itemService->setItemModel($item, $this->getResource(ItemModel::MODEL_URI));

            $this->returnSuccess($item->getUri());

        } catch (\Exception $e) {
            $this->returnFailure($e);
        }
    }
    
    /**
     * @author christophe GARCIA <christopheg@taotesting.com>
     */
    public function export() {
         if ($this->getRequestMethod()!=Request::HTTP_GET) {
                throw new \common_exception_NotImplemented('Only post method is accepted to create empty item.');
            }
        
        
    }
}

		    
		    