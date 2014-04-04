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
namespace oat\taoQtiItem\controller\QTIform\response;

use oat\taoQtiItem\controller\QTIform\response\Response;
use oat\taoQtiItem\model\qti\ResponseDeclaration;
use \tao_helpers_form_FormContainer;
use \tao_helpers_form_FormFactory;


/**
 * Short description of class oat\taoQtiItem\controller\QTIform\response\Response
 *
 * @abstract
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 * @see http://www.imsglobal.org/question/qti_v2p0/imsqti_infov2p0.html#element10074
 
 */
abstract class Response
    extends tao_helpers_form_FormContainer
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    /**
     * Short description of attribute response
     *
     * @access protected
     * @var Response
     */
    protected $response = null;

    // --- OPERATIONS ---

    /**
     * Short description of method __construct
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @param  Response response
     */
    public function __construct( ResponseDeclaration $response)
    {
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050BC begin
		
		$this->response = $response;
		$returnValue = parent::__construct(array(), array());
		
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050BC end
    }

    /**
     * Short description of method initForm
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     */
    public function initForm()
    {
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050BF begin
		
		$this->form = tao_helpers_form_FormFactory::getForm('Response_Form');
		
		$saveElt = tao_helpers_form_FormFactory::getElement('save', 'Free');
		$saveElt->setValue("<a href='#' class='response-form-submitter' ><img src='".BASE_WWW."img/qtiAuthoring/update.png'  /> ".__('Save Responses and Feedbacks')."</a>");
		$actions[] = $saveElt;
		
		$this->form->setActions($actions, 'top');
		$this->form->setActions(array(), 'bottom');
			
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050BF end
    }

    /**
     * Short description of method getResponse
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @return oat\taoQtiItem\model\qti\ResponseDeclaration
     */
    public function getResponse()
    {
        $returnValue = null;

        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050C1 begin
		$returnValue = $this->response;
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050C1 end

        return $returnValue;
    }

    /**
     * Short description of method setCommonElements
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @return mixed
     */
    public function setCommonElements()
    {
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050C3 begin
		//serial
		$serialElt = tao_helpers_form_FormFactory::getElement('responseSerial', 'Hidden');
		$serialElt->setValue($this->response->getSerial());
		$this->form->addElement($serialElt);
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050C3 end
    }

} /* end of abstract class oat\taoQtiItem\controller\QTIform\response\Response */

?>