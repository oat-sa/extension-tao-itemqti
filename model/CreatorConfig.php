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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 * 
 */

namespace oat\taoQtiItem\model;


/**
 * Interface defining required method for a plugin
 *
 * @package taoQtiItem
 */
Class CreatorConfig extends Config
{

    protected $interactions = array();
    protected $infoControls = array();
    protected $plugins      = array();
    // hard coded urls for using by item creator
    // place into the properties with 'Url' postfix
    protected $controlEndpoints = array(
        'entry' => 'itemQtiCreator/qtiCreator',
        'itemData' => 'taoQtiItem/QtiCreator/getItemData',
        'loadCss' => 'taoQtiItem/QtiCssAuthoring/load',
        
        'saveItem' => 'taoQtiItem/QtiCreator/saveItem',
        'saveCss' => 'taoQtiItem/QtiCssAuthoring/save',
        
        'portableElementAddResources' => 'taoQtiItem/PortableElement/addRequiredResources',
        
        'mediaSources' => 'taoQtiItem/QtiCreator/getMediaSources',
        'getFiles' => 'taoItems/ItemContent/files',
        'fileAccess' => 'taoQtiItem/QtiCreator/getFile',
        
        'fileExists' => 'taoItems/ItemContent/fileExists',
        'fileUpload' => 'taoItems/ItemContent/upload',
        'fileDownload' => 'taoItems/ItemContent/download',
        'fileDelete' => 'taoItems/ItemContent/delete',
        
        'preview' => 'taoQtiItem/QtiPreview/index',
        'previewRender' => 'taoQtiItem/QtiPreview/render',
        'previewSubmit' => 'taoQtiItem/QtiPreview/submitResponses',
    );

    public function addInteraction($interactionFile){
        $this->interactions[] = $interactionFile;
    }

    public function addInfoControl($infoControl){
        $this->infoControls[] = $infoControl;
    }

    /**
     * Add a plugin to the configuration
     * @param string $name - the plugin name
     * @param string $module - the plugin AMD module
     * @param string $category - the plugin category
     */
    public function addPlugin($name, $module, $category){
        $this->plugins[] = array(
            'name' => $name,
            'module' => $module,
            'category' => $category
        );
    }

    /**
     * Remove a plugin from the configuration
     * @param string $name - the plugin name
     */
    public function removePlugin($name){
        foreach($this->plugins as $key => $plugin){
            if($plugin['name'] == $name){
                $this->plugins[$key]['exclude'] = true;
            }
        }
    }

    public function toArray(){

        $interactions = array();
        foreach($this->interactions as $interaction){
            unset($interaction['directory']);
            $interactions[] = $interaction;
        }

        $infoControls = array();
        foreach($this->infoControls as $infoControl){
            unset($infoControl['directory']);
            $infoControls[] = $infoControl;
        }

        return array(
            'properties'     => $this->properties,
            'contextPlugins' => $this->plugins,
            'interactions'   => $interactions,
            'infoControls'   => $infoControls,
        );
    }

    public function init(){

        foreach($this->interactions as $interaction){
            $this->prepare($interaction);
        }
        foreach($this->infoControls as $infoControl){
            $this->prepare($infoControl);
        }
        foreach ($this->controlEndpoints as $key => $controlEndpoint) {
            $this->setProperty($key . 'Url', \tao_helpers_Uri::getRootUrl() . $controlEndpoint);
        }

        //as the config overrides the plugins, we get the list from the registry
        $registry = QtiCreatorClientConfigRegistry::getRegistry();
        $this->plugins = $registry->getPlugins();
    }

    protected function prepare($hook){

        if(isset($this->properties['uri'])){

            $item = new \core_kernel_classes_Resource($this->properties['uri']);

            //check for implementation in debugging state:
            if(isset($hook['debug']) && $hook['debug']){

                //add required resources:
                $registry = new $hook['registry'];
                $registry->addRequiredResources($hook['typeIdentifier'], $item);
                \common_Logger::d('added '.$hook['registry'].' '.$hook['typeIdentifier']);
            }
        }else{
            throw new \common_Exception('cannot prepare hook because of missing property in config : "uri" ');
        }
    }
}
