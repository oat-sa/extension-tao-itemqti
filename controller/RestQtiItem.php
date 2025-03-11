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
 * Copyright (c) 2017-2025 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\controller;

use oat\tao\model\TaoOntology;
use oat\tao\model\taskQueue\TaskLog\Entity\EntityInterface;
use oat\tao\model\taskQueue\TaskLogInterface;
use Request;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\ItemModel;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\reporting\ReportInterface;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\taoQtiItem\model\Export\QTIPackedItemExporter;
use oat\taoQtiItem\model\tasks\ImportQtiItem;
use helpers_TimeOutHelper;
use tao_helpers_Http;
use tao_helpers_File;
use ZipArchive;
use tao_helpers_Export;
use common_report_Report;
use core_kernel_classes_Class;
use common_exception_NotImplemented;
use taoItems_models_classes_ItemsService;
use common_Exception;
use common_exception_BadRequest;
use common_exception_ClassAlreadyExists;
use common_exception_NotFound;
use Exception;
use common_exception_MissingParameter;

/**
 * End point of Rest item API
 *
 * @author Absar Gilani, <absar.gilani6@gmail.com>
 * @author Gyula Szucs <gyula@taotesting.com>
 */
class RestQtiItem extends AbstractRestQti
{
    use OntologyAwareTrait;

    public const RESTITEM_PACKAGE_NAME = 'content';

    /**
     * @inherit
     */
    protected function getAcceptableMimeTypes(): array
    {
        return
            [
                "application/json",
                "text/xml",
                "application/xml",
                "application/rdf+xml" ,
                "application/zip",
            ];
    }

    /**
     * Class items will be created in
     */
    protected function getDestinationClass(): core_kernel_classes_Class
    {
        return $this->getClassFromRequest($this->getClass(TaoOntology::CLASS_URI_ITEM));
    }

    /**
     * Only import method is available, so index return failure response
     */
    public function index(): void
    {
        $this->returnFailure(new common_exception_NotImplemented('This API does not support this call.'));
    }

