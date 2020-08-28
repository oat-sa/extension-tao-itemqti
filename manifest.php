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
 * Copyright (c) 2013-2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\tao\model\user\TaoRoles;
use oat\taoQtiItem\controller\QtiCreator;
use oat\taoQtiItem\controller\QtiCssAuthoring;
use oat\taoQtiItem\controller\QtiPreview;
use oat\taoQtiItem\install\scripts\addValidationSettings;
use oat\taoQtiItem\install\scripts\SetDragAndDropConfig;
use oat\taoQtiItem\install\scripts\setXMLParserConfig;
use oat\taoQtiItem\scripts\install\InitMetadataService;
use oat\taoQtiItem\scripts\install\ItemEventRegister;
use oat\taoQtiItem\scripts\install\RegisterItemCompilerBlacklist;
use oat\taoQtiItem\scripts\install\RegisterLegacyPortableLibraries;
use oat\taoQtiItem\scripts\install\RegisterNpmPaths;
use oat\taoQtiItem\scripts\install\SetItemModel;
use oat\taoQtiItem\scripts\install\SetQtiCreatorConfig;
use oat\taoQtiItem\scripts\install\SetUpQueueTasks;
use oat\taoQtiItem\scripts\update\Updater;

$extpath = __DIR__ . DIRECTORY_SEPARATOR;
$taopath = dirname(__FILE__, 2) . DIRECTORY_SEPARATOR . 'tao' . DIRECTORY_SEPARATOR;

return [
    'name'        => 'taoQtiItem',
    'label'       => 'QTI item model',
    'license'     => 'GPL-2.0',
    'version'     => '25.8.1',
    'author'      => 'Open Assessment Technologies',
    'requires' => [
        'taoItems' => '>=10.8.2',
        'tao'      => '>=45.2.0',
        'generis'  => '>=12.17.0',
    ],
    'models' => [
        'http://www.tao.lu/Ontologies/TAOItem.rdf'
    ],
    'install' => [
        'rdf' => [
            __DIR__ . '/install/ontology/taoQti.rdf',
            __DIR__ . '/install/ontology/qtiItemRunner.rdf'
        ],
        'checks' => [
            ['type' => 'CheckCustom', 'value' => ['id' => 'taoQtiItem_custom_mathjax', 'name' => 'mathjax', 'extension' => 'taoQtiItem', 'optional' => true]]
        ],
        'php' => [
            __DIR__ . '/install/local/setDefaultTheme.php',
            __DIR__ . '/install/local/addPortableContexts.php',
            __DIR__ . '/install/scripts/setQtiRunnerConfig.php',
            addValidationSettings::class,
            SetDragAndDropConfig::class,
            SetQtiCreatorConfig::class,
            ItemEventRegister::class,
            setXMLParserConfig::class,
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
        ]
    ],
    'update' => Updater::class,
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
        ['grant', TaoRoles::REST_PUBLISHER, ['ext' => 'taoQtiItem', 'mod' => 'RestQtiItem']],
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
        'structures' => __DIR__ . DIRECTORY_SEPARATOR . 'controller' . DIRECTORY_SEPARATOR . 'structures.xml',
    ]
];
