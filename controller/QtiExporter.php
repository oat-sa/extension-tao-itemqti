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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\controller;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;

class QtiExporter extends \tao_actions_CommonModule
{
    use OntologyAwareTrait;

    public function exportItemMetadataByClass()
    {
        if (! $this->hasRequestParameter('id')) {
            throw new \common_exception_BadRequest();
        }

        $uri = $this->getRequestParameter('id');
        $resource = $this->getResource($uri);

        if ($resource->isClass()) {
            $classToExport = $this->getClass($uri);
        } else {
            $classToExport = reset($resource->getTypes());
        }

        if ($classToExport->exists()) {
            /** @var ItemExporter $exporterService */
            $exporterService = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $file = $exporterService->export($classToExport->getUri(), true);
            \common_Logger::i(print_r($file, true));
        }

//        $this->download($file);

//        return;
    }

    public function download(File $file)
    {
//        $tmpDir = \tao_helpers_File::createTempDir();
//        $tmpFile = $tmpDir . uniqid() . '.csv';
//
//        if (($resource = fopen($tmpFile, 'w')) === false) {
//            throw new \common_Exception('Unable to write "' . $file->getPrefix() . '" into tmp folder("' . $tmpFile . '").');
//        }
//        stream_copy_to_stream($file->readStream(), $resource);

        while (ob_get_level() > 0) {
            ob_end_flush();
        }

        header("Content-Type: application/octet-stream");
        header("Content-Transfer-Encoding: Binary");
        header('Content-disposition: attachment; filename="' . $file->getPrefix() .'"');
        echo $file->read();

//        header('Content-Type: ' . $file->getMimeType());
////        header('Content-Length: ' . $file->getSize());
//        header('Content-Disposition: attachment; fileName="' . $file->getPrefix() .'"');
////
//        echo $file->read();exit();
//        \tao_helpers_Http::returnFile($tmpFile);
//        \tao_helpers_File::delTree($tmpDir);
    }
}