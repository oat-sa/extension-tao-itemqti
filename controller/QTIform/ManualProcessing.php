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
namespace oat\taoQtiItem\controller\QTIform;

use oat\taoQtiItem\controller\QTIform\ManualProcessing;
use oat\taoQtiItem\controller\QTIform\ResponseProcessingOptions;
use oat\taoQtiItem\model\qti\interaction\Interaction;
use oat\taoQtiItem\model\qti\response\ResponseProcessing;
use oat\taoQtiItem\model\qti\OutcomeDeclaration;
use oat\taoQtiItem\model\qti\response\Composite;
use oat\taoQtiItem\model\qti\response\interactionResponseProcessing\None;
use \common_exception_Error;
use \tao_helpers_form_FormFactory;
use \tao_helpers_Uri;
use \taoItems_models_classes_Scale_Discrete;

/**
 * Short description of class oat\taoQtiItem\controller\QTIform\ManualProcessing
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoItems
 
 */
class ManualProcessing
    extends ResponseProcessingOptions
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    /**
     * Short description of attribute outcome
     *
     * @access public
     * @var Outcome
     */
    public $outcome = null;

    // --- OPERATIONS ---

    /**
     * Short description of method __construct
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  Interaction interaction
     * @param  ResponseProcessing responseProcessing
     * @param  Outcome outcome
     * @return mixed
     */
    public function __construct( Interaction $interaction,  ResponseProcessing $responseProcessing,  OutcomeDeclaration $outcome)
    {
        
        $this->outcome = $outcome;
    	if (!$responseProcessing instanceof Composite) {
    		throw new common_exception_Error('Call to manualprocessing form in non-composite mode');
    	}
        parent::__construct($interaction, $responseProcessing);
        
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
        
    	parent::initElements();
    	$irp = $this->responseProcessing->getInteractionResponseProcessing($this->interaction->getResponse());
    	if (!$irp instanceof None) {
    		throw new common_exception_Error('Call to manualprocessing form on a non manual interaction');
    	}

		$serialElt = tao_helpers_form_FormFactory::getElement('outcomeSerial', 'Hidden');
		$serialElt->setValue($this->outcome->getSerial());
		$this->form->addElement($serialElt);

		//guidlines correct:
		$guidelines = tao_helpers_form_FormFactory::getElement('guidelines', 'Textarea');
		$guidelines->setDescription(__('Guidelines'));
		$guidelines->setValue($this->outcome->getAttributeValue('interpretation'));
		$this->form->addElement($guidelines);
		$correct = tao_helpers_form_FormFactory::getElement('correct', 'Textarea');
		$correct->setDescription(__('Correct answer'));
		$responses = $this->interaction->getResponse()->getCorrectResponses();
		$correct->setValue(implode("\n", $responses));
		$this->form->addElement($correct);
		/*
		$default = tao_helpers_form_FormFactory::getElement('defaultValue', 'Textbox');
		$default->setDescription(__('Empty response value'));
		$default->setValue($irp->getDefaultValue());
		$this->form->addElement($default);
		*/
		//scale
		$scale = $this->outcome->getScale();
		$availableOptions = array(
			tao_helpers_Uri::encode(taoItems_models_classes_Scale_Discrete::CLASS_URI) => __('Discrete Scale')
		);
		$scaleTypeElt = tao_helpers_form_FormFactory::getElement('scaletype', 'Combobox');
		$scaleTypeElt->setDescription(__('Scale type'));
		$scaleTypeElt->setEmptyOption(' ');
		$scaleTypeElt->setOptions($availableOptions);
		if (!is_null($scale)) {
			$scaleTypeElt->setValue($scale->getClassUri());
		}
		$this->form->addElement($scaleTypeElt);

		if (!is_null($scale)) {
			if ($scale->getClassUri() == taoItems_models_classes_Scale_Discrete::CLASS_URI) {
				$lowerBoundElt = tao_helpers_form_FormFactory::getElement('min', 'Textbox');
				$lowerBoundElt->setDescription(__('Minimum value'));
				$lowerBoundElt->setValue($scale->lowerBound);
				$lowerBoundElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty'));
				$lowerBoundElt->addValidator(tao_helpers_form_FormFactory::getValidator('Integer', array('min' => 0)));
				$this->form->addElement($lowerBoundElt);

				$upperBoundElt = tao_helpers_form_FormFactory::getElement('max', 'Textbox');
				$upperBoundElt->setDescription(__('Maximum value'));
				$upperBoundElt->setValue($scale->upperBound);
				$upperBoundElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty'));
				$upperBoundElt->addValidator(tao_helpers_form_FormFactory::getValidator('Integer', array('min' => 0, 'integer2_ref' => $lowerBoundElt, 'comparator' => '>')));
				$this->form->addElement($upperBoundElt);

				$distanceElt = tao_helpers_form_FormFactory::getElement('dist', 'Textbox');
				$distanceElt->setDescription(__('Distance'));
				$distanceElt->setValue($scale->distance);
				$distanceElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty'));
				$distanceElt->addValidator(tao_helpers_form_FormFactory::getValidator('Integer', array('min' => 0)));
				$this->form->addElement($distanceElt);
			} else {
				//@todo scale not supported message
			}
		}
		
    }

}