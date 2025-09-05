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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\Export;

use common_exception_Error;
use common_report_Report as Report;
use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use DomDocument;
use Exception;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\filesystem\FilesystemException;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\resources\SecureResourceServiceInterface;
use oat\taoQtiItem\model\event\QtiItemExportEvent;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use tao_helpers_File;
use tao_models_classes_export_ExportHandler;
use taoItems_models_classes_ItemsService;
use ZipArchive;

/**
 * Short description of class oat\taoQtiItem\model\ItemModel
 *
 * @access  public
 * @author  Joel Bout, <joel@taotesting.com>
 * @package taoQTI
 */
class QtiPackageExportHandler implements tao_models_classes_export_ExportHandler, PhpSerializable
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;

    /**
     * @var MetadataExporter Service to export metadata to IMSManifest
     */
    protected $metadataExporter;

    /**
     * @return string
     */
    public function getLabel()
    {
        return __('QTI Package 2.1');
    }

    /**
     * @param core_kernel_classes_Resource $resource
     * @return \tao_helpers_form_Form
     */
    public function getExportForm(core_kernel_classes_Resource $resource)
    {
        $formData = $this->getFormData($resource);

        return (new Qti21ExportForm($formData))->getForm();
    }

    /**
     * @param array  $formValues
     * @param string $destination
     * @return Report
     * @throws common_exception_Error
     */
    public function export($formValues, $destination)
    {
        if (!isset($formValues['filename'])) {
            return Report::createFailure('Missing filename for export using ' . __CLASS__);
        }

        if (!isset($formValues['instances'])) {
            return Report::createFailure('No instances selected for export using ' . __CLASS__);
        }

        $report = Report::createSuccess();

        if (count($formValues['instances']) > 0) {
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
            foreach ($formValues['instances'] as $instance) {
                $item = new core_kernel_classes_Resource($instance);
                if ($itemService->hasItemModel($item, [ItemModel::MODEL_URI])) {
                    $exporter = $this->createExporter($item, $zipArchive, $manifest);
                    try {
                        $subReport = $exporter->export();
                        $manifest = $exporter->getManifest();

                        $report->add($subReport);
                    } catch (FilesystemException $e) {
                        $report->add(Report::createFailure(__('Item "%s" has no xml document', $item->getLabel())));
                    } catch (Exception $e) {
                        $report->add(
                            Report::createFailure(__('Error to export item %s: %s', $instance, $e->getMessage()))
                        );
                    }
                }
            }

            $zipArchive->close();
            $report->setData($path);
            $report->setMessage(__('Resource(s) successfully exported.'));

            $subjectUri = isset($formValues['uri']) ? $formValues['uri'] : $formValues['classUri'];

            if (!$report->containsError() && $subjectUri) {
                $this->getEventManager()->trigger(
                    new QtiItemExportEvent(new core_kernel_classes_Resource($subjectUri))
                );
            }
        }

        return $report;
    }

    protected function getFormData(core_kernel_classes_Resource $resource): array
    {
        $formData = [];

        if ($resource instanceof core_kernel_classes_Class) {
            $formData['items'] = $this->getResourceService()->getAllChildren($resource);
            $formData['file_name'] = $resource->getLabel();
        } else {
            $formData['instance'] = $resource;
        }

        return $formData;
    }

    protected function createExporter($item, ZipArchive $zipArchive, DOMDocument $manifest = null)
    {
        return new QTIPackedItemExporter($item, $zipArchive, $manifest);
    }

    /**
     * Get the service to export Metadata
     *
     * @return MetadataExporter
     */
    protected function getMetadataExporter()
    {
        if (!$this->metadataExporter) {
            $this->metadataExporter = $this->getServiceManager()->get(MetadataService::SERVICE_ID)->getExporter();
        }

        return $this->metadataExporter;
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
