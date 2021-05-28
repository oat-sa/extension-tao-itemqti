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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiItem\controller;

use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;
use oat\taoQtiItem\model\import\Repository\MetadataRepository;
use oat\taoQtiItem\model\import\Repository\TemplateRepositoryInterface;
use oat\taoQtiItem\model\import\Parser\TemplateHeaderParser;
use oat\taoQtiItem\model\import\Factory\CsvTemplateSampleLineFactory;
use tao_actions_CommonModule;
use common_exception_Error;
use common_exception_MissingParameter;
use SPLTempFileObject;

/**
 * DownloadSampleCsv Controller provide actions to download sample CSV
 *
 * @author Chinnu Francis - TAO Team - {@link http://www.tao.lu}
 * @package taoQtiItem

 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class DownloadSampleTemplate extends tao_actions_CommonModule
{
    /**
     * @throws common_exception_Error
     */
    public function downloadCsv()
    {
        if (!$this->hasRequestParameter('uri')) {
            throw new common_exception_MissingParameter('uri', __METHOD__);
        }

        $metaDataArray = $this->getMetadataRepository()->findMetadataByClassUri($this->getRequestParameter('uri'));

        $template = $this->getTemplateRepository()->findById(CsvTemplateRepository::DEFAULT);

        $headers  = $this->getTemplateHeaderParser()->parse($template, $metaDataArray);
        
        $templateSampleLines  = CsvTemplateSampleLineFactory::getSampleLines($template);
        
        $filename   = $this->getFileName();
        $stream = $this->getFileStream($headers, $templateSampleLines);
        
        return $this->getPsrResponse()
            ->withHeader('Content-Type', 'text/csv')
            ->withHeader("Content-Disposition", "attachment; filename=" . $filename)
            ->withBody(\GuzzleHttp\Psr7\stream_for($stream));
    }

    /**
     * Get file name
     * @return string
     */
    private function getFileName()
    {
        return 'input_sample'
            . '_'
            . date('YmdHis') . rand(10, 99) //more unique name
            . '.csv';
    }

    private function getFileStream($headers, $templateSampleLines)
    {
        $file = new SPLTempFileObject();
        $file->fputcsv($headers);
        foreach ($templateSampleLines as $row) {
            $file->fputcsv($row);
        }
        $file->rewind();
        $exportData = '';
        while (!$file->eof()) {
            $exportData .= $file->fgets();
        }
        return trim($exportData);
    }

    private function getMetadataRepository(): MetadataRepository
    {
        return $this->getServiceLocator()->get(MetadataRepository::class);
    }

    private function getTemplateHeaderParser(): TemplateHeaderParser
    {
        return $this->getServiceLocator()->get(TemplateHeaderParser::class);
    }

    private function getTemplateRepository(): TemplateRepositoryInterface
    {
        return $this->getServiceLocator()->get(CsvTemplateRepository::class);
    }
}
