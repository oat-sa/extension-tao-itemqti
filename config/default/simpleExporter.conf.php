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

return new oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter(array(
    'fileSystem' => 'taoQtiItem',
    'fileLocation' => 'export' . DIRECTORY_SEPARATOR . 'export.csv',
    'extractors' => array (
        'OntologyExtractor' => new \oat\taoQtiItem\model\flyExporter\extractor\OntologyExtractor(),
        'QtiExtractor' => new \oat\taoQtiItem\model\flyExporter\extractor\QtiExtractor(),
        'MetaDataOntologyExtractor' => new MetaDataOntologyExtractor,
    ),
    'columns' => array (
        'label' => array (
            'extractor' => 'OntologyExtractor',
            'parameters' => array (
                'property' => OntologyRdfs::RDFS_LABEL
            )
        ),
        'type' => array (
            'extractor' => 'QtiExtractor',
            'parameters' => array (
                'callback' => 'getInteractionType'
            )
        ),
        'nb choice' => array (
            'extractor' => 'QtiExtractor',
            'parameters' => array (
                'callback' => 'getNumberOfChoices'
            )
        ),
        'responseIdentifier' => array (
            'extractor' => 'QtiExtractor',
            'parameters' => array (
                'callback' => 'getResponseIdentifier',
            )
        ),
        'BR' => array (
            'extractor' => 'QtiExtractor',
            'parameters' => array(
                'callback' => 'getRightAnswer',
                'callbackParameters' => array(
                    'delimiter' => '|',
                ),
                'valuesAsColumns' => true
            )
        ),
        'choiceInteraction' => array (
            'extractor' => 'QtiExtractor',
            'parameters' => array (
                'callback' => 'getChoices',
                'valuesAsColumns' => true,
            )
        ),
        'metadataProperties' => array(
            'extractor' => 'MetaDataOntologyExtractor',
            'parameters' => array(
                'valuesAsColumns' => true,
                'excludedProperties' => array(
                    taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT,
                    taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL,
                    taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT_SRC,
                    TaoOntology::PROPERTY_LOCK,
                ),
            )
        ),
    )
));