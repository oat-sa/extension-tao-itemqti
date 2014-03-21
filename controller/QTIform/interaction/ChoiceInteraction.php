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

namespace oat\taoQtiItem\controller\QTIform\interaction;

use oat\taoQtiItem\controller\QTIform\interaction\ChoiceInteraction;
use oat\taoQtiItem\controller\QTIform\interaction\BlockInteraction;
use oat\taoQtiItem\controller\QTIform\AssessmentItem;

/**
 * Short description of class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 * @see http://www.imsglobal.org/question/qti_v2p0/imsqti_infov2p0.html#element10259
 * @subpackage actions_QTIform_interaction
 */
class ChoiceInteraction
    extends BlockInteraction
{

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
		
		//shuffle element:		
		$this->form->addElement(AssessmentItem::createBooleanElement($interaction, 'shuffle', __('Shuffle choices')));
		
		//the "maxChoices" attr shall be set automatically?
		$this->form->addElement(AssessmentItem::createTextboxElement($interaction, 'maxChoices', __('Maximum selectable choices')));
		
    }

}