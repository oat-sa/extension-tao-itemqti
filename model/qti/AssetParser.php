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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\qti;

use common_exception_Error;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\container\Container;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\CustomInteractionAssetExtractorAllocator;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use SimpleXMLElement;
use tao_helpers_Xml;

/**
 * Parse and Extract all assets of an item.
 *
 * @package taoQtiItem
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class AssetParser
{

    /**
     * The item to parse
     * @var Item
     */
    private $item;

    /**
     * Set mode - if parser have to find shared libraries (PCI and PIC)
     * @var bool
     */
    private $getSharedLibraries = true;

    /**
     * Set mode - if parser have to find shared stimulus
     * @var bool
     */
    private $getXinclude = true;

    /**
     * Set mode - if parser have to find portable element
     * @var bool
     */
    private $getCustomElement = false;

    /**
     * Set mode - if parser have to find all external entries ( like url, require etc )
     * @var bool
     */
    private $deepParsing = true;

    /**
     * The extracted assets
     * @var array
     */
    private $assets = [];

    /**
     * @var Directory
     */
    private $directory;

    /**
     * Creates a new parser from an item
     * @param Item $item the item to parse
     * @param $directory
     */
    public function __construct(Item $item, Directory $directory)
    {
        $this->item = $item;
        $this->directory = $directory;
    }

    /**
     * Extract all assets from the current item
     * @return array the assets by type
     */
    public function extract()
    {
        foreach ($this->item->getComposingElements() as $element) {
            $this->extractImg($element);
            $this->extractObject($element);
            $this->extractStyleSheet($element);
            $this->extractCustomElement($element);
            if ($this->getGetXinclude()) {
                $this->extractXinclude($element);
            }
        }
        $this->extractApipAccessibilityAssets();
        return $this->assets;
    }

    private function extractApipAccessibilityAssets()
    {
        if (property_exists($this->item, 'apipAccessibility')) {
            try {
                $assets = tao_helpers_Xml::extractElements(
                    'fileHref',
                    $this->item->getApipAccessibility(),
                    'http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0'
                );
                foreach ($assets as $asset) {
                    $this->addAsset('apip', $asset);
                }
            } catch (common_exception_Error $e) {
            }
        }
    }

    /**
     * Lookup and extract assets from IMG elements
     * @param Element $element container of the target element
     */
    private function extractImg(Element $element)
    {
        if ($element instanceof Container) {
            foreach ($element->getElements('oat\taoQtiItem\model\qti\Img') as $img) {
                $this->addAsset('img', $img->attr('src'));
            }
        }
    }

    /**
     * Lookup and extract assets from a QTI Object
     * @param Element $element the element itself or a container of the target element
     */
    private function extractObject(Element $element)
    {
        if ($element instanceof Container) {
            foreach ($element->getElements('oat\taoQtiItem\model\qti\QtiObject') as $object) {
                $this->loadObjectAssets($object);
            }
        }
        if ($element instanceof QtiObject) {
            $this->loadObjectAssets($element);
        }
    }

    /**
     * Lookup and extract assets from IMG elements
     * @param Element $element container of the target element
     */
    private function extractXinclude(Element $element)
    {
        if ($element instanceof Container) {
            foreach ($element->getElements('oat\taoQtiItem\model\qti\Xinclude') as $xinclude) {
                $this->addAsset('xinclude', $xinclude->attr('href'));
            }
        }
    }

    /**
     * Lookup and extract assets from a stylesheet element
     * @param Element $element the stylesheet element
     */
    private function extractStyleSheet(Element $element)
    {
        if ($element instanceof StyleSheet) {
            $href = $element->attr('href');
            $this->addAsset('css', $href);

            $parsedUrl = parse_url($href);
            if (
                $this->isDeepParsing() && array_key_exists('path', $parsedUrl) && !array_key_exists(
                    'host',
                    $parsedUrl
                )
            ) {
                $file = $this->directory->getFile($parsedUrl['path']);
                if ($file->exists()) {
                    $this->loadStyleSheetAsset($file->read());
                }
            }
        }
    }

    public function extractPortableAssetElements()
    {
        foreach ($this->item->getComposingElements() as $element) {
            $this->extractCustomElement($element);
        }
        return $this->assets;
    }

    /**
     * Lookup and extract assets from a custom element (CustomInteraction, PCI, PIC)
     * @param Element $element the element itself or a container of the target element
     */
    public function extractCustomElement(Element $element)
    {
        $this->getPortableCustomInteraction($element);
        $this->getPortableInfoControl($element);
    }

    public function getPortableCustomInteraction(Element $element)
    {
        if ($element instanceof Container) {
            foreach ($element->getElements('oat\taoQtiItem\model\qti\interaction\CustomInteraction') as $interaction) {
                $this->loadCustomElementAssets($interaction);
            }
        }
        if ($element instanceof CustomInteraction) {
            $this->loadCustomElementAssets($element);
        }
    }

    public function getPortableInfoControl(Element $element)
    {
        if ($element instanceof Container) {
            foreach ($element->getElements('oat\taoQtiItem\model\qti\interaction\InfoControl') as $interaction) {
                $this->loadCustomElementAssets($interaction);
            }
        }
        if ($element instanceof InfoControl) {
            $this->loadCustomElementAssets($element);
        }
    }

    /**
     * Loads assets from an QTI object element
     * @param QtiObject $object the object
     */
    private function loadObjectAssets(QtiObject $object)
    {

        $type = $object->attr('type');

        if (strpos($type, "image") !== false) {
            $this->addAsset('img', $object->attr('data'));
        } elseif (strpos($type, "video") !== false  || strpos($type, "ogg") !== false) {
            $this->addAsset('video', $object->attr('data'));
        } elseif (strpos($type, "audio") !== false) {
            $this->addAsset('audio', $object->attr('data'));
        } elseif (strpos($type, "text/html") !== false) {
            $this->addAsset('html', $object->attr('data'));
        } elseif ($type === 'application/pdf') {
            $this->addAsset('pdf', $object->attr('data'));
        }
    }

    /**
     * Add the asset to the current list
     * @param string $type the asset type: img, css, js, audio, video, font, etc.
     * @param string $uri the asset URI
     */
    private function addAsset($type, $uri)
    {
        if (!array_key_exists($type, $this->assets)) {
            $this->assets[$type] = [];
        }
        if (!empty($uri) && !in_array($uri, $this->assets[$type])) {
            $this->assets[$type][] = $uri;
        }
    }

    /**
     * Search assets URI in custom element properties
     * The PCI standard will be extended in the future with typed property value (boolean, integer, float, string, uri, html etc.)
     * Meanwhile, we use the special property name uri for the special type "URI" that represents a file URI.
     * Portable element using this reserved property should be migrated later on when the standard is updated.
     *
     * @param array $properties
     */
    private function loadCustomElementPropertiesAssets($properties)
    {
        if (is_array($properties)) {
            if (isset($properties['uri'])) {
                $this->addAsset('document', urldecode($properties['uri']));
            } else {
                foreach ($properties as $property) {
                    if (is_array($property)) {
                        $this->loadCustomElementPropertiesAssets($property);
                    }
                }
            }
        }
    }

    /**
     * Load assets from the custom elements (CustomInteraction, PCI, PIC)
     * @param Element $element the custom element
     */
    private function loadCustomElementAssets(Element $element)
    {
        if ($this->getGetCustomElementDefinition()) {
            $this->assets[$element->getTypeIdentifier()] = $element;
        }

        $xmls = [];
        if ($element instanceof PortableCustomInteraction || $element instanceof PortableInfoControl) {
            //some portable elements contains htmlentitied markup in their properties...
            $xmls = $this->getXmlProperties($element->getProperties());
        }

        //parse and extract assets from markup using XPATH
        if ($element instanceof CustomInteraction || $element instanceof InfoControl) {
            // http://php.net/manual/fr/simplexmlelement.xpath.php#116622
            $sanitizedMarkup = str_replace('xmlns=', 'ns=', $element->getMarkup());

            $xmls[] = new SimpleXMLElement($sanitizedMarkup);

            $this->loadCustomElementPropertiesAssets($element->getProperties());

            /** @var SimpleXMLElement $xml */
            foreach ($xmls as $xml) {
                foreach ($xml->xpath('//img') as $img) {
                    $this->addAsset('img', (string)$img['src']);
                }
                foreach ($xml->xpath('//video') as $video) {
                    $this->addAsset('video', (string)$video['src']);
                }
                foreach ($xml->xpath('//audio') as $audio) {
                    $this->addAsset('audio', (string)$audio['src']);
                }
                foreach ($xml->xpath('//include') as $xinclude) {
                    $this->addAsset('xinclude', (string)$xinclude['href']);
                }
            }
        }

        if ($element instanceof CustomInteraction) {
            $this->extractAdvancedCustomInteractionAssets($element);
        }
    }

    private function getXmlProperties($properties)
    {
        $xmls = [];
        foreach ($properties as $property) {
            if (is_array($property)) {
                $xmls = array_merge($xmls, $this->getXmlProperties($property));
            }
            if (is_string($property)) {
                $xml = simplexml_load_string('<div>' . $property . '</div>');
                if ($xml !== false) {
                    $xmls[] = $xml;
                }
            }
        }
        return $xmls;
    }

    private function extractAdvancedCustomInteractionAssets(CustomInteraction $interaction): void
    {
        $extractorAllocator = $this->getCustomInteractionAssetExtractorAllocator();
        $extractor = $extractorAllocator->allocateExtractor($interaction->getTypeIdentifier());

        foreach ($extractor->extract($interaction) as $asset) {
            // `apip` type used as something common in reason that it's not possible do define a specific type,
            $this->addAsset('apip', $asset);
        }
    }

    /**
     * Parse, extract and load assets from the stylesheet content
     * @param string $css the stylesheet content
     */
    private function loadStyleSheetAsset($css)
    {

        $imageRe = "/url\\s*\\(['|\"]?([^)]*\.(png|jpg|jpeg|gif|svg))['|\"]?\\)/mi";
        $importRe = "/@import\\s*(url\\s*\\()?['\"]?([^;]*)['\"]/mi";
        $fontFaceRe = "/@font-face\\s*\\{(.*)?\\}/mi";
        $fontRe = "/url\\s*\\(['|\"]?([^)'|\"]*)['|\"]?\\)/i";

        //extract images
        preg_match_all($imageRe, $css, $matches);
        if (isset($matches[1])) {
            foreach ($matches[1] as $match) {
                $this->addAsset('img', $match);
            }
        }

        //extract @import
        preg_match_all($importRe, $css, $matches);
        if (isset($matches[2])) {
            foreach ($matches[2] as $match) {
                $this->addAsset('css', $match);
            }
        }

        //extract fonts
        preg_match_all($fontFaceRe, $css, $matches);
        if (isset($matches[1])) {
            foreach ($matches[1] as $faceMatch) {
                preg_match_all($fontRe, $faceMatch, $fontMatches);
                if (isset($fontMatches[1])) {
                    foreach ($fontMatches[1] as $fontMatch) {
                        $this->addAsset('font', $fontMatch);
                    }
                }
            }
        }
    }

    /**
     * @param boolean $getSharedLibraries
     */
    public function setGetSharedLibraries($getSharedLibraries)
    {
        $this->getSharedLibraries = $getSharedLibraries;
    }

    /**
     * @return boolean
     */
    public function getGetSharedLibraries()
    {
        return $this->getSharedLibraries;
    }

    /**
     * @param boolean $getXinclude
     */
    public function setGetXinclude($getXinclude)
    {
        $this->getXinclude = $getXinclude;
    }

    /**
     * @return boolean
     */
    public function getGetXinclude()
    {
        return $this->getXinclude;
    }

    /**
     * @param boolean $getCustomElement
     */
    public function setGetCustomElementDefinition($getCustomElement)
    {
        $this->getCustomElement = $getCustomElement;
    }

    /**
     * @return boolean
     */
    public function getGetCustomElementDefinition()
    {
        return $this->getCustomElement;
    }


    /**
     * @return boolean
     */
    public function isDeepParsing()
    {
        return $this->deepParsing;
    }

    /**
     * @param boolean $deepParsing
     */
    public function setDeepParsing($deepParsing)
    {
        $this->deepParsing = $deepParsing;
    }

    private function getCustomInteractionAssetExtractorAllocator(): CustomInteractionAssetExtractorAllocator
    {
        return ServiceManager::getServiceManager()
            ->getContainer()
            ->get(CustomInteractionAssetExtractorAllocator::class);
    }

}
