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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import;

use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;
use oat\taoQtiItem\model\import\Repository\MetadataRepository;
use oat\taoQtiItem\model\import\Repository\TemplateRepositoryInterface;
use oat\taoQtiItem\model\import\Parser\TemplateHeaderParser;
use oat\taoQtiItem\model\import\Factory\CsvTemplateSampleLineFactory;
use oat\oatbox\service\ConfigurableService;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use oat\generis\model\OntologyAwareTrait;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use common_exception_Error;
use common_exception_MissingParameter;

use function GuzzleHttp\Psr7\stream_for;

class SampleTemplateDownload extends ConfigurableService implements ServiceLocatorAwareInterface
{
    use OntologyAwareTrait;

    private const CSV_SEPARATOR = ';';

    /**
     * @throws common_exception_Error
     */
    public function download(ServerRequestInterface $request, ResponseInterface $response)
    {
        $queryParams = $request->getQueryParams();
        if (!$queryParams['uri']) {
            throw new common_exception_MissingParameter('uri', __METHOD__);
        }
        $uri = $queryParams['uri'];
        $metaDataArray = $this->getMetadataRepository()->findMetadataByClassUri($uri);

        $template = $this->getTemplateRepository()->findById(CsvTemplateRepository::DEFAULT);
        $headers = $this->getTemplateHeaderParser()->parse($template, $metaDataArray);

        $templateSampleLines = $this->getTemplateSampleLines()->createMultiple($template);

        $className = $this->getClassName($uri);
        $filename = $this->getFileName($className);

        $csvContent = $this->getCsvContent($headers, $templateSampleLines);

        return $response
            ->withHeader('Content-Encoding', 'UTF-8')
            ->withHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->withHeader("Content-Disposition", "attachment; filename=" . $filename)
            ->withBody(stream_for($csvContent));
    }

    private function getCsvContent($headers, $templateSampleLines): string
    {
        $extraMetadataColumns = str_repeat(
            self::CSV_SEPARATOR . '""',
            count($headers) - count($templateSampleLines[0])
        );
        $sampleLines = implode(self::CSV_SEPARATOR, $headers) . PHP_EOL;

        foreach ($templateSampleLines as $row) {
            foreach ($row as &$column) {
                $column = '"' . $column . '"';
            }

            $sampleLines .= implode(self::CSV_SEPARATOR, $row) . $extraMetadataColumns . PHP_EOL;
        }

        return $sampleLines;
    }

    private function getFileName(string $className): string
    {
        return 'tabular_template_for_'
            . $className
            . '_'
            . date('YmdHis') . rand(10, 99)
            . '.csv';
    }

    public function getClassName(string $uri): string
    {
        return $this->getClass($uri)->getLabel();
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

    private function getTemplateSampleLines(): CsvTemplateSampleLineFactory
    {
        return $this->getServiceLocator()->get(CsvTemplateSampleLineFactory::class);
    }
}
