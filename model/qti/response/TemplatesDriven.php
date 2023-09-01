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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\response;

use oat\taoQtiItem\model\qti\response\ResponseProcessing;
use oat\taoQtiItem\model\qti\response\Rule;
use oat\taoQtiItem\model\qti\response\Template;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\OutcomeDeclaration;
use oat\taoQtiItem\model\qti\response\TakeoverFailedException;
use oat\taoQtiItem\model\qti\ResponseDeclaration;
use oat\taoQtiItem\model\qti\interaction\Interaction;
use oat\taoQtiItem\controller\QTIform\TemplatesDrivenResponseOptions;
use oat\taoQtiItem\helpers\QtiSerializer;
use common_exception_Error;
use taoItems_models_classes_TemplateRenderer;

/**
 * Response processing similar to the QTI templates, but with
 * support for multiple interactions
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQTI
 */
class TemplatesDriven extends ResponseProcessing implements Rule
{
    /**
     * Short description of method getRule
     *
     * @deprecated now using new qtism lib for response processing
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return string
     */
    public function getRule()
    {
        throw new common_exception_Error('please use buildRule for templateDriven instead');
    }

    /**
     * Short description of method isSupportedTemplate
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param string uri
     * @deprecated
     * @return taoQTI_models_classes_Matching_bool
     */
    public static function isSupportedTemplate($uri)
    {
        $mythoMap = [
            Template::MATCH_CORRECT,
            Template::MAP_RESPONSE,
            Template::MAP_RESPONSE_POINT,
            Template::NONE
        ];

        $returnValue = in_array($uri, $mythoMap);

        return (bool) $returnValue;
    }

    /**
     * Short description of method create
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param
     *            Item item
     * @return oat\taoQtiItem\model\qti\response\ResponseProcessing
     */
    public static function create(Item $item)
    {
        $returnValue = new TemplatesDriven();
        if (count($item->getOutcomes()) == 0) {
            $item->setOutcomes([
                new OutcomeDeclaration([
                    'identifier' => 'SCORE',
                    'baseType' => 'float',
                    'cardinality' => 'single'
                ])
            ]);
        }
        foreach ($item->getInteractions() as $interaction) {
            $returnValue->setTemplate($interaction->getResponse(), Template::MATCH_CORRECT);
        }

        return $returnValue;
    }

    /**
     * Short description of method takeOverFrom
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param
     *            ResponseProcessing responseProcessing
     * @param
     *            Item item
     * @return oat\taoQtiItem\model\qti\response\ResponseProcessing
     */
    public static function takeOverFrom(ResponseProcessing $responseProcessing, Item $item)
    {
        $returnValue = null;

        if ($responseProcessing instanceof self) {
            return $responseProcessing;
        }

        if ($responseProcessing instanceof Template) {
            $returnValue = new TemplatesDriven();
            // theoretic only interaction 'RESPONSE' should be considered
            foreach ($item->getInteractions() as $interaction) {
                $returnValue->setTemplate($interaction->getResponse(), $responseProcessing->getUri());
            }
            $returnValue->setRelatedItem($item);
        } else {
            throw new TakeoverFailedException();
        }

        return $returnValue;
    }

    /**
     * Short description of method setTemplate
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param
     *            Response response
     * @param
     *            string template
     * @return boolean
     */
    public function setTemplate(ResponseDeclaration $response, $template)
    {
        $response->setHowMatch($template);
        $returnValue = true;

        return (bool) $returnValue;
    }

    /**
     * Short description of method getTemplate
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param
     *            Response response
     * @return string
     */
    public function getTemplate(ResponseDeclaration $response)
    {
        return (string) $response->getHowMatch();
    }

    /**
     * Short description of method takeNoticeOfAddedInteraction
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param
     *            Interaction interaction
     * @param
     *            Item item
     * @return mixed
     */
    public function takeNoticeOfAddedInteraction(Interaction $interaction, Item $item)
    {
        $interaction->getResponse()->setHowMatch(Template::MATCH_CORRECT);
    }

