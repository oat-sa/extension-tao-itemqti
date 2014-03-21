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
 * Copyright (c) 2013 (original work) Open Assessment Techonologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */
namespace oat\taoQtiItem\controller\QTIform;

use oat\taoQtiItem\controller\QTIform\CompositeResponseOptions;
use oat\taoQtiItem\model\qti\response\ResponseProcessing;
use oat\taoQtiItem\model\qti\ResponseDeclaration;
use oat\taoQtiItem\model\qti\response\interactionResponseProcessing\MatchCorrectTemplate;
use oat\taoQtiItem\model\qti\response\interactionResponseProcessing\MapResponsePointTemplate;
use oat\taoQtiItem\model\qti\response\interactionResponseProcessing\MapResponseTemplate;
use oat\taoQtiItem\model\qti\response\interactionResponseProcessing\Custom;
use \tao_helpers_form_FormContainer;
use \tao_helpers_form_FormFactory;

/**
 * Short description of class oat\taoQtiItem\controller\QTIform\CompositeResponseOptions
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoItems
 * @subpackage actions_QTIform
 */
class CompositeResponseOptions
    extends tao_helpers_form_FormContainer
{

    /**
     * Short description of attribute responseProcessing
     *
     * @access public
     * @var ResponseProcessing
     */
    public $responseProcessing = null;

    /**
     * Short description of attribute response
     *
     * @access public
     * @var ResponseDeclaration
     */
    public $response = null;

    /**
     * Short description of method __construct
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  ResponseProcessing responseProcessing
     * @param  Response response
     * @return mixed
     */
    public function __construct( ResponseProcessing $responseProcessing,  ResponseDeclaration $response)
    {
		$this->responseProcessing = $responseProcessing;
        $this->response = $response;
        parent::__construct();
    }

    /**
     * Short description of method initForm
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return mixed
     */
    public function initForm()
    {
        $this->form = tao_helpers_form_FormFactory::getForm('InteractionResponseProcessingForm');
		$this->form->setActions(array(), 'bottom');
    }

    /**
     * Short description of method initElements
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return mixed
     */
    public function initElements()
    {
        $rpElt = tao_helpers_form_FormFactory::getElement('responseprocessingSerial', 'Hidden');
		$rpElt->setValue($this->responseProcessing->getSerial());
		$this->form->addElement($rpElt);
		
    	$serialElt = tao_helpers_form_FormFactory::getElement('responseSerial', 'Hidden');
		$serialElt->setValue($this->response->getSerial());
		$this->form->addElement($serialElt);
    	
		$currentClass = get_class($this->responseProcessing->getInteractionResponseProcessing($this->response));
		$currentIRP = $currentClass::CLASS_ID;
		
		$irps = array(
			MatchCorrectTemplate::CLASS_ID => __('correct'),
		);
		
		$interaction = $this->response->getAssociatedInteraction();
		if(!is_null($interaction)){
			switch(strtolower($interaction->getType())){
				case 'order':
				case 'graphicorder':{
					break;
				}
				case 'selectpoint';
				case 'positionobject':{
					$irps[MapResponsePointTemplate::CLASS_ID] = __('map point');
					break;
				}
				default:{
					$irps[MapResponseTemplate::CLASS_ID] = __('map');
				}
			}
		}
		
		if ($currentIRP == Custom::CLASS_ID) {
			$irps[Custom::CLASS_ID] = __('custom');			
		}
		
		$InteractionResponseProcessing = tao_helpers_form_FormFactory::getElement('interactionResponseProcessing', 'Combobox');
		$InteractionResponseProcessing->setDescription(__('Processing type'));
		$InteractionResponseProcessing->setOptions($irps);
		$InteractionResponseProcessing->setValue($currentIRP);
		$this->form->addElement($InteractionResponseProcessing);
    }

}