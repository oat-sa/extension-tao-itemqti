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
namespace oat\taoQtiItem\controller\QTIform\response;

use oat\taoQtiItem\controller\QTIform\response\ExtendedtextInteraction;
use oat\taoQtiItem\controller\QTIform\response\StringInteraction;
use \tao_helpers_form_FormFactory;

?>
<?php

error_reporting(E_ALL);

/**
 * TAO - taoItems\actions\QTIform\response\class.ExtendedtextInteraction.php
 *
 * $Id$
 *
 * This file is part of TAO.
 *
 * Automatically generated on 05.01.2011, 11:32:48 with ArgoUML PHP module 
 * (last revised $Date: 2008-04-19 08:22:08 +0200 (Sat, 19 Apr 2008) $)
 *
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 * @subpackage actions_QTIform_response
 */

if (0 > version_compare(PHP_VERSION, '5')) {
    die('This file was generated for PHP 5');
}

/**
 * include oat\taoQtiItem\controller\QTIform\response\StringInteraction
 *
 * @author Sam, <sam@taotesting.com>
 */
require_once('taoQTI/actions/QTIform/response/class.StringInteraction.php');

/* user defined includes */
// section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050DC-includes begin
// section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050DC-includes end

/* user defined constants */
// section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050DC-constants begin
// section 10-13-1-39-643eb156:12d51696e7c:-8000:00000000000050DC-constants end

/**
 * Short description of class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 * @subpackage actions_QTIform_response
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

} /* end of class oat\taoQtiItem\controller\QTIform\response\ExtendedtextInteraction */

?>