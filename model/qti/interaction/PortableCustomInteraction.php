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

namespace oat\taoQtiItem\model\qti\interaction;

use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use \DOMElement;

/**
 * The QTI custom interaction is a subclass of the main QTI Interaction class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10267

 */
class PortableCustomInteraction extends CustomInteraction
{
    
    const NS_NAME = 'pci';
    
    protected $nsMap = array(
        'pci' => 'http://www.imsglobal.org/xsd/portableCustomInteraction'
    );
    
    
    protected $properties = array();
    protected $libraries = array();
    protected $stylesheets = array();
    protected $mediaFiles = array();
    protected $typeIdentifier = '';
    protected $entryPoint = '';
    protected $version = '0.0.0';
    
    public function setTypeIdentifier($typeIdentifier){
        $this->typeIdentifier = $typeIdentifier;
    }
    
    public function setEntryPoint($entryPoint){
        $this->entryPoint = $entryPoint;
    }
    
    public function getTypeIdentifier(){
        return $this->typeIdentifier;
    }
    
    public function getEntryPoint(){
        return $this->entryPoint;
    }
    
    public function getProperties(){
        return $this->properties;
    }
    
    public function getStylesheets(){
        return $this->stylesheets;
    }
    
    public function setStylesheets($stylesheets){
        $this->stylesheets = $stylesheets;
    }
    
    public function getMediaFiles(){
        return $this->mediaFiles;
    }
    
    public function setMediaFiles($mediaFiles){
        $this->mediaFiles = $mediaFiles;
    }
    
    public function getVersion(){
        return $this->version;
    }

    public function setVersion($version){
        return $this->version = $version;
    }
    
    public function setProperties($properties){
        if(is_array($properties)){
            $this->properties = $properties;
        }else{
            throw new InvalidArgumentException('properties should be an array');
        }
    }

    public function getLibraries(){
        return $this->libraries;
    }

    public function setLibraries($libraries){
        if(is_array($libraries)){
            $this->libraries = $libraries;
        }else{
            throw new InvalidArgumentException('libraries should be an array');
        }
    }

    public function toArray($filterVariableContent = false, &$filtered = array()){
        
        $returnValue = parent::toArray($filterVariableContent, $filtered);

        $returnValue['typeIdentifier'] = $this->typeIdentifier;
        $returnValue['version'] = $this->version;
        $returnValue['entryPoint'] = $this->entryPoint;
        $returnValue['libraries'] = $this->libraries;
        $returnValue['stylesheets'] = $this->stylesheets;
        $returnValue['mediaFiles'] = $this->mediaFiles;
        $returnValue['properties'] = $this->getArraySerializedPrimitiveCollection($this->getProperties(), $filterVariableContent, $filtered);

        return $returnValue;
    }

    public static function getTemplateQti(){
        return static::getTemplatePath().'interactions/qti.customInteraction.tpl.php';
    }
    
    protected function getTemplateQtiVariables(){

        $nsMarkup = 'html5';
        $variables = parent::getTemplateQtiVariables();
        $variables['libraries'] = $this->libraries;
        $variables['stylesheets'] = $this->stylesheets;
        $variables['mediaFiles'] = $this->mediaFiles;
        $variables['serializedProperties'] = $this->serializePciProperties($this->properties, self::NS_NAME);
        $variables['entryPoint'] = $this->entryPoint;
        $variables['typeIdentifier'] = $this->typeIdentifier;
        $variables['markup'] = preg_replace('/<(\/)?([^!])/', '<$1'.$nsMarkup.':$2', $variables['markup']);
        $this->getRelatedItem()->addNamespace($nsMarkup, $nsMarkup);
        return $variables;
    }
    
