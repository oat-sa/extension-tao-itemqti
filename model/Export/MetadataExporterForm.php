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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\Export;

class MetadataExporterForm extends \tao_helpers_form_FormContainer
{
    /**
     * Create a form
     *
     * @throws \Exception
     * @throws \common_Exception
     */
    public function initForm()
    {
        $this->form = new \tao_helpers_form_xhtml_Form('export');

        $this->form->setDecorators([
            'element' => new \tao_helpers_form_xhtml_TagWrapper(['tag' => 'div']),
            'group' => new \tao_helpers_form_xhtml_TagWrapper(['tag' => 'div', 'cssClass' => 'form-group']),
            'error' => new \tao_helpers_form_xhtml_TagWrapper([
                'tag' => 'div',
                'cssClass' => 'form-error ui-state-error ui-corner-all',
            ]),
            'actions-bottom' => new \tao_helpers_form_xhtml_TagWrapper(['tag' => 'div', 'cssClass' => 'form-toolbar']),
            'actions-top' => new \tao_helpers_form_xhtml_TagWrapper(['tag' => 'div', 'cssClass' => 'form-toolbar'])
        ]);

        $hiddenClassElt = \tao_helpers_form_FormFactory::getElement('xml_desc', 'Hidden');
        $hiddenClassElt->setValue(null);
        $this->form->addElement($hiddenClassElt);
        $hiddenClassElt = \tao_helpers_form_FormFactory::getElement('exportInstance', 'Hidden');
        $hiddenClassElt->setValue(null);
        $this->form->addElement($hiddenClassElt);

        $exportElt = \tao_helpers_form_FormFactory::getElement('export', 'Free');
        $exportElt->setValue(
            '<a href="#" class="form-submitter btn-success small"><span class="icon-export"></span> '
                . __('Export metadata') . '</a>'
        );
        $this->form->setActions([$exportElt], 'bottom');
    }

    /**
     * Init filename field
     *
     * @throws \common_Exception
     */
    public function initElements()
    {
        $date = new \DateTime();
        $filename = 'metadata-' . $date->format('ymd');

        $nameElt = \tao_helpers_form_FormFactory::getElement('filename', 'Textbox');
        $nameElt->setDescription(__('File name'));
        $nameElt->setValue($filename);
        $nameElt->setUnit(".csv");
        $nameElt->addValidator(\tao_helpers_form_FormFactory::getValidator('NotEmpty'));
        $this->form->addElement($nameElt);

        $this->form->createGroup('options', __('Export metadata item'), ['xml_desc', 'filename', 'exportInstance']);
    }
}
