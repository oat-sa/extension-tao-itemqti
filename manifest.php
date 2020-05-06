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
 * Copyright (c) 2013-2019 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\taoQtiItem\controller\QtiPreview;
use oat\taoQtiItem\controller\QtiCreator;
use oat\taoQtiItem\controller\QtiCssAuthoring;
use oat\taoQtiItem\scripts\install\InitMetadataService;
use oat\taoQtiItem\scripts\install\RegisterLegacyPortableLibraries;
use oat\taoQtiItem\scripts\install\SetItemModel;
use oat\taoQtiItem\scripts\install\SetUpQueueTasks;
use oat\taoQtiItem\scripts\install\RegisterItemCompilerBlacklist;
use oat\taoQtiItem\scripts\install\RegisterNpmPaths;

$extpath = dirname(__FILE__) . DIRECTORY_SEPARATOR;
$taopath = dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'tao' . DIRECTORY_SEPARATOR;

return [
    'name'        => 'taoQtiItem',
    'label'       => 'QTI item model',
    'license'     => 'GPL-2.0',
    'version'     => '24.0.0',
    'author'      => 'Open Assessment Technologies',
    'requires' => [
        'taoItems' => '>=10.5.0',
        'tao'      => '>=41.6.0',
        'generis'  => '>=12.17.0',
    ],
    'models' => [
        'http://www.tao.lu/Ontologies/TAOItem.rdf'
    ],
    'install' => [
        'rdf' => [
            dirname(__FILE__) . '/install/ontology/taoQti.rdf',
            dirname(__FILE__) . '/install/ontology/qtiItemRunner.rdf'
        ],
        'checks' => [
            ['type' => 'CheckCustom', 'value' => ['id' => 'taoQtiItem_custom_mathjax', 'name' => 'mathjax', 'extension' => 'taoQtiItem', 'optional' => true]]
        ],
        'php' => [
            dirname(__FILE__) . '/install/local/setDefaultTheme.php',
            dirname(__FILE__) . '/install/local/addPortableContexts.php',
            dirname(__FILE__) . '/install/scripts/setQtiRunnerConfig.php',
            'oat\\taoQtiItem\\install\\scripts\\addValidationSettings',
            'oat\\taoQtiItem\\install\\scripts\\SetDragAndDropConfig',
            'oat\\taoQtiItem\\scripts\\install\\SetQtiCreatorConfig',
            'oat\\taoQtiItem\\scripts\\install\\ItemEventRegister',
            'oat\\taoQtiItem\\install\\scripts\\setXMLParserConfig',
            InitMetadataService::class,
            SetItemModel::class,
            RegisterLegacyPortableLibraries::class,
            SetUpQueueTasks::class,
            RegisterItemCompilerBlacklist::class,
            RegisterNpmPaths::class,
        ]
    ],
    'local' => [
        'php'   => [
            dirname(__FILE__) . '/install/local/addQTIExamples.php'
        ]
    ],
    'update' => 'oat\\taoQtiItem\\scripts\\update\\Updater',
    'routes' => [
        '/taoQtiItem' => 'oat\\taoQtiItem\\controller'
    ],
    'managementRole' => 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole',
    'acl' => [
        ['grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole', ['ext' => 'taoQtiItem']],
        ['grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', ['ext' => 'taoQtiItem', 'mod' => 'QtiItemRunner']],
        ['grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiPreview::class],
        ['grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiCreator::class],
        ['grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiCssAuthoring::class],
        ['grant', \oat\tao\model\user\TaoRoles::REST_PUBLISHER, ['ext' => 'taoQtiItem', 'mod' => 'RestQtiItem']],
    ],
    'constants' => [
        # views directory
        "DIR_VIEWS"             => $extpath . "views" . DIRECTORY_SEPARATOR,

        # default module name
        'DEFAULT_MODULE_NAME'   => 'Main',

        #default action name
        'DEFAULT_ACTION_NAME'   => 'index',

        #BASE PATH: the root path in the file system (usually the document root)
        'BASE_PATH'             => $extpath,

        #BASE URL (usually the domain root)
        'BASE_URL'              => ROOT_URL . 'taoQtiItem/',
    ],
    'extra' => [
        'structures' => dirname(__FILE__) . DIRECTORY_SEPARATOR . 'controller' . DIRECTORY_SEPARATOR . 'structures.xml',
    ]
];
