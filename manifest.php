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
use oat\taoQtiItem\model\qti\CustomInteractionAsset\ServiceProvider\CustomInteractionAssetExtractorAllocatorServiceProvider;
use oat\taoQtiItem\model\qti\ServiceProvider\ItemIdentifierValidatorServiceProvider;
use oat\taoQtiItem\scripts\install\InitMetadataService;
use oat\taoQtiItem\scripts\install\ItemEventRegister;
use oat\taoQtiItem\scripts\install\RegisterItemCompilerBlacklist;
use oat\taoQtiItem\scripts\install\RegisterLegacyPortableLibraries;
use oat\taoQtiItem\scripts\install\RegisterNpmPaths;
use oat\taoQtiItem\scripts\install\SetItemModel;
use oat\taoQtiItem\scripts\install\SetQtiCreatorConfig;
use oat\taoQtiItem\scripts\install\SetUpQueueTasks;
use oat\taoQtiItem\scripts\update\Updater;
use oat\taoItems\model\user\TaoItemsRoles;
use oat\tao\model\accessControl\func\AccessRule;

$extpath = __DIR__ . DIRECTORY_SEPARATOR;
$taopath = dirname(__FILE__, 2) . DIRECTORY_SEPARATOR . 'tao' . DIRECTORY_SEPARATOR;

return [
    'name'        => 'taoQtiItem',
    'label'       => 'QTI item model',
    'license'     => 'GPL-2.0',
    'author'      => 'Open Assessment Technologies',
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
        [
            AccessRule::GRANT,
            'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole',
            ['ext' => 'taoQtiItem']
        ],
        [
            AccessRule::GRANT,
            TaoRoles::DELIVERY,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiItemRunner']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_AUTHOR_ABSTRACT,
            QtiPreview::class
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_AUTHOR_ABSTRACT,
            QtiCreator::class
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_AUTHOR_ABSTRACT,
            QtiCssAuthoring::class
        ],
        [
            AccessRule::GRANT,
            TaoRoles::REST_PUBLISHER,
            ['ext' => 'taoQtiItem', 'mod' => 'RestQtiItem']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_CONTENT_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'index']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_CONTENT_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'saveItem']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_CONTENT_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'getItemData']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_CONTENT_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'getFile']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_CONTENT_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'getMediaSources']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_CONTENT_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCssAuthoring', 'act' => 'load']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_CONTENT_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCssAuthoring', 'act' => 'save']
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_RESOURCE_CREATOR,
            ['ext' => 'taoQtiItem', 'mod' => 'QtiCreator', 'act' => 'createItem'],
        ],
        [
            AccessRule::GRANT,
            TaoItemsRoles::ITEM_IMPORTER,
            ['ext' => 'taoQtiItem', 'mod' => 'ItemImportSampleDownload', 'act' => 'downloadTemplate'],
        ],
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
    ],
    'containerServiceProviders' => [
        CustomInteractionAssetExtractorAllocatorServiceProvider::class,
        ItemIdentifierValidatorServiceProvider::class
    ],
];
