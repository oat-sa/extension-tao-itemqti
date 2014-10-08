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

/**
 * Interface defining required method for a plugin
 *
 * @package taoQTI
 
 */
Class Config
{   
    protected $properties = array();
    protected $uiHooks = array();
    protected $interactions = array();
    protected $infoControls = array();

    /**
     * Affect the config
     * 
     * @param \oat\taoQtiItem\model\creator\CreatorConfig $config
     */
    public function __construct(){
        
    }
    
    public function setProperty($key, $value){
        $this->properties[$key] = $value;
    }
    
    public function getProperty($key){
        if(isset($this->properties[$key])){
            return $this->properties[$key];
        }else{
            return null;
        }
    }
    
    public function getProperties(){
        return $this->properties;
    }
    
    public function addHook($hookFile){
        $this->uiHooks[] = $hookFile;
    }
    
    public function addInteraction($interactionFile){
        $this->interactions[] = $interactionFile;
    }
    
    public function addInfoControl($infoControl){
        $this->infoControls[] = $infoControl;
    }
    
    public function toArray(){
        
        return array(
            'properties' => $this->properties,
            'uiHooks' => $this->uiHooks,
            'interactions' => $this->interactions,
            'infoControls' => $this->infoControls
        );
    }
    
}