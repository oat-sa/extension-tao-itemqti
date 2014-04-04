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

use oat\taoQtiItem\controller\QTIform\interaction\UploadInteraction;
use oat\taoQtiItem\controller\QTIform\interaction\BlockInteraction;
use oat\taoQtiItem\controller\QTIform\AssessmentItem;

/**
 * Short description of class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 * @see http://www.imsglobal.org/question/qti_v2p0/imsqti_infov2p0.html#element10350
 
 */
class UploadInteraction
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
     * @return mixed
     */
    public function initElements()
    {
        // section 10-13-1-39--340dbb51:12d5574289f:-8000:0000000000002F7A begin
		parent::setCommonElements();
		$this->form->addElement(AssessmentItem::createTextboxElement($this->getInteraction(), 'mimieType', __('MIME type')));
        // section 10-13-1-39--340dbb51:12d5574289f:-8000:0000000000002F7A end
    }

}