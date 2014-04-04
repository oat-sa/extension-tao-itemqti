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
namespace oat\taoQtiItem\controller\QTIform\response;

use oat\taoQtiItem\controller\QTIform\response\ExtendedtextInteraction;
use oat\taoQtiItem\controller\QTIform\response\StringInteraction;
use \tao_helpers_form_FormFactory;

/**
 * Short description of class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 
 */
class ExtendedtextInteraction
    extends StringInteraction
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    // --- OPERATIONS ---

    /**
     * Short description of method initElements
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @return mixed
     */
    public function initElements()
    {
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050DD begin
		
		parent::setCommonElements();
		
		//the fixed attribute element
		$orderedCardinalityElt = tao_helpers_form_FormFactory::getElement('ordered', 'Radiobox');
		$orderedCardinalityElt->setDescription(__('Ordered response'));
		$orderedCardinalityElt->setOptions(array(0 => __('no'), 1 => __('yes')));
		$orderedCardinalityElt->setValue(0);
		$cardinality = $this->response->getAttributeValue('cardinality');
		if(!empty($cardinality)){
			if($cardinality == 'ordered'){
				$orderedCardinalityElt->setValue(1);
			}
		}
		$this->form->addElement($orderedCardinalityElt);
		
        // section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050DD end
    }

}