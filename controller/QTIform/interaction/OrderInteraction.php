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
namespace oat\taoQtiItem\controller\QTIform\interaction;

use oat\taoQtiItem\controller\QTIform\interaction\OrderInteraction;
use oat\taoQtiItem\controller\QTIform\interaction\BlockInteraction;
use oat\taoQtiItem\controller\QTIform\AssessmentItem;
use \tao_helpers_form_FormFactory;

/**
 * Short description of class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 * @see http://www.imsglobal.org/question/qti_v2p0/imsqti_infov2p0.html#element10263
 
 */
class OrderInteraction
    extends BlockInteraction
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    // --- OPERATIONS ---

    /**
     * Short description of method initElements
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     */
    public function initElements()
    {
        
		
		$interaction = $this->getInteraction();
		
		parent::setCommonElements();
				
		$this->form->addElement(AssessmentItem::createBooleanElement($interaction, 'shuffle', __('Shuffle choices')));
		
		//the "orientation" attr:
		$orientationElt = tao_helpers_form_FormFactory::getElement('orientation', 'Combobox');
		$orientationElt->setDescription(__('Orientation'));
		$orientationElt->setOptions(array(
			'vertical' => __('vertical'),
			'horizontal' => __('horizontal')
		));
		$orientation = $interaction->getAttributeValue('orientation');
		if(!empty($orientation)){
			if($orientation === 'vertical' || $orientation === 'horizontal'){
				$orientationElt->setValue($orientation);
			}
		}
		$this->form->addElement($orientationElt);
		
        
    }

}