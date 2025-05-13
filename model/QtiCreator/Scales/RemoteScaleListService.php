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
use oat\tao\model\Lists\Business\Service\RemoteSourcedListOntology;
use RuntimeException;

class RemoteScaleListService
{
    private const SCALES_URI = 'http://www.tao.lu/Ontologies/TAO.rdf#Scales';
    private const PARENT_CLASS = 'http://www.tao.lu/Ontologies/TAO.rdf#List';
    public const REMOTE_LIST_SCALE = 'REMOTE_LIST_SCALE';
    private Ontology $ontology;
    private string $remoteListScaleUrl;

    public function __construct(Ontology $ontology, string $remoteListScaleUrl)
    {
        $this->ontology = $ontology;
        $this->remoteListScaleUrl = $remoteListScaleUrl;
    }

    public function create(string $labelPath, string $uriPath): void
    {
        if ($this->ontology->getResource(self::SCALES_URI)->exists()) {
            throw new RuntimeException(
                'The scale list already exists in the ontology. Please remove it before creating a new one.'
            );
        }

        $parentClass = $this->ontology->getClass(self::PARENT_CLASS);

        $remoteListClass = $parentClass->createSubClass('Scale', 'Scale', self::SCALES_URI);
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
}
