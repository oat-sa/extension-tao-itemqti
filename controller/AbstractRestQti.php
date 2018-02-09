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

namespace oat\taoQtiItem\controller;

use oat\taoTaskQueue\model\Entity\TaskLogEntity;
use oat\taoTaskQueue\model\TaskLogActionTrait;

/**
 * Class AbstractRestQti
 * @package oat\taoQtiItem\controller
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 * @author Gyula Szucs <gyula@taotesting.com>
 */
abstract class AbstractRestQti extends \tao_actions_RestController
{
    use TaskLogActionTrait;

    const TASK_ID_PARAM = 'id';

    protected static $accepted_types = array(
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    );

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
     * @param TaskLogEntity $taskLogEntity
     * @return string
     */
    protected function getTaskStatus(TaskLogEntity $taskLogEntity)
    {
        if ($taskLogEntity->getStatus()->isCreated()) {
            return __('In Progress');
        } else if ($taskLogEntity->getStatus()->isCompleted()){
            return __('Success');
        }

        return $taskLogEntity->getStatus()->getLabel();
    }
}
