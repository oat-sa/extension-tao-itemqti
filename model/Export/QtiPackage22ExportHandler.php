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
 * 
 */

namespace oat\taoQtiItem\model\Export;

use \ZipArchive;
use \DomDocument;
use core_kernel_classes_Resource;
use core_kernel_classes_Class;

class QtiPackage22ExportHandler extends QtiPackageExportHandler
{

    public function getLabel() {
    	return __('QTI Package 2.2');
    }

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_export_ExportHandler::getExportForm()
     */
    public function getExportForm(core_kernel_classes_Resource $resource) {
        if ($resource instanceof core_kernel_classes_Class) {
            $formData= array('class' => $resource);
        } else {
            $formData= array('instance' => $resource);
        }

        $formData['title'] = __('Export QTI 2.2 Package');

        $form = new ExportForm($formData);
        return $form->getForm();
    }


    protected function createExporter($item, ZipArchive $zipArchive, DOMDocument $manifest = null)
    {
        return new QTIPackedItem22Exporter($item, $zipArchive, $manifest);
    }
}
