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
 * Copyright (c) 2013-2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
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

$extpath = dirname(__FILE__).DIRECTORY_SEPARATOR;
$taopath = dirname(dirname(__FILE__)).DIRECTORY_SEPARATOR.'tao'.DIRECTORY_SEPARATOR;

return array(
    'name'        => 'taoQtiItem',
    'label'       => 'QTI item model',
    'license'     => 'GPL-2.0',
    'version'     => '18.7.8',
    'author'      => 'Open Assessment Technologies',
    'requires' => array(
        'taoItems' => '>=6.6.0',
        'tao'      => '>=24.0.0',
        'generis'  => '>=8.1.3',
    ),
    'models' => array(
        'http://www.tao.lu/Ontologies/TAOItem.rdf'
    ),
    'install' => array(
		'rdf' => array(
			dirname(__FILE__). '/install/ontology/taoQti.rdf',
		    dirname(__FILE__). '/install/ontology/qtiItemRunner.rdf'
		),
		'checks' => array(
		    array('type' => 'CheckCustom', 'value' => array('id' => 'taoQtiItem_custom_mathjax', 'name' => 'mathjax', 'extension' => 'taoQtiItem', 'optional' => true))
		),
	    'php' => array(
			dirname(__FILE__).'/install/local/setDefaultTheme.php',
			dirname(__FILE__).'/install/local/addPortableContexts.php',
			dirname(__FILE__).'/install/scripts/setQtiRunnerConfig.php',
			'oat\\taoQtiItem\\install\\scripts\\addValidationSettings',
			'oat\\taoQtiItem\\install\\scripts\\SetDragAndDropConfig',
			'oat\\taoQtiItem\\scripts\\install\\SetQtiCreatorConfig',
            'oat\\taoQtiItem\\scripts\\install\\ItemEventRegister',
            'oat\\taoQtiItem\\install\\scripts\\setXMLParserConfig',
            InitMetadataService::class,
            SetItemModel::class,
            RegisterLegacyPortableLibraries::class,
            SetUpQueueTasks::class,
            RegisterItemCompilerBlacklist::class
		)
	),
	'local'	=> array(
		'php'	=> array(
		    dirname(__FILE__).'/install/local/addQTIExamples.php'
		)
	),
    'update' => 'oat\\taoQtiItem\\scripts\\update\\Updater',
    'routes' => array(
        '/taoQtiItem' => 'oat\\taoQtiItem\\controller'
    ),
    'managementRole' => 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole',
    'acl' => array(
        array('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTIManagerRole', array('ext'=>'taoQtiItem')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'taoQtiItem', 'mod' => 'QtiItemRunner')),
        array('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiPreview::class),
        array('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiCreator::class),
        array('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiCssAuthoring::class),
        array('grant', \oat\tao\model\user\TaoRoles::REST_PUBLISHER, array('ext'=>'taoQtiItem', 'mod' => 'RestQtiItem')),
    ),
	'constants' => array(
		# views directory
		"DIR_VIEWS"				=> $extpath."views".DIRECTORY_SEPARATOR,

		# default module name
		'DEFAULT_MODULE_NAME'	=> 'Main',

		#default action name
		'DEFAULT_ACTION_NAME'	=> 'index',

		#BASE PATH: the root path in the file system (usually the document root)
		'BASE_PATH'				=> $extpath,

		#BASE URL (usually the domain root)
		'BASE_URL'				=> ROOT_URL	.'taoQtiItem/',
	),
    'extra' => array(
        'structures' => dirname(__FILE__).DIRECTORY_SEPARATOR.'controller'.DIRECTORY_SEPARATOR.'structures.xml',
    )
);