    /**
     * Import file entry point by using $this->service
     * Check POST method & get valid uploaded file
     */
    public function import(): void
    {
        try {
            if ($this->getRequestMethod() != Request::HTTP_POST) {
                throw new common_exception_NotImplemented('Only post method is accepted to import Qti package.');
            }

            // Get valid package parameter
            $package = $this->getUploadedPackage();

            // Call service to import package
            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);
            $report = ImportService::singleton()->importQTIPACKFile(
                $package,
                $this->getDestinationClass(),
                true,
                true,
                true,
                $this->isMetadataGuardiansEnabled(),
                $this->isMetadataValidatorsEnabled(),
                $this->isItemMustExistEnabled(),
                $this->isItemMustBeOverwrittenEnabled(),
                $this->isMetadataRequired()
            );
            helpers_TimeOutHelper::reset();

            tao_helpers_File::remove($package);
            if ($report->getType() !== ReportInterface::TYPE_SUCCESS) {
                $message = __("An unexpected error occurred during the import of the IMS QTI Item Package. ");
                //get message of first error report
                if (!empty($report->getErrors())) {
                    $message .= $report->getErrors()[0]->getMessage();
                }
                $this->returnFailure(new common_Exception($message));
            } else {
                $itemIds = [];
                /** @var common_report_Report $subReport */
                foreach ($report as $subReport) {
                    $itemIds[] = $subReport->getData()->getUri();
                }
                $this->setSuccessJsonResponse(['items' => $itemIds]);
            }
        } catch (ExtractException $e) {
            $this->returnFailure(
                new common_Exception(
                    __('The ZIP archive containing the IMS QTI Item cannot be extracted.')
                )
            );
        } catch (ParsingException $e) {
            $this->returnFailure(
                new common_Exception(
                    __('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.')
                )
            );
        } catch (Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * @inheritdoc
     */
    protected function getTaskName(): string
    {
        return ImportQtiItem::class;
    }

    /**
     * Import item package through the task queue.
     */
    public function importDeferred(): void
    {
        try {
            if ($this->getRequestMethod() != Request::HTTP_POST) {
                throw new common_exception_NotImplemented('Only post method is accepted to import Qti package.');
            }

            $task = ImportQtiItem::createTask(
                $this->getUploadedPackage(),
                $this->getDestinationClass(),
                $this->getServiceLocator(),
                $this->isMetadataGuardiansEnabled(),
                $this->isMetadataValidatorsEnabled(),
                $this->isItemMustExistEnabled(),
                $this->isItemMustBeOverwrittenEnabled(),
                $this->isMetadataRequired()
            );

            $result = [
                'reference_id' => $task->getId()
            ];

            /** @var TaskLogInterface $taskLog */
            $taskLog = $this->getServiceManager()->get(TaskLogInterface::SERVICE_ID);

            if ($report = $taskLog->getReport($task->getId())) {
                $result['report'] = $report->toArray();
            }

            $this->setSuccessJsonResponse($result);
        } catch (Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * Add extra values to the JSON returned.
     *
     * @param EntityInterface $taskLogEntity
     */
    protected function addExtraReturnData(EntityInterface $taskLogEntity): array
    {
        $data = [];

        if ($taskLogEntity->getReport()) {
            $plainReport = $this->getPlainReport($taskLogEntity->getReport());

            //the third report is report of import test
            $itemsReport = array_slice($plainReport, 2);
            foreach ($itemsReport as $itemReport) {
                if (isset($itemReport->getData()['uriResource'])) {
                    $data['itemIds'][] = $itemReport->getData()['uriResource'];
                }
            }
        }

        return $data;
    }

    /**
     * Return a valid uploaded file
     */
    protected function getUploadedPackage(): string
    {
        if (!$this->getQueryParams(self::RESTITEM_PACKAGE_NAME)) {
            throw new common_exception_MissingParameter(self::RESTITEM_PACKAGE_NAME, __CLASS__);
        }

        $file = tao_helpers_Http::getUploadedFile(self::RESTITEM_PACKAGE_NAME);

        if (!in_array($file['type'], self::$accepted_types)) {
            throw new common_exception_BadRequest('Uploaded file has to be a valid archive.');
        }

        $pathinfo = pathinfo($file['tmp_name']);
        $destination = $pathinfo['dirname'] . DIRECTORY_SEPARATOR . $file['name'];
        tao_helpers_File::move($file['tmp_name'], $destination);

        return $destination;
    }

    /**
     * Create an empty item
     */
    public function createQtiItem(): void
    {
        try {
            // Check if it's post method
            if ($this->getRequestMethod() != Request::HTTP_POST) {
                throw new common_exception_NotImplemented('Only post method is accepted to create empty item.');
            }

            $label = $this->getQueryParams('label') ?? '';
            // Call service to import package
            $item = $this->getDestinationClass()->createInstance($label);

            /** @var taoItems_models_classes_ItemsService $itemService */
            $itemService = $this->getServiceLocator()->get(taoItems_models_classes_ItemsService::class);
            $itemService->setItemModel($item, $this->getResource(ItemModel::MODEL_URI));

            $this->setSuccessJsonResponse($item->getUri());
        } catch (Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * render an item as a Qti zip package
     * @author christophe GARCIA <christopheg@taotesting.com>
     */
    public function export()
    {

        try {
            if ($this->getRequestMethod() != Request::HTTP_GET) {
                throw new common_exception_NotImplemented('Only GET method is accepted to export QIT Item.');
            }

            if (!$this->getQueryParams('id')) {
                $this->returnFailure(new common_exception_MissingParameter('required parameter `id` is missing'));
            }

            $id = $this->getQueryParams('id');

            $item = $this->getResource($id);

            /** @var taoItems_models_classes_ItemsService $itemService */
            $itemService = $this->getServiceLocator()->get(taoItems_models_classes_ItemsService::class);

            if ($itemService->hasItemModel($item, [ItemModel::MODEL_URI])) {
                $path = tao_helpers_Export::getExportFile();
                $tmpZip = new ZipArchive();
                $tmpZip->open($path, ZipArchive::CREATE);

                $exporter = new QTIPackedItemExporter($item, $tmpZip);
                $exporter->export(['apip' => false]);

                $exporter->getZip()->close();

                header('Content-Type: application/zip');
                tao_helpers_Http::returnFile($path, false);

                return;
            } else {
                $this->returnFailure(new common_exception_NotFound('item can\'t be found'));
            }
        } catch (Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * Create an Item Class
     *
     * Label parameter is mandatory
     * If parent class parameter is an uri of valid test class, new class will be created under it
     * If not parent class parameter is provided, class will be created under root class
     * Comment parameter is not mandatory, used to describe new created class
     *
     */
    public function createClass(): void
    {
        try {
            $class = $this->createSubClass($this->getClass(TaoOntology::CLASS_URI_ITEM));

            $result = [
                'message' => __('Class successfully created.'),
                'class-uri' => $class->getUri(),
            ];

            $this->setSuccessJsonResponse($result);
        } catch (common_exception_ClassAlreadyExists $e) {
            $result = [
                'message' => $e->getMessage(),
                'class-uri' => $e->getClass()->getUri(),
            ];
            $this->setSuccessJsonResponse($result);
        } catch (\Exception $e) {
            $this->returnFailure($e);
        }
    }
}
