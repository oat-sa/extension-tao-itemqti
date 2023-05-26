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

use DOMElement;
use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\QtiNamespace;

/**
 * The QTI custom interaction is a subclass of the main QTI Interaction class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQtiItem
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10401

 */
abstract class CustomInteraction extends Interaction
{
    protected static $qtiTagName = 'customInteraction';

    protected $typeIdentifier = '';//to be set in advance, read only, non editable
    protected $markup = '';

    public function getMarkup()
    {
        return $this->markup;
    }

    public function setMarkup($markup)
    {
        $this->markup = (string) $markup;
    }

    public function toArray($filterVariableContent = false, &$filtered = [])
    {

        $returnValue = parent::toArray($filterVariableContent, $filtered);

        $returnValue['typeIdentifier'] = $this->typeIdentifier;
        $returnValue['markup'] = $this->markup;

        return $returnValue;
    }

    public static function getTemplateQti()
    {
        return static::getTemplatePath() . 'interactions/qti.customInteraction.tpl.php';
    }

    /**
     * @return string
     */
    public function getTypeIdentifier()
    {
        return $this->typeIdentifier;
    }

    public function getProperties()
    {
        return [];
    }

    protected function getTemplateQtiVariables()
    {

        $variables = parent::getTemplateQtiVariables();

        $variables['typeIdentifier'] = $this->typeIdentifier;
        $variables['markup'] = $this->markup;

        return $variables;
    }

    /**
     * Feed the custom interaction model with data from its XML DOM
     *
     * @param ParserFactory $parser
     * @param DOMElement $data - the custom interaction dom element
     * @param string $xmlns (optional) the name space used in inner custom interaction elements
     */
    public function feed(ParserFactory $parser, DOMElement $data, QtiNamespace $xmlns = null)
    {

        $markup = $parser->getBodyData($data->item(0), true);
        $this->setMarkup($markup);
    }
}
