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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 *               2013-2014 (update and modification) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */

namespace oat\taoQtiItem\model\Export;

use oat\taoQtiItem\model\qti\Service;
use \core_kernel_classes_Resource;
use \ZipArchive;
use \DOMDocument;
use \tao_helpers_Uri;
use \taoItems_models_classes_TemplateRenderer;
use \tao_helpers_Display;
use \common_Exception;

class QTIPackedItemExporter extends AbstractQTIItemExporter {

    private $manifest;
    
    /**
	 * Creates a new instance of QtiPackedItemExporter for a particular item.
	 * 
	 * @param core_kernel_classes_Resource $item The item to be exported.
	 * @param ZipArchive $zip The ZIP archive were the files have to be exported.
	 * @param DOMDocument $manifest A Manifest to be reused to reference item components (e.g. auxilliary files).
	 */
	public function __construct(core_kernel_classes_Resource $item, ZipArchive $zip, DOMDocument $manifest = null) {
	    parent::__construct($item, $zip);
	    $this->setManifest(is_null($manifest) ? $this->createEmptyManifest() : $manifest);
	}

    /**
     * @return DOMDocument
     */
	public function getManifest() {
	    return $this->manifest;
	}
	
	/**
	 * @param DOMDocument $manifest
	 */
	public function setManifest(DOMDocument $manifest = null) {
	    $this->manifest = $manifest;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see \oat\taoQtiItem\model\Export\AbstractQTIItemExporter::export()
	 */
	public function export($options = array()) {
	    if (!$this->containsItem()) {
		  parent::export($options);
		  $asApip = isset($options['apip']) && $options['apip'] === true;
		  $this->addToManifest($asApip);
		  $this->writeManifest();
	    }
	}
	
	/**
	 * (non-PHPdoc)
	 * @see \oat\taoQtiItem\model\Export\AbstractQTIItemExporter::buildBasePath()
	 */
	public function buildBasePath() {
	    return tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
	}
	
	public function buildIdentifier() {
	    return tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
	}
	
	/**
	 * Whenever the item is already in the manifest
	 * @return boolean
	 */
	protected function containsItem()
	{
	    $found = false;
	    foreach ($this->getManifest()->getElementsByTagName('resource') as $resourceNode) {
	       if ($resourceNode->getAttribute('identifier') == $this->buildIdentifier()) {
	           $found = true;
	           break;
	       }
	    }
	    return $found;
	}
	
	/**
	 * @return DOMDocument
	 */
	protected function createEmptyManifest($options = array())
	{
        $dir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $templateRenderer = new taoItems_models_classes_TemplateRenderer($dir . 'model/qti/templates/imsmanifest.tpl.php', array(
            'qtiItems' 				=> array(),
            'manifestIdentifier'    => 'MANIFEST-' . tao_helpers_Display::textCleaner(uniqid('tao', true), '-')
        ));
         
        $renderedManifest = $templateRenderer->render();
        $newManifest = new DOMDocument('1.0', TAO_DEFAULT_ENCODING);
        $newManifest->loadXML($renderedManifest);
	    return $newManifest;
	}
	
	/**
	 * Saves the manifest to the zip archive
	 */
	protected function writeManifest()
	{
	    $this->getZip()->addFromString('imsmanifest.xml', $this->getManifest()->saveXML());
	}
	
	/**
	 * Returns the paths to all resources of the item
	 * 
	 * @return string[]
	 */
	protected function getResources()
	{
	    $zipArchive = $this->getZip();
	    $base = $this->buildBasePath();
	    
	    $qtiResources = array();
	    for ($i = 0; $i < $zipArchive->numFiles; $i++) {
	        $fileName = $zipArchive->getNameIndex($i);
	    
	        if (preg_match("@^" . preg_quote($base) . "@", $fileName) && basename($fileName) != 'qti.xml') {
                $qtiResources[] = $fileName;
	        }
	    }
	    return $qtiResources;
	}
	
	/**
	 * Returns the path to the qtiItem
	 * @return string
	 */
	protected function getQtiFile() {
	    $zipArchive = $this->getZip();
	    $base = $this->buildBasePath();
	    
	    $qtiFile = '';
	    for ($i = 0; $i < $zipArchive->numFiles; $i++) {
	        $fileName = $zipArchive->getNameIndex($i);
	         
	        if (preg_match("@^" . preg_quote($base) . "@", $fileName) && basename($fileName) == 'qti.xml') {
                $qtiFile = $fileName;
                break;
	        }
	    }
	    return $qtiFile;
	}
	
	/**
	 * Append the item resource to the manifest
	 * 
	 * @param boolean $asApip
	 */
	protected function addToManifest($asApip = false)
	{
	   $qtiResources = $this->getResources();
	   $qtiFile = $this->getQtiFile();
	   $qtiType = $asApip ? 'imsqti_apipitem_xmlv2p' : 'imsqti_item_xmlv2p1';
	   
	   if ($asApip) {
	       $this->setApipManifest();
	   }
	   
	   $itemResource = $this->buildItemResource($this->buildIdentifier(), $qtiFile, $qtiType, $qtiResources);
	   
	   $resourcesNodes = $this->getManifest()->getElementsByTagName('resources');
	   $resourcesNodes->item(0)->appendChild($itemResource);

	}
	
	/**
	 * Sets the namespace to APIP
	 */
	protected function setApipManifest()
	{
	    foreach ($this->getManifest()->getElementsByTagName('manifest') as $manifest) {
	        $manifest->setAttribute('xmlns', "http://www.imsglobal.org/xsd/apip/apipv1p0/imscp_v1p1");
	        $manifest->setAttribute('xmlns:lomm', "http://ltsc.ieee.org/xsd/apipv1p0/LOM/manifest");
	    }
	}
	
	/**
	 * Build the item resource node
	 * 
	 * @param string $identifier
	 * @param string $filePath
	 * @param string $itemType
	 * @param string[] $media
	 * @return DOMElement
	 */
	protected function buildItemResource($identifier, $filePath, $itemType = 'imsqti_item_xmlv2p1', $media = array())
	{
	    $dom = $this->getManifest();
	    $item = $dom->createElement('resource');
	    $item->setAttribute('identifier', $identifier);
	    $item->setAttribute('type', $itemType);
	    $item->setAttribute('href', $filePath);
	     
	    $itemFile = $dom->createElement('file');
	    $itemFile->setAttribute('href', $filePath);
	    $item->appendChild($itemFile);
	
	    foreach ($media as $mediaPath) {
	        $mediaFile = $dom->createElement('file');
	        $mediaFile->setAttribute('href', $mediaPath);
	        $item->appendChild($mediaFile);
	    }
	
	    return $item;
	}
}
