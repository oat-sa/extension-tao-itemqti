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
 * Copyright (c) 2017-2022 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\controller;

use common_exception_MethodNotAllowed as HttpMethodNotAllowedException;
use common_exception_RestApi as BadRequestException;
use InvalidArgumentException;
use JsonException;
use oat\tao\model\http\HttpJsonResponseTrait;
use oat\tao\model\taskQueue\TaskLog\Entity\EntityInterface;
use oat\tao\model\taskQueue\TaskLogActionTrait;
use oat\taoQtiItem\model\presentation\web\UpdateMetadataRequestHandler;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use Request;
use RuntimeException;

/**
 * Class AbstractRestQti
 * @package oat\taoQtiItem\controller
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 * @author Gyula Szucs <gyula@taotesting.com>
 */
abstract class AbstractRestQti extends \tao_actions_RestController
{
    use TaskLogActionTrait;
    use HttpJsonResponseTrait;

    public const TASK_ID_PARAM = 'id';

    public const ENABLE_METADATA_GUARDIANS = 'enableMetadataGuardians';

    public const ENABLE_METADATA_VALIDATORS = 'enableMetadataValidators';

    public const ITEM_MUST_EXIST = 'itemMustExist';

    public const ITEM_MUST_BE_OVERWRITTEN = 'itemMustBeOverwritten';

    protected static $accepted_types = [
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    ];

    /**
     * Name of the task created by the child.
     *
     * @return string
     */
    abstract protected function getTaskName();

    /**
     * Action to retrieve test import status from queue
     */
    public function getStatus()
    {
        try {
            if (!$this->hasRequestParameter(self::TASK_ID_PARAM)) {
                throw new \common_exception_MissingParameter(self::TASK_ID_PARAM, $this->getRequestURI());
            }

            $data = $this->getTaskLogReturnData(
                $this->getRequestParameter(self::TASK_ID_PARAM),
                $this->getTaskName()
            );

            $this->returnSuccess($data);
        } catch (\Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * Return 'Success' instead of 'Completed', required by the specified API.
     *
     * @param EntityInterface $taskLogEntity
     * @return string
     */
    protected function getTaskStatus(EntityInterface $taskLogEntity)
    {
        if ($taskLogEntity->getStatus()->isCreated()) {
            return __('In Progress');
        } elseif ($taskLogEntity->getStatus()->isCompleted()) {
            return __('Success');
        }

        return $taskLogEntity->getStatus()->getLabel();
    }

    /**
     * @return bool
     * @throws \common_exception_RestApi
     */
    protected function isMetadataGuardiansEnabled()
    {
        $enableMetadataGuardians = $this->getRequestParameter(self::ENABLE_METADATA_GUARDIANS);

        if (is_null($enableMetadataGuardians)) {
            return true; // default value if parameter not passed
        }

        if (!in_array($enableMetadataGuardians, ['true', 'false'])) {
            throw new \common_exception_RestApi(
                self::ENABLE_METADATA_GUARDIANS . ' parameter should be boolean (true or false).'
            );
        }

        return filter_var($enableMetadataGuardians, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @return bool
     * @throws \common_exception_RestApi
     */
    protected function isMetadataValidatorsEnabled()
    {
        $enableMetadataValidators = $this->getRequestParameter(self::ENABLE_METADATA_VALIDATORS);

        if (is_null($enableMetadataValidators)) {
            return true; // default value if parameter not passed
        }

        if (!in_array($enableMetadataValidators, ['true', 'false'])) {
            throw new \common_exception_RestApi(
                self::ENABLE_METADATA_VALIDATORS . ' parameter should be boolean (true or false).'
            );
        }

        return filter_var($enableMetadataValidators, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @return bool
     * @throws \common_exception_RestApi
     */
    protected function isItemMustExistEnabled()
    {
        $itemMustExistEnabled = $this->getRequestParameter(self::ITEM_MUST_EXIST);

        if (is_null($itemMustExistEnabled)) {
            return false; // default value if parameter not passed
        }

        if (!in_array($itemMustExistEnabled, ['true', 'false'])) {
            throw new \common_exception_RestApi(
                self::ITEM_MUST_EXIST . ' parameter should be boolean (true or false).'
            );
        }

        return filter_var($itemMustExistEnabled, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @return bool
     * @throws \common_exception_RestApi
     */
    protected function isItemMustBeOverwrittenEnabled()
    {
        $isItemMustBeOverwrittenEnabled = $this->getRequestParameter(self::ITEM_MUST_BE_OVERWRITTEN);

        if (is_null($isItemMustBeOverwrittenEnabled)) {
            return false; // default value if parameter not passed
        }

        if (!in_array($isItemMustBeOverwrittenEnabled, ['true', 'false'])) {
            throw new \common_exception_RestApi(
                self::ITEM_MUST_BE_OVERWRITTEN . ' parameter should be boolean (true or false).'
            );
        }

        return filter_var($isItemMustBeOverwrittenEnabled, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Update metadata by parameters
     */
    public function updateMetadata(): void
    {
        if ($this->getRequestMethod() !== Request::HTTP_POST) {
            throw new HttpMethodNotAllowedException(null, 0, [Request::HTTP_POST]);
        }

        try {
            $metadataInput = $this->getUpdateMetadataRequestHandler()->handle(
                $this->getPsrRequest()
            );

            $resourceIdentifier = $metadataInput->getResource()->getUri();

            $this->getMetadataService()->getImporter()->setMetadataValues(
                [$resourceIdentifier => [$metadataInput->getMetadata()]]
            );

            $this->getMetadataService()->getImporter()->inject(
                $resourceIdentifier,
                $metadataInput->getResource()
            );
        } catch (JsonException | InvalidArgumentException $exception) {
            throw new BadRequestException($exception->getMessage(), 400);
        } catch (RuntimeException $exception) {
            throw new BadRequestException($exception->getMessage(), 422);
        }

        $this->setSuccessJsonResponse($metadataInput);
    }

    private function getUpdateMetadataRequestHandler(): UpdateMetadataRequestHandler
    {
        return $this->getPsrContainer()->get(UpdateMetadataRequestHandler::class);
    }

    private function getMetadataService(): MetadataService
    {
        return $this->getPsrContainer()->get(MetadataService::SERVICE_ID);
    }
}
