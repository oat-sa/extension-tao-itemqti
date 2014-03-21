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
namespace oat\taoQtiItem\model\qti\response\interactionResponseProcessing;

use oat\taoQtiItem\model\qti\response\interactionResponseProcessing\MatchCorrectTemplate;
use oat\taoQtiItem\model\qti\response\interactionResponseProcessing\Template;

/**
 * Short description of class
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQTI
 * @subpackage models_classes_QTI_response_interactionResponseProcessing
 */
class MatchCorrectTemplate
    extends Template
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    /**
     * Short description of attribute CLASS_ID
     *
     * @access public
     * @var string
     */
    const CLASS_ID = 'correct';

    // --- OPERATIONS ---

    /**
     * Short description of method getRule
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return string
     */
    public function getRule()
    {
        $returnValue = (string) '';

        // section 127-0-1-1-786830e4:134f066fb13:-8000:0000000000009011 begin
        $returnValue = 'if(match(null, '.
        	'getResponse("'.$this->getResponse()->getIdentifier().'"), '.
        	'getCorrect("'.$this->getResponse()->getIdentifier().'"))) '.
        	'setOutcomeValue("'.$this->getOutcome()->getIdentifier().'", 1); '.
        	'else setOutcomeValue("'.$this->getOutcome()->getIdentifier().'", 0);';
        // section 127-0-1-1-786830e4:134f066fb13:-8000:0000000000009011 end

        return (string) $returnValue;
    }

    /**
     * Short description of method toQTI
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @return string
     */
    public function toQTI()
    {
        $returnValue = (string) '';

        // section 127-0-1-1-4c0a0972:134fa47975d:-8000:0000000000003628 begin
        $returnValue = '<responseCondition>
		    <responseIf>
		        <match>
		            <variable identifier="'.$this->getResponse()->getIdentifier().'" />
		            <correct identifier="'.$this->getResponse()->getIdentifier().'" />
		        </match>
		        <setOutcomeValue identifier="'.$this->getOutcome()->getIdentifier().'">
	                <baseValue baseType="integer">1</baseValue>
		        </setOutcomeValue>
		    </responseIf>
		</responseCondition>';
        // section 127-0-1-1-4c0a0972:134fa47975d:-8000:0000000000003628 end

        return (string) $returnValue;
    }

} /* end of class oat\taoQtiItem\model\qti\response\interactionResponseProcessing\MatchCorrectTemplate */

?>