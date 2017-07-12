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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

namespace oat\taoQtiItem\model\import;

use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\upload\UploadService;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use \tao_models_classes_import_ImportHandler;
use \helpers_TimeOutHelper;
use \common_report_Report;
use \Exception;
use \common_exception_Error;

/**
 * Imprthandler for QTI packages
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoQTIItem
 */
class QtiPackageImport implements tao_models_classes_import_ImportHandler, PhpSerializable
{

    use PhpSerializeStateless;

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::getLabel()
     */
    public function getLabel() {
        return __('QTI/APIP Content Package');
    }

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::getForm()
     */
    public function getForm() {
        $form = new QtiPackageImportForm();
        return $form->getForm();
    }

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::import()
     * @param \core_kernel_classes_Class $class
     * @param \tao_helpers_form_Form $form
     * @return common_report_Report
     * @throws \oat\oatbox\service\ServiceNotFoundException
     * @throws \common_Exception
     * @throws common_exception_Error
     */
    public function import($class, $form)
    {
        $fileInfo = $form->getValue('source');
        $rollbackInfo = $form->getValue('rollback');

        if (isset($fileInfo['uploaded_file'])) {

            /** @var  UploadService $uploadService */
            $uploadService = ServiceManager::getServiceManager()->get(UploadService::SERVICE_ID);
            $uploadedFile = $uploadService->getUploadedFile($fileInfo['uploaded_file']);

            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);	//the zip extraction is a long process that can exced the 30s timeout

            try {
                $importService = ImportService::singleton();
                $rollbackOnError = in_array('error', $rollbackInfo);
                $rollbackOnWarning = in_array('warning', $rollbackInfo);
                $report = $importService->importQTIPACKFile($uploadedFile, $class, true, $rollbackOnError, $rollbackOnWarning);
            } catch (ExtractException $e) {
                $report = common_report_Report::createFailure(__('The ZIP archive containing the IMS QTI Item cannot be extracted.'));
            } catch (ParsingException $e) {
                $report = common_report_Report::createFailure(__('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.'));
            } catch (Exception $e) {
                $report = common_report_Report::createFailure(__("An unexpected error occured during the import of the IMS QTI Item Package."));
            }

            helpers_TimeOutHelper::reset();
            $uploadService->remove($uploadService->getUploadedFlyFile($fileInfo['uploaded_file']));
        } else {
            throw new common_exception_Error('No source file for import');
        }
        return $report;
    }


}
