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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import;

use oat\generis\Helper\SystemHelper;
use tao_helpers_form_FormFactory;
use tao_helpers_form_xhtml_Form;
use tao_models_classes_import_CsvUploadForm;

class CsvImportForm extends tao_models_classes_import_CsvUploadForm
{
    public function __construct(array $data = [], array $options = [])
    {
        $options[tao_models_classes_import_CsvUploadForm::IS_OPTION_FIRST_COLUMN_ENABLE] = false;

        parent::__construct($data, $options);
    }

    /**
     * @inheritdoc
     */
    public function initForm()
    {
        $this->form = new tao_helpers_form_xhtml_Form('export');
        $submitElt = tao_helpers_form_FormFactory::getElement('import', 'Free');
        $submitElt->setValue(
            '<a href="#" class="form-submitter btn-success small"><span class="icon-import"></span> ' . __('Import') . '</a>'
        );

        $this->form->setActions([$submitElt], 'bottom');
        $this->form->setActions([], 'top');
    }

    /**
     * @inheritdoc
     */
    public function initElements()
    {
        $fileElt = tao_helpers_form_FormFactory::getElement('source', 'AsyncFile');
        $fileElt->setDescription(__("Add a CSV file"));

        if (isset($_POST['import_sent_csv'])) {
            $fileElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty'));
        } else {
            $fileElt->addValidator(tao_helpers_form_FormFactory::getValidator('NotEmpty', ['message' => '']));
        }

        $fileElt->addValidators(
            [
                tao_helpers_form_FormFactory::getValidator(
                    'FileMimeType',
                    [
                        'mimetype' => [
                            'text/plain',
                            'text/csv',
                            'text/comma-separated-values',
                            'text/anytext',
                            'application/csv',
                            'application/txt',
                            'application/csv-tab-delimited-table',
                            'application/vnd.ms-excel',
                            'application/vnd.msexcel',
                        ],
                        'extension' => ['csv', 'txt']
                    ]
                ),
                tao_helpers_form_FormFactory::getValidator(
                    'FileSize',
                    [
                        'max' => SystemHelper::getFileUploadLimit()
                    ]
                )
            ]
        );

        $this->form->addElement($fileElt);
        $this->form->createGroup(
            'file',
            __(
                'Import item content and metadata from CSV file. Only choice interactions are supported. <a href="%s">[Download sample csv file]</a>',
                '#'
            ),
            [
                'source'
            ]
        );

        $csvSentElt = tao_helpers_form_FormFactory::getElement('import_sent_csv', 'Hidden');
        $csvSentElt->setValue(1);

        $this->form->addElement($csvSentElt);
    }
}
