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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 * @author Julien Sébire, <julien@taotesting.com>
 */

namespace oat\taoQtiItem\model\Export;

use tao_helpers_form_Form;
use \ZipArchive;
use \DomDocument;
use \core_kernel_classes_Resource;

class QtiPackage30ExportHandler extends QtiPackageExportHandler
{
    /**
     * @return string
     */
    public function getLabel(): string
    {
        return __('QTI Package 3.0');
    }

    /**
     * @param                  $item
     * @param ZipArchive       $zipArchive
     * @param DomDocument|null $manifest
     * @return QTIPackedItem30Exporter|QTIPackedItemExporter
     */
    protected function createExporter($item, ZipArchive $zipArchive, DOMDocument $manifest = null)
    {
        return new QTIPackedItem30Exporter($item, $zipArchive, $manifest);
    }

    public function getExportForm(core_kernel_classes_Resource $resource): tao_helpers_form_Form
    {
        $formData = $this->getFormData($resource);

        return (new Qti30ExportForm($formData))->getForm();
    }
}
