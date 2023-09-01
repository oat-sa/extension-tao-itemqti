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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\qti\interaction;

use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use DOMElement;
use oat\taoQtiItem\model\qti\PortableElementTrait;
use oat\taoQtiItem\model\qti\QtiNamespace;

/**
 * The ImsPortableCustomInteraction is the class of the official IMS PCI v1 implementation
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10267

 */
class ImsPortableCustomInteraction extends CustomInteraction
{
    use PortableElementTrait;

    public const NS_NAME = 'imspci';
    public const NS_URI = 'http://www.imsglobal.org/xsd/portableCustomInteraction_v1';

    protected $markupNs = 'http://www.w3.org/1999/xhtml';
    protected $properties = [];
    protected $libraries = [];
    protected $stylesheets = [];
    protected $mediaFiles = [];
    protected $typeIdentifier = '';
    protected $entryPoint = '';
    protected $version = '0.0.0';

    public function setTypeIdentifier($typeIdentifier)
    {
        $this->typeIdentifier = $typeIdentifier;
    }

    public function setEntryPoint($entryPoint)
    {
        $this->entryPoint = $entryPoint;
    }

    public function getTypeIdentifier()
    {
        return $this->typeIdentifier;
    }

    public function getEntryPoint()
    {
        return $this->entryPoint;
    }

    public function getProperties()
    {
        return $this->properties;
    }

    public function setProperties($properties)
    {
        if (is_array($properties)) {
            $this->properties = $properties;
        } else {
            throw new InvalidArgumentException('properties should be an array');
        }
    }

    public function getStylesheets()
    {
        return $this->stylesheets;
    }

    public function setStylesheets($stylesheets)
    {
        $this->stylesheets = $stylesheets;
    }

    public function getMediaFiles()
    {
        return $this->mediaFiles;
    }

    public function setMediaFiles($mediaFiles)
    {
        $this->mediaFiles = $mediaFiles;
    }

    public function getVersion()
    {
        return $this->version;
    }

    public function setVersion($version)
    {
        return $this->version = $version;
    }

    public function getLibraries()
    {
        return $this->libraries;
    }

    public function setLibraries($libraries)
    {
        if (is_array($libraries)) {
            $this->libraries = $libraries;
        } else {
            throw new InvalidArgumentException('libraries should be an array');
        }
    }

    public function toArray($filterVariableContent = false, &$filtered = [])
    {

        $returnValue = parent::toArray($filterVariableContent, $filtered);

        $returnValue['typeIdentifier'] = $this->typeIdentifier;
        $returnValue['version'] = $this->version;
        $returnValue['properties'] = $this->getArraySerializedPrimitiveCollection(
            $this->getProperties(),
            $filterVariableContent,
            $filtered
        );
        $returnValue['config'] = $this->config;
        $returnValue['modules'] = $this->getArraySerializedPrimitiveCollection(
            $this->getModules(),
            $filterVariableContent,
            $filtered
        );
        $returnValue['xmlns']  = $this->getNamespace()->getUri();

        return $returnValue;
    }

    public static function getTemplateQti()
    {
        return static::getTemplatePath() . 'interactions/qti.imspci.tpl.php';
    }

    protected function getTemplateQtiVariables()
    {

        $variables = parent::getTemplateQtiVariables();
        $variables['typeIdentifier'] = $this->getTypeIdentifier();
        $variables['modules'] = $this->getModules();
        $variables['serializedProperties'] = $this->serializePortableProperties($this->properties);
        $variables['config'] = $this->getConfig();
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
    public function feed(ParserFactory $parser, DOMElement $data, QtiNamespace $xmlns = null)
    {

        $this->setNamespace($xmlns);
        $xmlnsName = $xmlns->getName();

        $pciNodes = $parser->queryXPathChildren(['portableCustomInteraction'], $data, $xmlnsName);
        if (!$pciNodes->length) {
            $xmlnsName = '';//even if a namespace has been defined, it may not be used
            $pciNodes = $parser->queryXPathChildren(['portableCustomInteraction'], $data, $xmlnsName);
        }
        if (!$pciNodes->length) {
            throw new QtiModelException('no ims portableCustomInteraction node found');
        }

        $typeIdentifier = $pciNodes->item(0)->getAttribute('customInteractionTypeIdentifier');
        if (empty($typeIdentifier)) {
            throw new QtiModelException('the type identifier of the pci is missing');
        } else {
            $this->setTypeIdentifier($typeIdentifier);
        }

        $version = $pciNodes->item(0)->getAttribute('data-version');
        if ($version) {
            $this->setVersion($version);
        }

        $rootModulesNodes = $parser->queryXPathChildren(['portableCustomInteraction', 'modules'], $data, $xmlnsName);
        foreach ($rootModulesNodes as $rootModulesNode) {
            $config = [];
            if ($rootModulesNode->getAttribute('primaryConfiguration')) {
                $config[] = $rootModulesNode->getAttribute('primaryConfiguration');
            }
            if ($rootModulesNode->getAttribute('fallbackConfiguration')) {
                $config[] = $rootModulesNode->getAttribute('fallbackConfiguration');
            }
            $this->setConfig($config);
        }

        $moduleNodes = $parser->queryXPathChildren(
            ['portableCustomInteraction', 'modules', 'module'],
            $data,
            $xmlnsName
        );

        foreach ($moduleNodes as $libNode) {
            $id = $libNode->getAttribute('id');
            $paths = [];
            if ($libNode->getAttribute('primaryPath')) {
                $paths[] = $libNode->getAttribute('primaryPath');
            }
            if ($libNode->getAttribute('fallbackPath')) {
                $paths[] = $libNode->getAttribute('fallbackPath');
            }
            $this->addModule($id, $paths);
        }

        $propertyNodes = $parser->queryXPathChildren(['portableCustomInteraction', 'properties'], $data, $xmlnsName);
        if ($propertyNodes->length) {
            $properties = $this->extractProperties($propertyNodes->item(0), $xmlnsName);
            $this->setProperties($properties);
        }

        $markupNodes = $parser->queryXPathChildren(['portableCustomInteraction', 'markup'], $data, $xmlnsName);
        if ($markupNodes->length) {
            $markup = $parser->getBodyData($markupNodes->item(0), true, true);
            $this->setMarkup($markup);
        }
    }
}