    /**
     * Feed the pci instance with data provided in the pci dom node
     *
     * @param ParserFactory $parser
     * @param DOMElement $data
     * @throws InvalidArgumentException
     * @throws QtiModelException
     */
    public function feed(ParserFactory $parser, DOMElement $data){

        $ns = $parser->getPciNamespace();

        $pciNodes = $parser->queryXPathChildren(array('portableCustomInteraction'), $data, $ns);
        if(!$pciNodes->length) {
            throw new QtiModelException('no portableCustomInteraction node found');
        }

        $typeIdentifier = $pciNodes->item(0)->getAttribute('customInteractionTypeIdentifier');
        if(empty($typeIdentifier)){
            throw new QtiModelException('the type identifier of the pci is missing');
        }else{
            $this->setTypeIdentifier($typeIdentifier);
        }
        $this->setEntryPoint($pciNodes->item(0)->getAttribute('hook'));

        $version = $pciNodes->item(0)->getAttribute('version');
        if($version){
            $this->setVersion($version);
        }

        $libNodes = $parser->queryXPathChildren(array('portableCustomInteraction', 'resources', 'libraries', 'lib'), $data, $ns);
        $libs = array();
        foreach($libNodes as $libNode){
            $libs[] = $libNode->getAttribute('id');
        }
        $this->setLibraries($libs);

        $stylesheetNodes = $parser->queryXPathChildren(array('portableCustomInteraction', 'resources', 'stylesheets', 'link'), $data, $ns);
        $stylesheets = array();
        foreach($stylesheetNodes as $styleNode){
            $stylesheets[] = $styleNode->getAttribute('href');
        }
        $this->setStylesheets($stylesheets);

        $mediaNodes = $parser->queryXPathChildren(array('portableCustomInteraction', 'resources', 'mediaFiles', 'file'), $data, $ns);
        $media = array();
        foreach($mediaNodes as $mediaNode){
            $media[] = $mediaNode->getAttribute('src');
        }
        $this->setMediaFiles($media);

        $propertyNodes = $parser->queryXPathChildren(array('portableCustomInteraction', 'properties'), $data, $ns);
        if($propertyNodes->length){
            $properties = $this->extractPciProperties($propertyNodes->item(0), $ns);
            $this->setProperties($properties);
        }

        $markupNodes = $parser->queryXPathChildren(array('portableCustomInteraction', 'markup'), $data, $ns);
        if($markupNodes->length){
            $markup = $parser->getBodyData($markupNodes->item(0), true, true);
            $this->setMarkup($markup);
        }
    }
    
    /**
     * Format the pci namespace prefix used for pci
     * @param string $ns
     * @return string
     */
    private function formatPciNs($ns){
        $ns = $ns ? $ns : '';
        if($ns){
            if(substr($ns, -1) !== ':'){
                $ns .= ':';
            }
        }
        return $ns;
    }
    
    /**
     * Parse a pci properties dom node into an associative array
     * 
     * @param DOMElement $propertiesNode
     * @param string $ns
     * @return array
     */
    private function extractPciProperties(DOMElement $propertiesNode, $ns = ''){

        $properties = array();
        
        $ns = $this->formatPciNs($ns);
        
        foreach($propertiesNode->childNodes as $prop){
            if($prop instanceof DOMElement){
                switch($prop->tagName){
                    case $ns.'entry':
                        $key = $prop->getAttribute('key');
                        $properties[$key] = $prop->nodeValue;
                        break;
                    case $ns.'properties':
                        $key = $prop->getAttribute('key');
                        $properties[$key] = $this->extractPciProperties($prop, $ns);
                        break;
                }
            }
        }

        return $properties;
    }
    
    /**
     * Serialize an associative array of pci properties into a pci xml
     * 
     * @param array $properties
     * @param string $ns
     * @return string
     */
    private function serializePciProperties($properties, $ns = '', $name = null, $element = null){
        $document = null;
        $result = '';
        
        if (!isset($this->nsMap[$ns])) {
            $ns = '';
        }
        
        if ($element === null) {
            $document = new \DomDocument();
            $element = $ns ? 
                $document->createElementNS($this->nsMap[$ns], $ns . ':properties') : 
                $document->createElement('properties');
            
            $document->appendChild($element);
        } else {
            $newElement = $ns ? 
                $element->ownerDocument->createElementNS($this->nsMap[$ns], $ns . ':properties') : 
                $element->ownerDocument->createElement('properties');
            
            $element->appendChild($newElement);
            $element = $newElement;
        }

        if ($name !== null) {
            $element->setAttribute('key', $name);
        } 

        foreach ($properties as $name => $value) {
            if(is_array($value)){
                $this->serializePciProperties($value, $ns, $name, $element);
            } else {
                $entryElement = $ns ? 
                    $element->ownerDocument->createElementNS($this->nsMap[$ns], $ns . ':entry') : 
                    $element->ownerDocument->createElementNS('entry');
                
                $entryElement->setAttribute('key', $name);
                $entryElement->appendChild(new \DOMText($value));
                $element->appendChild($entryElement);
            }
        }

        if ($document !== null) {
            foreach ($document->childNodes as $node) {
               $result .= $document->saveXML($node);
            }
        }
        
        return $result;
    }
    
}
