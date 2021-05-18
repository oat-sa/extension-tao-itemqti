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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

use oat\generis\model\OntologyRdfs;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\Export\Extractor\MetaDataOntologyExtractor;

return new oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter([
    'fileSystem' => 'taoQtiItem',
    'fileLocation' => 'export' . DIRECTORY_SEPARATOR . 'export.csv',
    'extractors' =>  [
        'OntologyExtractor' => new \oat\taoQtiItem\model\flyExporter\extractor\OntologyExtractor(),
        'QtiExtractor' => new \oat\taoQtiItem\model\flyExporter\extractor\QtiExtractor(),
        'MetaDataOntologyExtractor' => new MetaDataOntologyExtractor(),
    ],
    'columns' =>  [
        'label' =>  [
            'extractor' => 'OntologyExtractor',
            'parameters' =>  [
                'property' => OntologyRdfs::RDFS_LABEL
            ]
        ],
        'type' =>  [
            'extractor' => 'QtiExtractor',
            'parameters' =>  [
                'callback' => 'getInteractionType'
            ]
        ],
        'nb choice' =>  [
            'extractor' => 'QtiExtractor',
            'parameters' =>  [
                'callback' => 'getNumberOfChoices'
            ]
        ],
        'responseIdentifier' =>  [
            'extractor' => 'QtiExtractor',
            'parameters' =>  [
                'callback' => 'getResponseIdentifier',
            ]
        ],
        'BR' =>  [
            'extractor' => 'QtiExtractor',
            'parameters' => [
                'callback' => 'getRightAnswer',
                'callbackParameters' => [
                    'delimiter' => '|',
                ],
                'valuesAsColumns' => true
            ]
        ],
        'choiceInteraction' =>  [
            'extractor' => 'QtiExtractor',
            'parameters' =>  [
                'callback' => 'getChoices',
                'valuesAsColumns' => true,
            ]
        ],
        'metadataProperties' => [
            'extractor' => 'MetaDataOntologyExtractor',
            'parameters' => [
                'valuesAsColumns' => true,
                'excludedProperties' => [
                    taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT,
                    taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL,
                    taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT_SRC,
                    TaoOntology::PROPERTY_LOCK,
                ],
            ]
        ],
    ]
]);
