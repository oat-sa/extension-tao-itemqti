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
 * Copyright (c) 2014-2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\Export;

use common_Exception;
use common_exception_Error;
use common_report_Report as Report;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\resources\SecureResourceServiceInterface;
use oat\taoQtiItem\model\event\QtiItemExportEvent;
use oat\taoQtiItem\model\ItemModel;
use tao_helpers_form_Form;
use tao_models_classes_export_ExportHandler;
use core_kernel_classes_Resource;
use core_kernel_classes_Class;
use taoItems_models_classes_ItemsService;
use tao_helpers_File;
use Exception;
use ZipArchive;
use common_Logger;

/**
 * Apip Package Export Handler.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */
class ApipPackageExportHandler implements tao_models_classes_export_ExportHandler, PhpSerializable
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;

    /**
     * @return string
     */
    public function getLabel()
    {
        return __('APIP Content Package');
    }

    /**
     * @param core_kernel_classes_Resource $resource
     *
     * @return tao_helpers_form_Form
     * @throws common_Exception
     * @throws common_exception_Error
     */
    public function getExportForm(core_kernel_classes_Resource $resource)
    {
        if ($resource instanceof core_kernel_classes_Class) {
            $formData['items'] = $this->getResourceService()->getAllChildren($resource);
            $formData['file_name'] = $resource->getLabel();
        } else {
            $formData = ['instance' => $resource];
        }

        return (new ApipExportForm($formData))->getForm();
    }

    /**
     * @param array  $formValues
     * @param string $destination
     * @return string
     * @throws common_exception_Error
     */
    public function export($formValues, $destination)
    {
        $report = Report::createSuccess();

        if (isset($formValues['filename'])) {
            $instances = $formValues['instances'];

            if (count($instances) > 0) {
                $itemService = taoItems_models_classes_ItemsService::singleton();

                $fileName = $formValues['filename'] . '_' . time() . '.zip';
                $path = tao_helpers_File::concat([$destination, $fileName]);
                if (!tao_helpers_File::securityCheck($path, true)) {
                    throw new Exception('Unauthorized file name');
                }

                $zipArchive = new ZipArchive();
                if ($zipArchive->open($path, ZipArchive::CREATE) !== true) {
                    throw new Exception('Unable to create archive at ' . $path);
                }

                $manifest = null;
                foreach ($instances as $instance) {
                    $item = new core_kernel_classes_Resource($instance);
                    if ($itemService->hasItemModel($item, [ItemModel::MODEL_URI])) {
                        $exporter = new QTIPackedItemExporter($item, $zipArchive, $manifest);

                        try {
                            $exporter->export(['apip' => true]);
                            $manifest = $exporter->getManifest();
                        } catch (\Exception $e) {
                            $report = Report::createFailure(
                                'Error to export item "' . $instance . '": ' . $e->getMessage()
                            );
                        }
                    }
                }

                $zipArchive->close();

                $subjectUri = isset($formValues['uri']) ? $formValues['uri'] : $formValues['classUri'];

                if ($path && $subjectUri) {
                    $report->setData($path);
                    $report->setMessage(__('Apip Package successfully exported.'));

                    $this->getEventManager()->trigger(
                        new QtiItemExportEvent(new core_kernel_classes_Resource($subjectUri))
                    );
                }
            }
        } else {
            $report = Report::createFailure('Missing filename for export using ' . __CLASS__);
        }

        return $report;
    }

    protected function getResourceService(): SecureResourceServiceInterface
    {
        return $this->getServiceManager()->get(SecureResourceServiceInterface::SERVICE_ID);
    }

    protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }
}
