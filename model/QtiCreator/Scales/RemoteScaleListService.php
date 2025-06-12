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

namespace oat\taoQtiItem\model\QtiCreator\Scales;

use core_kernel_classes_Class;
use core_kernel_persistence_Exception;
use oat\generis\model\data\Ontology;
use oat\oatbox\log\LoggerService;
use oat\tao\model\Lists\Business\Service\RemoteSourcedListOntology;
use oat\taoBackOffice\model\lists\RemoteListService;
use RuntimeException;
use Throwable;

class RemoteScaleListService
{
    public const SCALES_URI = 'http://www.tao.lu/Ontologies/TAO.rdf#Scales';
    public const REMOTE_LIST_SCALE = 'REMOTE_LIST_SCALE';
    private const DEFAULT_URI_PATH = '$[*].uri';
    private const DEFAULT_LABEL_PATH = '$[*].label';
    private Ontology $ontology;
    private ?string $remoteListScaleUrl;
    private RemoteListService $remoteListService;
    private LoggerService $loggerService;

    public function __construct(
        Ontology $ontology,
        RemoteListService $remoteListService,
        LoggerService $loggerService,
        ?string $remoteListScaleUrl = ''
    ) {
        $this->ontology = $ontology;
        $this->remoteListScaleUrl = $remoteListScaleUrl;
        $this->remoteListService = $remoteListService;
        $this->loggerService = $loggerService;
    }

    public function create(string $labelPath, string $uriPath): void
    {
        $remoteListClass = $this->ontology->getClass(self::SCALES_URI);
        $remoteListClass->setPropertyValue(
            $remoteListClass->getProperty(RemoteSourcedListOntology::PROPERTY_LIST_TYPE),
            RemoteSourcedListOntology::LIST_TYPE_REMOTE
        );

        $remoteListClass->setPropertyValue(
            $remoteListClass->getProperty(RemoteSourcedListOntology::PROPERTY_SOURCE_URI),
            $this->remoteListScaleUrl
        );

        $remoteListClass->setPropertyValue(
            $remoteListClass->getProperty(RemoteSourcedListOntology::PROPERTY_ITEM_LABEL_PATH),
            $labelPath
        );

        $remoteListClass->setPropertyValue(
            $remoteListClass->getProperty(RemoteSourcedListOntology::PROPERTY_ITEM_URI_PATH),
            $uriPath
        );
    }

    /**
     * Check if the remote list functionality is enabled for scales
     *
     * @return bool True if remote list functionality is enabled and properly configured
     */
    public function isRemoteListEnabled(): bool
    {
        if (empty($this->remoteListScaleUrl)) {
            $this->loggerService->debug('Remote list scale URL is not configured');
            return false;
        }

        try {
            $scalesList = $this->ontology->getClass(self::SCALES_URI);

            $hasRequiredProperties = $this->hasRequiredRemoteListProperties($scalesList);

            if (!$hasRequiredProperties) {
                return $this->setupRemoteList($scalesList);
            }

            return true;
        } catch (Throwable $e) {
            $this->loggerService->error(
                sprintf('Error checking remote list enabled status: %s', $e->getMessage()),
                ['exception' => $e]
            );
            return false;
        }
    }

    /**
     * Check if the scales list has the required remote list properties
     *
     * @param core_kernel_classes_Class $scalesList The scales list class
     * @return bool True if all required properties exist
     * @throws core_kernel_persistence_Exception
     */
    private function hasRequiredRemoteListProperties(core_kernel_classes_Class $scalesList): bool
    {
        $remoteListProperty = $scalesList->getOnePropertyValue(
            $scalesList->getProperty(RemoteSourcedListOntology::LIST_TYPE_REMOTE)
        );

        $remoteScaleListUri = $scalesList->getOnePropertyValue(
            $scalesList->getProperty(RemoteSourcedListOntology::PROPERTY_DEPENDENCY_ITEM_URI_PATH)
        );

        return $remoteListProperty !== null && $remoteScaleListUri !== null;
    }

    /**
     * Set up the remote list with default values
     *
     * @param core_kernel_classes_Class $scalesList The scales list class
     * @return bool True if setup was successful
     */
    private function setupRemoteList(core_kernel_classes_Class $scalesList): bool
    {
        try {
            $this->create(self::DEFAULT_LABEL_PATH, self::DEFAULT_URI_PATH);

            $this->remoteListService->sync($scalesList, false);

            $this->loggerService->info('Successfully set up remote list for scales');
            return true;
        } catch (RuntimeException $e) {
            $this->loggerService->warning(
                sprintf('Could not sync remote list scale: %s', $e->getMessage())
            );
            return false;
        } catch (Throwable $e) {
            $this->loggerService->error(
                sprintf('Unexpected error setting up remote list: %s', $e->getMessage()),
                ['exception' => $e]
            );
            return false;
        }
    }
}
