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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiItem\model\qti;

use DOMAttr;
use DOMDocument;
use DOMElement;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\XInclude;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\exception\XIncludeException;
use oat\taoQtiItem\model\qti\exception\ParsingException;

/**
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI

 */
class XIncludeLoader
{
    protected $qtiItem = null;
    protected $resolver = null;

    public function __construct(Item $qtiItem, ItemMediaResolver $resolver)
    {
        $this->qtiItem = $qtiItem;
        $this->resolver = $resolver;
    }

    /**
     * Load parse the item and resolve all xinclude
     *
     * @param boolean $removeUnfoundHref
     * @return array
     * @throws XIncludeException when the href cannot be resolved
     */
    public function load($removeUnfoundHref = false)
    {

        $xincludes = $this->getXIncludes();

        //load xincludes in standard element
        foreach ($xincludes as $xinclude) {
            //retrive the xinclude from href
            $href = $xinclude->attr('href');
            if (!empty($href)) {
                try {
                    $asset = $this->resolver->resolve($href);
                    $filePath = $asset->getMediaSource()->download($asset->getMediaIdentifier());
                    $this->loadXInclude($xinclude, $filePath);
                } catch (\tao_models_classes_FileNotFoundException $exception) {
                    if ($removeUnfoundHref) {
                        $xinclude->attr('href', '');
                    } else {
                        throw new XIncludeException('The file referenced by href does not exist : ' . $href, $xinclude);
                    }
                }
            }
        }

        //load xinclude in portable element markup
        $customElements = $this->getCustomElements();
        foreach ($customElements as $customElement) {
            $xincludes = array_merge($xincludes, $this->parseCustomElementMarkup($customElement));
        }

        return $xincludes;
    }

    /**
     * Parse and load xinclude located in custom element markup
     *
     * @param CustomInteraction $customElement
     * @return array
     * @throws XIncludeException when the file in href cannot be resolved
     * @throws ParsingException when the markup cannot be loaded as xml document
     */
    private function parseCustomElementMarkup(CustomInteraction $customElement)
    {

        $xincludes = [];
        $xml = new DOMDocument();
        $xml->formatOutput = true;
        $loadSuccess = $xml->loadXML($customElement->getMarkup());
        $node = $xml->documentElement;

        if ($loadSuccess && !is_null($node)) {
            $parser = new ParserFactory($xml);
            $xincludesNodes = $parser->queryXPath(".//*[name(.)='include']");
            foreach ($xincludesNodes as $xincludeNode) {
                $href = $xincludeNode->getAttribute('href');
                $asset = $this->resolver->resolve($href);
                $filePath = $asset->getMediaSource()->download($asset->getMediaIdentifier());
                if (file_exists($filePath)) {
                    $fileContent = file_get_contents($filePath);
                    $xmlInclude = new DOMDocument();
                    $xmlInclude->formatOutput = true;
                    $xmlInclude->loadXML($fileContent);
                    foreach ($xmlInclude->documentElement->childNodes as $node) {
                        $importNode = $xml->importNode($node, true);
                        $xincludeNode->parentNode->insertBefore($importNode, $xincludeNode);
                    }
                } else {
                    throw new XIncludeException('The file referenced by href does not exist : ' . $href, $xincludeNode);
                }
                $xincludeNode->parentNode->removeChild($xincludeNode);
                $xincludes[] = $href;
            }
        } else {
            throw new ParsingException('cannot parse pci markup');
        }

        $customElement->setMarkup($xml->saveXML($xml->documentElement, LIBXML_NOEMPTYTAG));

        return $xincludes;
    }

    /**
     * load an xml string into the body of the XInclude
     *
     * @param \oat\taoQtiItem\model\qti\XInclude $xinclude
     * @param string $filePath
     * @throws XIncludeException
     */
    private function loadXInclude(XInclude $xinclude, $filePath)
    {
        //load DOMDocument
        $xml = new DOMDocument();
        $loadSuccess = $xml->load($filePath);
        $node = $xml->documentElement;
        if ($loadSuccess && !is_null($node)) {
            $this->loadNonQtiAttributes($node, $xinclude);
            //parse the href content
            $parser = new ParserFactory($xml);
            $parser->loadContainerStatic($node, $xinclude->getBody());
        } else {
            throw new XIncludeException('Cannot load the XInclude DOM XML', $xinclude);
        }
    }

    /**
     * loads XML attributes related to passage styling to Xinclude QTI model
     *
     * @throws exception\QtiModelException
     */
    private function loadNonQtiAttributes(DOMElement $xIncludeDOMElement, XInclude $xInclude): void
    {
        /** @var  $attrNode DOMAttr */
        foreach ($xIncludeDOMElement->attributes as $attrName => $attrNode) {
            if (in_array($attrName, $xInclude->listOfNonQtiAttributes())) {
                $xInclude->setAttribute($attrName, $attrNode->value);
            }
        }
    }

    /**
     * Find the xinclude elements in the qti item
     *
     * @return \oat\taoQtiItem\model\qti\XInclude[]
     */
    private function getXIncludes()
    {
        $xincludes = [];
        foreach ($this->qtiItem->getComposingElements() as $element) {
            if ($element instanceof XInclude) {
                $xincludes[] = $element;
            }
        }
        return $xincludes;
    }

    /**
     * Find the custom elements in the qti item
     *
     * @return \oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction[]
     */
    private function getCustomElements()
    {
        $customElements = [];
        foreach ($this->qtiItem->getComposingElements() as $element) {
            if ($element instanceof PortableCustomInteraction) {
                $customElements[] = $element;
            }
        }
        return $customElements;
    }
}
