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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\Export;

use core_kernel_classes_Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\filesystem\File;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;
use oat\taoQtiItem\model\ItemModel;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;

class ItemMetadataByClassExportHandler implements \tao_models_classes_export_ExportHandler, PhpSerializable
{
    use OntologyAwareTrait, PhpSerializeStateless;

    /**
     * Get label form
     *
     * @return string
     */
    public function getLabel()
    {
        return __('QTI Metadata');
    }

    /**
     * Create MetadataExporterForm with class uri
     *
     * @param core_kernel_classes_Resource $resource
     * @return \tao_helpers_form_Form
     */
    public function getExportForm(core_kernel_classes_Resource $resource)
    {
        if ($resource instanceof \core_kernel_classes_Class) {
            $formData = array('class' => $resource);
        } else {
            $formData = array('class' => $this->getClass($resource));
        }
        $form = new MetadataExporterForm($formData);
        return $form->getForm();
    }

    /**
     * After form submitting, export data & output file
     *
     * @param array $formValues
     * @param string $destPath
     * @return \common_report_Report|void
     * @throws \common_Exception
     * @throws \common_exception_BadRequest
     */
    public function export($formValues, $destPath)
    {
        if (isset($formValues['filename']) && isset($formValues['classUri'])) {
            $classToExport = $this->getClassToExport($formValues['classUri']);

            if ($classToExport->exists()) {
                try {
                    /** @var ItemExporter $exporterService */
                    $exporterService = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
                    $this->output(
                        $exporterService->export($this->getInstances($classToExport), true),
                        $formValues['filename']
                    );
                } catch (ExtractorException $e) {
                    return \common_report_Report::createFailure('Selected object does not have any item to export.');
                }
            }
        }

        return;
    }

    protected function getInstances($classToExport)
    {
        $instances = array();
        $itemService = \taoItems_models_classes_ItemsService::singleton();
        foreach($classToExport->getInstances(true) as $item){
            if($itemService->hasItemModel($item, array(ItemModel::MODEL_URI))){
                $instances[] = $item;
            }
        }
        return $instances;
    }

    /**
     * @param File $file
     * @param string $exportFileName Name of the exported file
     * @throws \common_Exception
     */
    protected function output(File $file, $exportFileName)
    {
        header('Content-Disposition: attachment; filename="'. $exportFileName .'.csv"');
        \tao_helpers_Http::returnStream($file->readPsrStream(), $file->getMimeType());
    }

    /**
     * Get class to export, from resource uri or class uri
     * If parameter is null, check id http parameter
     *
     * @param null $uri
     * @return \core_kernel_classes_Class|mixed
     * @throws \common_exception_BadRequest
     */
    protected function getClassToExport($uri)
    {
        $resource = $this->getResource($uri);

        if ($resource->isClass()) {
            $classToExport = $this->getClass($uri);
        } else {
            $classToExport = reset($resource->getTypes());
        }

        return $classToExport;
    }

    /**
     * @return ServiceManager
     */
    protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }
}