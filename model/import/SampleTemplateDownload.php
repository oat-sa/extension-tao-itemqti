<?php

/**
 * DownloadSampleCsv Controller provide actions to download sample CSV
 *
 * @author Chinnu Francis - TAO Team - {@link http://www.tao.lu}
 * @package taoQtiItem
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
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
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use function GuzzleHttp\Psr7\stream_for;
use common_exception_Error;
use common_exception_MissingParameter;

class SampleTemplateDownload extends ConfigurableService implements ServiceLocatorAwareInterface
{
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

        $templateSampleLines = $this->getTemplateSampleLines()->getSampleLines($template);

        $className = $this->getMetadataRepository()->getClassName($uri);
        $filename = $this->getFileName($className);

        $csvContent = $this->getCsvContent($headers, $templateSampleLines);
        return $response
            ->withHeader('Content-Type', 'text/csv')
            ->withHeader("Content-Disposition", "attachment; filename=" . $filename)
            ->withBody(stream_for($csvContent));
    }

    private function getCsvContent($headers, $templateSampleLines): string
    {
        $file = fopen('php://temp', 'rw');
        fputcsv($file, $headers);
        foreach ($templateSampleLines as $row) {
            fputcsv($file, $row);
        }
        rewind($file);
        $csvContent = stream_get_contents($file);
        fclose($file);
        return $csvContent;
    }

    private function getFileName($className): string
    {
        return 'tablular_template_for_'
            . $className
            . '_'
            . date('YmdHis') . rand(10, 99)
            . '.csv';
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
