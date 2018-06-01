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
 * Copyright (c) 2013-2018 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

namespace oat\taoQtiItem\model\qti\response;

use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\exception\TemplateException;
use oat\taoQtiItem\helpers\QtiSerializer;
use \taoItems_models_classes_TemplateRenderer;

/**
 * Short description of class oat\taoQtiItem\model\qti\response\Template
 *
 * @access public
 * @author Cedric Alfonsi, <cedric.alfonsi@tudor.lu>
 * @package taoQTI

 */
class Template extends ResponseProcessing implements Rule
{

    /**
     * QTI 2.1 Match Correct RP Template URL.
     *
     * @var string
     */
    const MATCH_CORRECT = 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct';

    /**
     * QTI 2.1 Map Response RP Template URL.
     *
     * @var string
     */
    const MAP_RESPONSE = 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response';

    /**
     * QTI 2.1 Map Response Point RP Template URL.
     *
     * @var string
     */
    const MAP_RESPONSE_POINT = 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point';

    /**
     * QTI 2.0 Match Correct RP Template URL.
     *
     * @var string
     */
    const MATCH_CORRECT_qtiv2p0 = 'http://www.imsglobal.org/question/qti_v2p0/rptemplates/match_correct';

    /**
     * QTI 2.0 Map Response RP Template URL.
     *
     * @var string
     */
    const MAP_RESPONSE_qtiv2p0 = 'http://www.imsglobal.org/question/qti_v2p0/rptemplates/map_response';

    /**
     * QTI 2.0 Map Response Point RP Template URL.
     *
     * @var string
     */
    const MAP_RESPONSE_POINT_qtiv2p0 = 'http://www.imsglobal.org/question/qti_v2p0/rptemplates/map_response_point';

    /**
     * QTI 2.2 Match Correct RP Template URL.
     *
     * @var string
     */
    const MATCH_CORRECT_qtiv2p2 = 'http://www.imsglobal.org/question/qti_v2p2/rptemplates/match_correct';
    
    /**
     * QTI 2.2 Map Response RP Template URL.
     *
     * @var string
     */
    const MAP_RESPONSE_qtiv2p2 = 'http://www.imsglobal.org/question/qti_v2p2/rptemplates/map_response';
    
    /**
     * QTI 2.2 Map Response Point RP Template URL.
     *
     * @var string
     */
    const MAP_RESPONSE_POINT_qtiv2p2 = 'http://www.imsglobal.org/question/qti_v2p2/rptemplates/map_response_point';

    /**
     * Template to apply when no response processing should take place
     */
    const NONE = 'no_response_processing';

    /**
     * Short description of attribute uri
     *
     * @access protected
     * @var string
     */
    protected $uri = '';

    /**
     * Short description of attribute file
     *
     * @access protected
     * @var string
     */
    protected $file = '';

    /**
     * Short description of method getRule
     *
     * @access public
     * @author Cedric Alfonsi, <cedric.alfonsi@tudor.lu>
     * @return string
     */
    public function getRule(){
        $returnValue = (string) '';


        if($this->uri == self::MATCH_CORRECT){
            $returnValue = taoQTI_models_classes_Matching_Matching::MATCH_CORRECT;
        }else if($this->uri == self::MAP_RESPONSE){
            $returnValue = taoQTI_models_classes_Matching_Matching::MAP_RESPONSE;
        }else if($this->uri == self::MAP_RESPONSE_POINT){
            $returnValue = taoQTI_models_classes_Matching_Matching::MAP_RESPONSE_POINT;
        }



        return (string) $returnValue;
    }
    
    /**
     * Get the content of the response processing template identified by its uri
     * 
     * @todo make it dynamic in the future
     * @return string
     * @throws \oat\taoQtiItem\model\qti\exception\QtiModelException
     */
    public function getTemplateContent(){

        $standardRpTemplateFolder = dirname(__FILE__).'/../data/qtiv2p1/rptemplates/';
        switch($this->uri){
            case self::MATCH_CORRECT:
                $returnValue = file_get_contents($standardRpTemplateFolder.'match_correct.xml');
                break;
            case self::MAP_RESPONSE:
                $returnValue = file_get_contents($standardRpTemplateFolder.'map_response.xml');
                break;
            case self::MAP_RESPONSE_POINT:
                $returnValue = file_get_contents($standardRpTemplateFolder.'map_response_point.xml');
                break;
            case self::NONE:
                $returnValue = '';
                break;
            default:
                throw new QtiModelException('unknown rp template');
        }
        return $returnValue;
    }

    /**
     * Short description of method __construct
     *
     * @access public
     * @author Cedric Alfonsi, <cedric.alfonsi@tudor.lu>
     * @param  string uri
     * @throws QtiModelException
     * @throws TemplateException
     */
    public function __construct($uri){
        //automatically transform to qti 2.1 templates:
        switch($uri){
            case self::MATCH_CORRECT:
            case self::MATCH_CORRECT_qtiv2p0:
            case self::MATCH_CORRECT_qtiv2p2:
                $this->uri = self::MATCH_CORRECT;
                break;
            case self::MAP_RESPONSE:
            case self::MAP_RESPONSE_qtiv2p0:
            case self::MAP_RESPONSE_qtiv2p2:
                $this->uri = self::MAP_RESPONSE;
                break;
            case self::MAP_RESPONSE_POINT:
            case self::MAP_RESPONSE_POINT_qtiv2p0:
            case self::MAP_RESPONSE_POINT_qtiv2p2:
                $this->uri = self::MAP_RESPONSE_POINT;
                break;
            case self::NONE;
                $this->uri = self::NONE;
                break;
            default:
                throw new TemplateException("Unknown response processing template '$uri'");
        }

        parent::__construct();
    }

    /**
     * Short description of method toQTI
     *
     * @access public
     * @author Cedric Alfonsi, <cedric.alfonsi@tudor.lu>
     * @return string
     */
    public function toQTI(){

        $returnValue = '';

        if($this->uri != self::NONE){
            //if there is actually a real response template involved, render the template
            $tplRenderer = new taoItems_models_classes_TemplateRenderer(static::getTemplatePath().'/qti.rptemplate.tpl.php', array('uri' => $this->uri));
            $returnValue = $tplRenderer->render();
        }

        return (string) $returnValue;
    }

    /**
     * Short description of method getUri
     *
     * @access public
     * @author Cedric Alfonsi, <cedric.alfonsi@tudor.lu>
     * @return string
     */
    public function getUri(){
        return (string) $this->uri;
    }

    public function toArray($filterVariableContent = false, &$filtered = array()){

        $returnValue = parent::toArray($filterVariableContent, $filtered);
        $rp = $this->getTemplateContent();
        $rpSerialized = QtiSerializer::parseResponseProcessingXml(simplexml_load_string($rp));
        $protectedData = array(
            'processingType' => 'template',
            'data' => $this->uri,
            'responseRules' => $rpSerialized['responseRules']
        );

        if($filterVariableContent){
            $filtered[$this->getSerial()] = $protectedData;
        }else{
            $returnValue = array_merge($returnValue, $protectedData);
        }

        return $returnValue;
    }

    protected function getUsedAttributes(){
        return array();
    }

}
