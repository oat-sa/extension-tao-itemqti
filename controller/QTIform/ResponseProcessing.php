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
 * 
 */
namespace oat\taoQtiItem\controller\QTIform;

use oat\taoQtiItem\controller\QTIform\ResponseProcessing;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\QtiAuthoringService;
use \tao_helpers_form_FormContainer;
use \tao_helpers_form_FormFactory;
use \Exception;
use \common_Logger;


/**
 * Short description of class oat\taoQtiItem\controller\QTIform\ResponseProcessing
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 
 */
class ResponseProcessing
    extends tao_helpers_form_FormContainer
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    /**
     * Short description of attribute responseProcessing
     *
     * @access protected
     * @var ResponseProcessing
     */
    protected $responseProcessing = null;

    /**
     * Short description of attribute item
     *
     * @access protected
     * @var Item
     */
    protected $item = null;

    /**
     * Short description of attribute processingType
     *
     * @access protected
     * @var string
     */
    protected $processingType = '';

    /**
     * Short description of attribute newAttr
     *
     * @access public
     * @var Integer
     */
    public $newAttr = null;

    // --- OPERATIONS ---

    /**
     * Short description of method __construct
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @param  Item item
     */
    public function __construct( Item $item)
    {
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FD3 begin
		
		$this->item = $item;
		
		$this->responseProcessing = $item->getResponseProcessing();
		parent::__construct();
		
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FD3 end
    }

    /**
     * Short description of method initForm
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     */
    public function initForm()
    {
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FDA begin
		
		$this->form = tao_helpers_form_FormFactory::getForm('ResponseProcessingForm');
		
		$actions = array();
		
		$this->form->setActions(array(), 'top');
		$this->form->setActions($actions, 'bottom');
		
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FDA end
    }

    /**
     * Short description of method initElements
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     */
    public function initElements()
    {
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FDC begin
		
		//add hidden id element, to know what the old id is:
		$itemSerialElt = tao_helpers_form_FormFactory::getElement('itemSerial', 'Hidden');
		$itemSerialElt->setValue($this->item->getSerial());
		$this->form->addElement($itemSerialElt);
		
		//select box:
		$typeElt = tao_helpers_form_FormFactory::getElement('responseProcessingType', 'Combobox');
		$typeElt->setDescription(__('Processing type'));
		
		$qtiAuthoringService = QtiAuthoringService::singleton();
		try{
			$type = $qtiAuthoringService->getResponseProcessingType($this->responseProcessing);
		}catch(Exception $e){
			common_Logger::w('Could not get ResponseProcessingtype: '.$e->getMessage(), array('QTI', 'TAOITEMS'));
		}
		
		if(!empty($type)){
			$this->processingType = $type;//in array('template', 'custom', 'customTemplate')
			$availableOptions = array(
				'composite'	=> __('composite'),
				'templatesdriven'	=> __('template')
			);
			if($type == 'custom'||$type == 'customTemplate'){
				$availableOptions[$type] = __($type);
			}
			$typeElt->setOptions($availableOptions);
			$typeElt->setValue($type);
		}
		$this->form->addElement($typeElt);
		
		//if the type is a custom one, display the rule editor:
		if(false){
			//the rule id element:
			$ruleElt = tao_helpers_form_FormFactory::getElement('customRule', 'Textarea');
			$ruleElt->setDescription(__('Processing rule:'));
			$ruleElt->setValue($this->responseProcessing->getIdentifier());
			$this->form->addElement($ruleElt);
		}
		
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FDC end
    }

    /**
     * Short description of method getResponseProcessing
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @return oat\taoQtiItem\model\qti\response\ResponseProcessing
     */
    public function getResponseProcessing()
    {
        $returnValue = null;

        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FDF begin
		$returnValue = $this->responseProcessing;
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FDF end

        return $returnValue;
    }

    /**
     * Short description of method getProcessingType
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @return string
     */
    public function getProcessingType()
    {
        $returnValue = (string) '';

        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FE2 begin
		$returnValue = $this->processingType;
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:0000000000004FE2 end

        return (string) $returnValue;
    }

} /* end of class oat\taoQtiItem\controller\QTIform\ResponseProcessing */

?>