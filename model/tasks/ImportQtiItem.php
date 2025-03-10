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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\model\tasks;

use oat\oatbox\task\AbstractTaskAction;
use oat\tao\model\TaoOntology;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\tao\model\taskQueue\Task\TaskInterface;
use oat\taoQtiItem\model\qti\ImportService;
use Zend\ServiceManager\ServiceLocatorInterface;

/**
 * Class ImportQtiItem
 * @package oat\taoQtiTest\models\tasks
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class ImportQtiItem extends AbstractTaskAction implements \JsonSerializable
{
    public const FILE_DIR = 'ImportQtiItemTask';
    public const PARAM_CLASS_URI = 'class_uri';
    public const PARAM_FILE = 'file';
    public const PARAM_GUARDIANS = 'enableMetadataGuardians';
    public const PARAM_VALIDATORS = 'enableMetadataValidators';
    public const PARAM_ITEM_MUST_EXIST = 'itemMustExist';
    public const PARAM_ITEM_MUST_BE_OVERWRITTEN = 'itemMustBeOverwritten';
    public const PARAM_ITEM_METADATA = 'importMetadata';

    protected $service;

    /**
     * @param $params
     * @throws \common_exception_MissingParameter
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        if (!isset($params[self::PARAM_FILE])) {
            throw new \common_exception_MissingParameter(
                'Missing parameter `' . self::PARAM_FILE . '` in ' . self::class
            );
        }

        $file = $this->getFileReferenceSerializer()->unserializeFile($params['file']);

        return ImportService::singleton()->importQTIPACKFile(
            $file,
            $this->getClass($params),
            true,
            true,
            true,
            // Continue to support old tasks in the queue
            (isset($params[self::PARAM_GUARDIANS])) ? $params[self::PARAM_GUARDIANS] : true,
            (isset($params[self::PARAM_VALIDATORS])) ? $params[self::PARAM_VALIDATORS] : true,
            (isset($params[self::PARAM_ITEM_MUST_EXIST])) ? $params[self::PARAM_ITEM_MUST_EXIST] : false,
            $params[self::PARAM_ITEM_MUST_BE_OVERWRITTEN] ?? false,
            $params[self::PARAM_ITEM_METADATA] ?? false
        );
    }

    /**
     * @return string
     */
    public function jsonSerialize()
    {
        return __CLASS__;
    }

    /**
     * Create task in queue
     *
     * @param string                     $packageFile uploaded file path
     * @param \core_kernel_classes_Class $class       uploaded file
     * @param ServiceLocatorInterface    $serviceManager
     * @param boolean                    $enableMetadataGuardians
     * @param boolean                    $enableMetadataValidators
     * @param boolean                    $itemMustExist
     * @param boolean                    $itemMustBeOverwritten
     * @return TaskInterface
     */
    public static function createTask(
        $packageFile,
        \core_kernel_classes_Class $class,
        ServiceLocatorInterface $serviceManager,
        $enableMetadataGuardians = true,
        $enableMetadataValidators = true,
        $itemMustExist = false,
        $itemMustBeOverwritten = false,
        $itemMetadata = false
    ) {
        $action = new self();
        $action->setServiceLocator($serviceManager);

        $fileUri = $action->saveFile($packageFile, basename($packageFile));

        /** @var QueueDispatcherInterface $queueDispatcher */
        $queueDispatcher = $serviceManager->get(QueueDispatcherInterface::SERVICE_ID);

        return $queueDispatcher->createTask(
            $action,
            [
                self::PARAM_FILE => $fileUri,
                self::PARAM_CLASS_URI => $class->getUri(),
                self::PARAM_GUARDIANS => $enableMetadataGuardians,
                self::PARAM_VALIDATORS => $enableMetadataValidators,
                self::PARAM_ITEM_MUST_EXIST => $itemMustExist,
                self::PARAM_ITEM_MUST_BE_OVERWRITTEN => $itemMustBeOverwritten,
                self::PARAM_ITEM_METADATA => $itemMetadata
            ],
            __('Import QTI ITEM into "%s"', $class->getLabel())
        );
    }

    /**
     * @param array $taskParams
     * @return \core_kernel_classes_Class
     */
    private function getClass(array $taskParams)
    {
        $class = null;
        if (isset($taskParams[self::PARAM_CLASS_URI])) {
            $class = new \core_kernel_classes_Class($taskParams[self::PARAM_CLASS_URI]);
        }
        if ($class === null || !$class->exists()) {
            $class = new \core_kernel_classes_Class(TaoOntology::ITEM_CLASS_URI);
        }
        return $class;
    }
}
