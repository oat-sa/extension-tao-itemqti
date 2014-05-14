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
namespace oat\taoQtiItem\helpers\qti;

use oat\taoQtiItem\helpers\qti\InteractionAuthoring;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\interaction\Interaction;
use oat\taoQtiItem\model\qti\response\TemplatesDriven;
use oat\taoQtiItem\model\qti\response\Composite;
use oat\taoQtiItem\controller\QTIform\ManualProcessing;
use oat\taoQtiItem\model\QtiAuthoringService;
use oat\taoQtiItem\controller\QTIform\Mapping;
use oat\taoQtiItem\model\qti\response\Template;
use \common_Logger;
use \common_exception_Error;

/**
 * Helper to build the Interaction Response Processing Forms
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQTI
 
 */
class InteractionAuthoring
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    // --- OPERATIONS ---

    /**
     * Short description of method getIRPData
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  Item item
     * @param  Interaction interaction
     * @return array
     */
    public static function getIRPData( Item $item,  Interaction $interaction)
    {
        $returnValue = array();

        
		$responseProcessing = $item->getResponseProcessing();
		$response = $interaction->getResponse();
		
		if ($responseProcessing instanceof TemplatesDriven) {
			// templates driven:
			common_Logger::d('template: '.$responseProcessing->getTemplate($response));
			if (InteractionAuthoring::isResponseMappingMode($responseProcessing->getTemplate($response))) {
				$returnValue = self::getMapingRPData($item, $interaction);
			} else {
				$returnValue = self::getCorrectRPData($item, $interaction);
			}
			
		} elseif ($responseProcessing instanceof Composite){
			
			// composite processing
			$irp = $responseProcessing->getInteractionResponseProcessing($interaction->getResponse());
			switch (get_class($irp)) {
				case 'oat\\taoQtiItem\\model\\qti\\response\\interactionResponseProcessing\\None' :
					$returnValue = self::getManualRPData($item, $interaction);
					break;
				case 'oat\\taoQtiItem\\model\\qti\\response\\interactionResponseProcessing\\MatchCorrectTemplate' :
					$returnValue = self::getCorrectRPData($item, $interaction);
					break;
				case 'oat\\taoQtiItem\\model\\qti\\response\\interactionResponseProcessing\\MapResponseTemplate' :
				case 'oat\\taoQtiItem\\model\\qti\\response\\interactionResponseProcessing\\MapResponsePointTemplate' :
					$returnValue = self::getMapingRPData($item, $interaction);
					break;
			}
			
		} else {
			$xhtmlForms[] = '<b>'
				.__('The response form is not available for the selected response processing.<br/>')
				.'</b>';
		}
        

        return (array) $returnValue;
    }

    /**
     * Short description of method getManualRPData
     *
     * @access private
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  Item item
     * @param  Interaction interaction
     * @return core_kernel_classes_Array
     */
    private static function getManualRPData( Item $item,  Interaction $interaction)
    {
        $returnValue = null;

        
        $irp = $item->getResponseProcessing()->getInteractionResponseProcessing($interaction->getResponse());
        $outcome = null;
		foreach ($item->getOutcomes() as $outcomeCandidate) {
			if ($outcomeCandidate == $irp->getOutcome()) {
				$outcome = $outcomeCandidate;
				break; 
			}
		}
		if (is_null($outcome)) {
			throw new common_exception_Error(__('No outcome defined for interaction ').$interaction->getIdentifier());
		}
		$manualForm = new ManualProcessing($interaction, $item->getResponseProcessing(), $outcome);
		if (!is_null($manualForm)) {
			$xhtmlForms[] = $manualForm->getForm()->render();
		}
		$returnValue = array(
			'displayGrid'	=> false,
			'forms'			=> $xhtmlForms
		);
        

        return $returnValue;
    }

    /**
     * Short description of method getMapingRPData
     *
     * @access private
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  Item item
     * @param  Interaction interaction
     * @return array
     */
    private static function getMapingRPData( Item $item,  Interaction $interaction)
    {
        $returnValue = array();

        
        $responseProcessing = $item->getResponseProcessing();
        $service = QtiAuthoringService::singleton();
		$columnModel = $service->getInteractionResponseColumnModel($interaction, $item->getResponseProcessing(), true);
		$responseData = $service->getInteractionResponseData($interaction);
		
		$mappingForm = new Mapping($interaction, $item->getResponseProcessing());
		if (!is_null($mappingForm)) {
			$forms = array($mappingForm->getForm()->render());
		} else {
			common_Logger::w('Could not load qti mapping form', array('QTI', 'TAOITEMS'));
			$forms = array();
		}
		$returnValue = array(
			'displayGrid'	=> true,
			'data'			=> $responseData,
			'colModel'		=> $columnModel,
			'setResponseMappingMode' => true,
			'forms'			=> $forms
		);
        

        return (array) $returnValue;
    }

    /**
     * Short description of method getCorrectRPData
     *
     * @access private
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  Item item
     * @param  Interaction interaction
     * @return array
     */
    private static function getCorrectRPData( Item $item,  Interaction $interaction)
    {
        $returnValue = array();

        
        $service = QtiAuthoringService::singleton();
		$columnModel = $service->getInteractionResponseColumnModel($interaction, $item->getResponseProcessing(), false);
		$responseData = $service->getInteractionResponseData($interaction);
		$returnValue = array(
			'displayGrid'	=> true,
			'data'			=> $responseData,
			'colModel'		=> $columnModel,
			'setResponseMappingMode' => false,
			'forms'			=> array()
		);
        

        return (array) $returnValue;
    }
    
    /**
     * Whenever or not the specified response processing template is 
     * in mapping mode or not
     * 
     * @param string $processingType
     */
	public static function isResponseMappingMode($processingType){
		return in_array($processingType, array(
			Template::MAP_RESPONSE,
			Template::MAP_RESPONSE_POINT
		));
	}

} /* end of class oat\taoQtiItem\helpers\qti\InteractionAuthoring */

?>