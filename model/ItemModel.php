<?php
/*  
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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

namespace oat\taoQtiItem\model;

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\service\ServiceFileStorage;
use oat\taoItems\model\search\IndexableItemModel;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\search\QtiItemContentTokenizer;
use \tao_models_classes_export_ExportProvider;
use \tao_models_classes_import_ImportProvider;
use \common_ext_ExtensionsManager;
use \core_kernel_classes_Resource;
use \common_Logger;
use taoItems_models_classes_itemModel;
use taoItems_models_classes_ItemCompiler;

/**
 * Short description of class oat\taoQtiItem\model\ItemModel
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoQTI
 
 */
class ItemModel extends ConfigurableService
        implements taoItems_models_classes_itemModel,
                   tao_models_classes_export_ExportProvider,
                   tao_models_classes_import_ImportProvider,
                   IndexableItemModel
{

    const SERVICE_ID = 'taoQtiItem/ItemModel';
    const MODEL_URI = "http://www.tao.lu/Ontologies/TAOItem.rdf#QTI";

    const COMPILER = 'compilerClass';
    const IMPORT_HANDLER = 'importHandlers';
    const EXPORT_HANDLER = 'exportHandlers';

    /**
     * constructor called by itemService
     *
     * @access public
     * @author Joel Bout, <joel@taotesting.com>
     * @return mixed
     */
    public function __construct($options = array())
    {
        parent::__construct($options);
        // ensure qti extension is loaded
        common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
    }

    /**
     * render used for deploy and preview
     *
     * @access public
     * @author Joel Bout, <joel@taotesting.com>
     * @param core_kernel_classes_Resource $item
     * @param $langCode
     * @throws \common_Exception
     * @return string
     */
    public function render( core_kernel_classes_Resource $item, $langCode)
    {
        $returnValue = (string) '';

		$qitService = Service::singleton();
		
		$qtiItem = $qitService->getDataItemByRdfItem($item, $langCode);
    	
		if(!is_null($qtiItem)) {
			$returnValue = $qitService->renderQTIItem($qtiItem, $langCode);
		} else {
			common_Logger::w('No qti data for item '.$item->getUri().' in '.__FUNCTION__, 'taoQtiItem');
		}

        return (string) $returnValue;
    }

    /**
     * (non-PHPdoc)
     * @see taoItems_models_classes_itemModel::getPreviewUrl()
     */
    public function getPreviewUrl( core_kernel_classes_Resource $item, $languageCode) {
       return _url('index', 'QtiPreview', 'taoQtiItem', array('uri' => $item->getUri(), 'lang' => $languageCode)); 
    }
    
    /**
     * @see taoItems_models_classes_itemModel::getPreviewUrl()
     */
    public function getAuthoringUrl( core_kernel_classes_Resource $item) {
       return _url('index', 'QtiCreator', 'taoQtiItem', array(
            'instance' => $item->getUri(), 
            'STANDALONE_MODE' => intval(\tao_helpers_Context::check('STANDALONE_MODE'))
        )); 
    }


    public function getExportHandlers()
    {
        if($this->hasOption(self::EXPORT_HANDLER)){
            return $this->getOption(self::EXPORT_HANDLER);
        } else {
            return array();
        }
    }

    public function getImportHandlers()
    {
        if($this->hasOption(self::IMPORT_HANDLER)){
            return $this->getOption(self::IMPORT_HANDLER);
        } else {
            return array();
        }
    }

    public function getCompilerClass()
    {
        if($this->hasOption(self::COMPILER)){
            return $this->getOption(self::COMPILER);
        } else {
            return array();
        }
    }

    public function getPackerClass() {
        return 'oat\\taoQtiItem\\model\\pack\\QtiItemPacker';
    }

    /**
     * Get tokenizer to index qti.xml content
     *
     * @return QtiItemContentTokenizer
     */
    public function getItemContentTokenizer()
    {
        return new QtiItemContentTokenizer();
    }

    /**
     * @param core_kernel_classes_Resource $resource
     * @param ServiceFileStorage $storage
     * @return taoItems_models_classes_ItemCompiler
     */
    public function getItemCompiler(core_kernel_classes_Resource $resource, ServiceFileStorage $storage)
    {
        $class = $this->getCompilerClass();
        $compiler = new $class($resource, $storage);
        $compiler->setServiceLocator($this->getServiceLocator());
        return $compiler;
    }
}
