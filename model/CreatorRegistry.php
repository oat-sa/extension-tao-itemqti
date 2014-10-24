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
 * CreatorRegistry stores reference to 
 *
 * @package taoQtiItem
 */
abstract class CreatorRegistry
{
    
    /**
     * constructor
     */
    public function __construct(){

        $this->baseDevDir = $this->getBaseDevDir();
        $this->baseDevUrl = $this->getBaseDevUrl();
    }
    
    /**
     * @return string - e.g. DIR_VIEWS/js/pciCreator/dev/
     */
    abstract protected function getBaseDevDir();
    
    /**
     * @return string - e.g. BASE_WWW/js/pciCreator/dev/
     */
    abstract protected function getBaseDevUrl();
    
    /**
     * get the hook file name to distinguish various implementation
     * 
     * @return string
     */
    abstract protected function getHookFileName();
    
    /**
     * Get the entry point file path from the baseUrl
     * 
     * @param string $baseUrl
     * @return string
     */
    protected function getEntryPointFile($baseUrl){
        return $baseUrl.'/'.$this->getHookFileName();
    }
    
    /**
     * Get PCI Creator hooks directly located at views/js/pciCreator/myCustomInteraction:
     * 
     * @return array
     */
    public function getDevImplementations(){

        $returnValue = array();
        
        $hookFileName = $this->getHookFileName();
        
        foreach(glob($this->baseDevDir.'*/'.$hookFileName.'.js') as $file){

            $dir = str_replace($hookFileName.'.js', '', $file);
            $manifestFile = $dir.$hookFileName.'.json';
            
            if(file_exists($manifestFile)){
                
                $typeIdentifier = basename($dir);
                $baseUrl = $this->baseDevUrl.$typeIdentifier.'/';
                $manifest = json_decode(file_get_contents($manifestFile), true);

                $returnValue[] = array(
                    'typeIdentifier' => $typeIdentifier,
                    'label' => $manifest['label'],
                    'directory' => $dir,
                    'baseUrl' => $baseUrl,
                    'file' => $this->getEntryPointFile($typeIdentifier),
                    'manifest' => $manifest,
                    'dev' => true
                );
            }
        }

        return $returnValue;
    }
    
    /**
     * Get PCI Creator hook located at views/js/{{hookFileName}}/$typeIdentifier
     * 
     * @param string $typeIdentifier
     * @return array
     */
    public function getDevImplementation($typeIdentifier){
        
        //@todo : re-implement it to be more optimal
        $devImplementations = $this->getDevImplementations();
        foreach($devImplementations as $impl){
            if($impl['typeIdentifier'] == $typeIdentifier){
                return $impl;
            }
        }
        return null;
    }
    
    /**
     * Get the path to the directory of a the Creator located at views/js/{{hookFileName}}/
     * 
     * @param string $typeIdentifier
     * @return string
     * @throws \common_Exception
     */
    public function getDevImplementationDirectory($typeIdentifier){
        $dir = $this->baseDevDir.$typeIdentifier;
        if(file_exists($dir)){
            return $dir;
        }else{
            throw new \common_Exception('the type identifier cannot be found');
        }
    }
}