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

use oat\generis\model\data\Ontology;
use oat\oatbox\log\LoggerService;
use oat\tao\model\Lists\Business\Service\RemoteSourcedListOntology;
use oat\taoBackOffice\model\lists\RemoteListService;
use RuntimeException;

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
        Ontology          $ontology,
        RemoteListService $remoteListService,
        LoggerService     $loggerService,
        ?string           $remoteListScaleUrl = ''
    )
    {
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

    public function isRemoteListEnabled(): bool
    {
        if ($this->remoteListScaleUrl === null || $this->remoteListScaleUrl === '') {
            return false;
        }

        $scalesList = $this->ontology->getClass(self::SCALES_URI);
        $remoteListProperty = $scalesList->getOnePropertyValue(
            $scalesList->getProperty(RemoteSourcedListOntology::LIST_TYPE_REMOTE)
        );

        $remoteScaleListUri = $scalesList->getOnePropertyValue(
            $scalesList->getProperty(RemoteSourcedListOntology::PROPERTY_DEPENDENCY_ITEM_URI_PATH)
        );

        if ($remoteListProperty === null && $remoteScaleListUri === null) {
            try {
                $this->create(self::DEFAULT_LABEL_PATH, self::DEFAULT_URI_PATH);
                $this->remoteListService->sync($scalesList, false);
            } catch (RuntimeException $e) {
                $this->loggerService->warning(
                    sprintf(
                        'Could Not sync remote list scale: %s',
                        $e->getMessage()
                    )
                );
                return false;
            }
        }

        return true;
    }
}
