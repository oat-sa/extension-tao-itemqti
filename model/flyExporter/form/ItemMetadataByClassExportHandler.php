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

namespace oat\taoQtiItem\model\flyExporter\form;

use core_kernel_classes_Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;
use oat\taoQtiItem\model\ItemModel;

class ItemMetadataByClassExportHandler extends \tao_actions_CommonModule
    implements \tao_models_classes_export_ExportHandler
{
    use OntologyAwareTrait;

    /**
     * Get label form
     *
     * @return string
     */
    public function getLabel()
    {
        return 'item-metadata-export';
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
                    $file =  $exporterService->export($this->getInstances($classToExport), true);
                    return $this->output($file);
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
     * Output file with direct download with tao_helpers_export
     * Filename is extracted from form data
     *
     * @param File $file
     * @throws \common_Exception
     */
    protected function output(File $file)
    {
        $tmpFile = \tao_helpers_Export::getExportPath() . DIRECTORY_SEPARATOR . $file->getBasename();
        if (($resource = fopen($tmpFile, 'w')) === false) {
            throw new \common_Exception('Unable to write "' . $file->getPrefix() . '" into tmp folder("' . $tmpFile . '").');
        }
        stream_copy_to_stream($file->readStream(), $resource);
        fclose($resource);

        $filename = $this->hasRequestParameter('filename') ? $this->getRequestParameter('filename') . '.csv' : '';
        \tao_helpers_Export::outputFile($file->getBasename(), $filename);

        return;
    }

    /**
     * Get class to export, from resource uri or class uri
     * If parameter is null, check id http parameter
     *
     * @param null $uri
     * @return \core_kernel_classes_Class|mixed
     * @throws \common_exception_BadRequest
     */
    protected function getClassToExport($uri = null)
    {
        if (is_null($uri)) {
            if (! $this->hasRequestParameter('id')) {
                throw new \common_exception_BadRequest();
            }
            $uri = $this->getRequestParameter('id');
        }

        $resource = $this->getResource($uri);

        if ($resource->isClass()) {
            $classToExport = $this->getClass($uri);
        } else {
            $classToExport = reset($resource->getTypes());
        }

        return $classToExport;
    }

}