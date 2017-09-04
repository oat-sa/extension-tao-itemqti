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

use oat\tao\model\TaskQueueActionTrait;
use oat\oatbox\task\Task;

/**
 * Class AbstractRestQti
 * @package oat\taoQtiItem\controller
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
abstract class AbstractRestQti extends \tao_actions_RestController
{
    use TaskQueueActionTrait {
        getTask as parentGetTask;
        getTaskData as traitGetTaskData;
    }

    const TASK_ID_PARAM = 'id';

    protected static $accepted_types = array(
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    );

    /**
     * Action to retrieve test import status from queue
     */
    public function getStatus()
    {
        try {
            if (!$this->hasRequestParameter(self::TASK_ID_PARAM)) {
                throw new \common_exception_MissingParameter(self::TASK_ID_PARAM, $this->getRequestURI());
            }
            $data = $this->getTaskData($this->getRequestParameter(self::TASK_ID_PARAM));
            $this->returnSuccess($data);
        } catch (\Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * @param Task $taskId
     * @return Task
     * @throws \common_exception_BadRequest
     */
    protected function getTask($taskId)
    {
        $task = $this->parentGetTask($taskId);
        if ($task->getInvocable() !== static::IMPORT_TASK_CLASS) {
            throw new \common_exception_BadRequest("Wrong task type");
        }
        return $task;
    }

    /**
     * @param Task $task
     * @return string
     */
    protected function getTaskStatus(Task $task)
    {
        $report = $task->getReport();
        if (in_array(
            $task->getStatus(),
            [Task::STATUS_CREATED, Task::STATUS_RUNNING, Task::STATUS_STARTED])
        ) {
            $result = 'In Progress';
        } else if ($report) {
            $report = \common_report_Report::jsonUnserialize($report);
            $plainReport = $this->getPlainReport($report);
            $success = true;
            foreach ($plainReport as $r) {
                $success = $success && $r->getType() != \common_report_Report::TYPE_ERROR;
            }
            $result = $success ? 'Success' : 'Failed';
        }
        return $result;
    }

    /**
     * @param Task $task
     * @return array
     */
    protected function getTaskReport(Task $task)
    {
        $report = \common_report_Report::jsonUnserialize($task->getReport());
        $result = [];
        if ($report) {
            $plainReport = $this->getPlainReport($report);
            foreach ($plainReport as $r) {
                $result[] = [
                    'type' => $r->getType(),
                    'message' => $r->getMessage(),
                ];
            }
        }
        return $result;
    }
}
