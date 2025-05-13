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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\scripts\install;

use Exception;
use oat\oatbox\action\Action;
use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\QtiCreator\Scales\RemoteScaleListService;

class CreateRemoteScaleList extends ScriptAction
{
    protected function provideOptions(): array
    {
        return [
            'label-path' => [
                'prefix' => 'l',
                'longPrefix' => 'label-path',
                'description' => 'Path to the label in the remote scale list',
                'default' => '$[*].label'
            ],
            'uri-path' => [
                'prefix' => 'u',
                'longPrefix' => 'uri-path',
                'description' => 'Path to the URI in the remote scale list',
                'default' => '$[*].uri'
            ]
        ];
    }

    protected function provideDescription(): string
    {
        return 'Create a remote scale list in the ontology';
    }

    protected function run(): Report
    {
        $labelPath = $this->getOption('label-path') ?? '$[*].label';
        $uriPath = $this->getOption('uri-path') ?? '$[*].uri';

        try {
            $this->getRemoteScaleListService()->create($labelPath, $uriPath);
        } catch (Exception $e) {
            return new Report(
                Report::TYPE_ERROR,
                'Failed to create remote scale list',
            );
        }
        return new Report(
            Report::TYPE_SUCCESS,
            'Remote scale list created successfully',
        );
    }

    private function getRemoteScaleListService(): RemoteScaleListService
    {
        return $this->getServiceManager()->getContainer()->get(RemoteScaleListService::class);
    }
}
