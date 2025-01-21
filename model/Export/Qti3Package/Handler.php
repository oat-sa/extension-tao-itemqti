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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Export\Qti3Package;

use core_kernel_classes_Resource;
use DOMDocument;
use oat\taoQtiItem\model\Export\QtiPackageExportHandler;
use tao_helpers_form_Form;
use ZipArchive;

class Handler extends QtiPackageExportHandler
{
    public function getLabel(): string
    {
        return __('QTI Package 3.0');
    }


    protected function createExporter($item, ZipArchive $zipArchive, DOMDocument $manifest = null): Exporter
    {
        $factory = $this->getExporterFactory();
        return $factory->create($item, $zipArchive, $manifest);
    }

    public function getExportForm(core_kernel_classes_Resource $resource): tao_helpers_form_Form
    {
        return (new Form($this->getFormData($resource)))->getForm();
    }

    private function getExporterFactory(): ExporterFactory
    {
        return $this->getServiceManager()->getContainer()->get(ExporterFactory::class);
    }
}