    /**
     * Short description of method takeNoticeOfRemovedInteraction
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param
     *            Interaction interaction
     * @param
     *            Item item
     * @return mixed
     */
    public function takeNoticeOfRemovedInteraction(Interaction $interaction, Item $item)
    {
    }

    /**
     * Short description of method getForm
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param
     *            Response response
     * @return tao_helpers_form_Form
     */
    public function getForm(ResponseDeclaration $response)
    {
        $formContainer = new TemplatesDrivenResponseOptions($this, $response);
        $returnValue = $formContainer->getForm();

        return $returnValue;
    }

    /**
     * Short description of method buildQTI
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return string
     */
    public function buildQTI()
    {
        $template = $this->convertToTemplate();
        if (! is_null($template)) {
            // if the TemplateDriven rp is convertible to a Template, render that template
            return $template->toQTI();
        }

        $returnValue = "<responseProcessing>";
        $interactions = $this->getRelatedItem()->getInteractions();

        foreach ($interactions as $interaction) {
            $response = $interaction->getResponse();
            $uri = $response->getHowMatch();
            $matchingTemplate = $this->getResponseProcessingTemplate($uri);
            $tplRenderer = new taoItems_models_classes_TemplateRenderer($matchingTemplate, [
                'responseIdentifier' => $response->getIdentifier(),
                'outcomeIdentifier' => 'SCORE'
            ]);
            $returnValue .= $tplRenderer->render();

            // add simple feedback rules:
            foreach ($response->getFeedbackRules() as $rule) {
                $returnValue .= $rule->toQTI();
            }
        }
        $returnValue .= "</responseProcessing>";

        return (string) $returnValue;
    }

    protected function getResponseProcessingTemplate($templateUri)
    {
        if ($templateUri === Template::NONE) {
            $matchingTemplate = dirname(__FILE__) . '/rpTemplate/qti.none.tpl.php';
        } else {
            $templateName = substr($templateUri, strrpos($templateUri, '/') + 1);
            $matchingTemplate = dirname(__FILE__) . '/rpTemplate/qti.' . $templateName . '.tpl.php';
        }
        return $matchingTemplate;
    }

    /**
     * Short description of method toQTI
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return string
     */
    public function toQTI()
    {
        throw new common_exception_Error('please use buildQTI for templateDriven instead');
    }

    /**
     * Convert the TemplateDriven instance into a Template instance if it is possible
     * Returns null otherwise.
     *
     * @return \oat\taoQtiItem\model\qti\response\Template
     */
    protected function convertToTemplate()
    {
        $returnValue = null;
        $interactions = $this->getRelatedItem()->getInteractions();

        if (count($interactions) == 1) {
            $interaction = reset($interactions);
            // check if the unique interaction has the right responseIdentifier RESPONSE
            if ($interaction->attr('responseIdentifier') === 'RESPONSE') {
                $response = $interaction->getResponse();
                if (count($response->getFeedbackRules()) == 0) {
                    $uri = $response->getHowMatch();
                    $returnValue = new Template($uri);
                }
            }
        }
        return $returnValue;
    }

    public function toArray($filterVariableContent = false, &$filtered = [])
    {
        $returnValue = parent::toArray($filterVariableContent, $filtered);
        $rp = null;
        $responseRules = [];
        $template = $this->convertToTemplate();

        if (is_null($template)) {
            // cannot be converted into a Template instance, so build the rp from the current instance
            $rp = $this->buildQTI();
        } else {
            // can be converted into a Template instance, so get the Template content
            $rp = $template->getTemplateContent();
        }
        if (!empty(trim($rp))) {
            $rpSerialized = QtiSerializer::parseResponseProcessingXml(simplexml_load_string($rp));
            $responseRules = $rpSerialized['responseRules'];
        }

        $protectedData = [
            'processingType' => 'templateDriven',
            'responseRules' => $responseRules
        ];

        if ($filterVariableContent) {
            $filtered[$this->getSerial()] = $protectedData;
        } else {
            $returnValue = array_merge($returnValue, $protectedData);
        }

        return $returnValue;
    }

    protected function getUsedAttributes()
    {
        return [];
    }
}
