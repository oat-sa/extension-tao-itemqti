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

namespace oat\taoQtiItem\model\qti\response;

use oat\taoQtiItem\model\qti\response\ResponseProcessing;
use oat\taoQtiItem\model\qti\response\Rule;
use \SimpleXMLElement;

/**
 * Short description of class oat\taoQtiItem\model\qti\response\Custom
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQTI

 */
class Custom extends ResponseProcessing implements Rule
{

    /**
     * contains the raw qti rule xml
     *
     * @access protected
     * @var string
     */
    protected $data = '';

    /**
     * Short description of attribute responseRules
     *
     * @access protected
     * @var array
     */
    protected $responseRules = array();

    /**
     * Short description of method getRule
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return string
     */
    public function getRule(){
        $returnValue = (string) '';

        foreach($this->responseRules as $responseRule){
            $returnValue .= $responseRule->getRule();
        }

        return (string) $returnValue;
    }

    /**
     * Short description of method __construct
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  array responseRules
     * @param  string xml
     * @return mixed
     */
    public function __construct($responseRules, $xml){
        $this->responseRules = $responseRules;
        parent::__construct();
        $this->setData($xml, false);
    }

    public function setData($xml){
        $this->data = $xml;
    }

    public function getData(){
        return $this->data;
    }

    /**
     * Short description of method toQTI
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return string
     */
    public function toQTI(){
        return (string) $this->getData();
    }

    public function toArray($filterVariableContent = false, &$filtered = array()){

        $returnValue = parent::toArray($filterVariableContent, $filtered);

        $protectedData = array(
            'processingType' => 'custom',
            'data' => $this->data,
            'responseRules' => $this->parseResponseProcessingXml($this->data)
        );

        if($filterVariableContent){
            $filtered[$this->getSerial()] = $protectedData;
        }else{
            $returnValue = array_merge($returnValue, $protectedData);
        }

        return $returnValue;
    }

    protected function parseElementXml(SimpleXMLElement $xml){

        $attributes = array();
        foreach($xml->attributes() as $name => $value){
            $attributes[$name] = (string) $value;
        }

        $returnValue = array(
            'qtiClass' => $xml->getName()
        );

        if(count($attributes)){
            $returnValue['attributes'] = $attributes;
        }

        return $returnValue;
    }

    protected function parseExpressionXml(SimpleXMLElement $xml){
        $returnValue = $this->parseElementXml($xml);
        $value = trim($xml);
        $expressions = array();
         foreach($xml->children() as $child){
            $expressions[] = $this->parseExpressionXml($child);
        }
        if(count($expressions)){
            $returnValue['expressions'] = $expressions;
        }
        if(strlen($value)){
            $returnValue['value'] = $value;
        }
        return $returnValue;
    }

    protected function parseResponseRuleXml(SimpleXMLElement $xml){
        $returnValue = $this->parseElementXml($xml);
        foreach($xml->children() as $child){
            $returnValue['expression'] = $this->parseExpressionXml($child);
            break;
        }
        return $returnValue;
    }

    protected function parseResponseIfXml(SimpleXMLElement $xml){
        $returnValue = $this->parseElementXml($xml);
        $i = 0;
        $expression = null;
        $responseRules = array();
        foreach($xml->children() as $child){
            if($i){
                $responseRules[] = $this->parseResponseRuleXml($child);
            }else{
                //the first child is the expression
                $expression = $this->parseExpressionXml($child);
            }
            $i++;
        }
        $returnValue['expression'] = $expression;
        $returnValue['responseRules'] = $responseRules;
        return $returnValue;
    }

    protected function parseResponseElseXml(SimpleXMLElement $xml){
        $returnValue = $this->parseElementXml($xml);
        $responseRules = array();
        foreach($xml->children() as $child){
            $responseRules[] = $this->parseResponseRuleXml($child);
        }
        $returnValue['responseRules'] = $responseRules;
        return $returnValue;
    }

    protected function parseResponseConditionXml(SimpleXMLElement $xml){
        $returnValue = $this->parseElementXml($xml);
        foreach($xml->responseIf as $responseIfXml){
            $returnValue['responseIf'] = $this->parseResponseIfXml($responseIfXml);
            break;
        }
        foreach($xml->responseElseIf as $responseIfXml){
            $returnValue['responseElseIf'] = $this->parseResponseIfXml($responseIfXml);
        }
        foreach($xml->responseElse as $responseIfXml){
            $returnValue['responseElse'] = $this->parseResponseElseXml($responseIfXml);
            break;
        }
        return $returnValue;
    }

    protected function parseResponseProcessingXml($xmlStr){

        $xml = simplexml_load_string($xmlStr);
        $returnValue = array();
        if($xml->getName() === 'responseProcessing'){
            foreach($xml->children() as $child){
                $returnValue[] = $this->parseResponseConditionXml($child);
            }
        }else{
            throw new \common_Exception('invalid root element');
        }

        print_r($xml->getName());

        return $returnValue;
    }

}