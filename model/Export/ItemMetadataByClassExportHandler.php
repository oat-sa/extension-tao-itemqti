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

use common_report_Report as Report;
use core_kernel_classes_Resource;
use oat\generis\model\fileReference\UrlFileSerializer;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;
use oat\taoQtiItem\model\ItemModel;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class ItemMetadataByClassExportHandler implements \tao_models_classes_export_ExportHandler, PhpSerializable, ServiceLocatorAwareInterface
{
    use OntologyAwareTrait, PhpSerializeStateless, ServiceLocatorAwareTrait;

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
     * @param array $formValues
     * @param string $destination
     * @return \common_report_Report|File
     * @throws \Exception
     * @throws \common_exception_BadRequest
     */
    public function export($formValues, $destination)
    {
        $report = Report::createInfo();

        if (isset($formValues['filename']) && isset($formValues['classUri'])) {
            $classToExport = $this->getClassToExport($formValues['classUri']);

            if ($classToExport->exists()) {
                try {
                    $fileName = $formValues['filename'].'_'.time().'.csv';
                    if(!\tao_helpers_File::securityCheck($fileName, true)){
                        throw new \Exception('Unauthorized file name');
                    }

                    /** @var ItemExporter $exporterService */
                    $exporterService = $this->getServiceLocator()->get(SimpleExporter::SERVICE_ID);
                    $exporterService->setOption(SimpleExporter::OPTION_FILE_LOCATION, 'metadataExport/'. $fileName);

                    $file = $exporterService->export($this->getInstances($classToExport), true);

                    $uriSerializer = new UrlFileSerializer();
                    $uriSerializer->setServiceLocator($this->getServiceLocator());

                    $serial = $uriSerializer->serialize($file);

                    $report->setData($serial);
                    $report->setType(Report::TYPE_SUCCESS);
                    $report->setMessage(__('Metadata are successfully exported.'));
                } catch (ExtractorException $e) {
                    $report = Report::createFailure('Selected object does not have any item to export.');
                }
            }
        } else {
            if (!isset($formValues['filename'])) {
                $report->add(Report::createFailure('Missing filename for export using ' . __CLASS__));
            }

            if (!isset($formValues['classUri'])) {
                $report->add(Report::createFailure('Missing classUri for export using ' . __CLASS__));
            }
        }

        return $report;
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
}