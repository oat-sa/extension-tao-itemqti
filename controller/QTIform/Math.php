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

use oat\taoQtiItem\controller\QTIform\Math;
use oat\taoQtiItem\model\qti\Math;
use \tao_helpers_form_FormContainer;
use \tao_helpers_form_FormFactory;

/**
 * Short description of class
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoItems
 */
class Math extends tao_helpers_form_FormContainer
{

    public function __construct(Math $math){
        $this->math = $math;
        parent::__construct(array(), array());
    }
    
    /**
     * Short description of method initForm
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     */
    public function initForm()
    {
		$this->form = tao_helpers_form_FormFactory::getForm('Math_Form');
		$this->form->setActions(array(), 'top');
		$this->form->setActions(array(), 'bottom');
    }
    
    /**
     * Short description of method initElements
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     * @return mixed
     */
    public function initElements(){

        $displayElt = tao_helpers_form_FormFactory::getElement('display', 'Radiobox');
        $displayElt->setDescription(__('Display'));
        $displayElt->setOptions(array(
            'inline' => 'inline',
            'block' => 'block'
        ));
        $displayElt->setValue('inline');
        if($this->math->attr('display') == 'block'){
            $displayElt->setValue('block');
        }
        $this->form->addElement($displayElt);

        $authoringElt = tao_helpers_form_FormFactory::getElement('authoring', 'Radiobox');
        $authoringElt->setDescription(__('Editing Mode'));
        $authoringElt->setOptions(array(
            'tex' => 'LaTeX (math)',
            'math' => 'MathML'
        ));
        $authoringElt->setValue('tex');
        $this->form->addElement($authoringElt);

        $mathMLElt = tao_helpers_form_FormFactory::getElement('mathML', 'Textarea');
        $mathMLElt->setDescription('mathML');
        //do not set value here, cause buggy behaviour in brwoser rendering
        $this->form->addElement($mathMLElt);

        $texElt = tao_helpers_form_FormFactory::getElement('tex', 'Textbox');
        $texElt->setDescription('TeX');
        $tex = $this->math->getAnnotation('latex');
        if(!empty($tex)){
            $texElt->setValue($tex);
        }
        $this->form->addElement($texElt);
        
        $mathML = $this->math->getMathML();
        if(!empty($mathML) && empty($tex)){
            $authoringElt->setValue('math');//only case when user should start with mathML editor
        }
    }

}