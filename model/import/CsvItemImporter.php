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

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\log\LoggerAwareTrait;
use oat\taoQtiItem\model\import\Report\ReportBuilder;
use Throwable;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use oat\oatbox\PhpSerializeStateless;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\import\Parser\Exception\InvalidCsvImportException;
use oat\taoQtiItem\model\import\Report\ErrorReportFormatter;
use oat\taoQtiItem\model\import\Report\WarningReportFormatter;
use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;
use oat\taoQtiItem\model\import\Repository\TemplateRepositoryInterface;
use oat\tao\model\import\ImportHandlerHelperTrait;
use oat\tao\model\import\TaskParameterProviderInterface;
use tao_models_classes_import_ImportHandler;
use Psr\Http\Message\ServerRequestInterface;

class CsvItemImporter implements
    tao_models_classes_import_ImportHandler,
    ServiceLocatorAwareInterface,
    TaskParameterProviderInterface
{
    use LoggerAwareTrait;
    use OntologyAwareTrait;
    use PhpSerializeStateless;
    use EventManagerAwareTrait;
    use ImportHandlerHelperTrait {
        getTaskParameters as getDefaultTaskParameters;
    }

    public function __construct(ServerRequestInterface $request)
    {
        $this->request = $request;
    }

    /**
     * @inheritdoc
     */
    public function getLabel()
    {
        return __('CSV content + metadata');
    }

    /**
     * @inheritdoc
     */
    public function getForm()
    {
        $form = new CsvImportForm([], [
            'classUri' => $this->request->getParsedBody()['classUri']
        ]);

        return $form->getForm();
    }

    /**
     * @inheritdoc
     */
    public function import($class, $form, $userId = null)
    {
        try {
            $uploadedFile = $this->fetchUploadedFile($form);
            $reportBuilder = $this->getReportBuilder();
            $template = $this->getTemplateRepository()->findById(CsvTemplateRepository::DEFAULT);

            $importerResults = $this->getCsvImporter()->import($uploadedFile, $template, $class);

            $reportTitle = $reportBuilder->getReportTitle($importerResults);
            $report = $reportBuilder->buildReportsContainer($reportTitle, $reportTitle, $importerResults, $importerResults->getFirstItem());
        } catch (InvalidCsvImportException $e) {
            $missingHeaders = implode(', ', $e->getMissingHeaderColumns());
            $errorMessage = __('CSV import failed: required columns are missing (%s)', $missingHeaders);
            $report = $reportBuilder->buildReportsContainer(__('CSV import failed'), $errorMessage);
            $this->getLogger()->warning($errorMessage);
        } catch (Throwable $e) {
            $errorMessage = __(
                'An unexpected error occurred during the CSV import. The system returned the following error: "%s"',
                $e->getMessage()
            );
            $this->getLogger()->warning($errorMessage);
            $report = $reportBuilder->buildReportsContainer(__('CSV import failed'), $errorMessage);
        } finally {
            if (isset($importerResults)) {
                $warningParsingReport = $importerResults->getWarningReports();
                $errorParsingReport = $importerResults->getErrorReports();
                if (!empty($warningParsingReport)) {
                    $report->add($this->getWarningReportFormatter()->format($warningParsingReport));
                }
                if (!empty($errorParsingReport)) {
                    $report->add($this->getErrorReportFormatter()->format($errorParsingReport));
                }
            }
            if (isset($uploadedFile)) {
                $this->getUploadService()->remove($uploadedFile);
            }
        }

        return $report;
    }

    private function getTemplateRepository(): TemplateRepositoryInterface
    {
        return $this->getServiceLocator()->get(CsvTemplateRepository::class);
    }

    private function getWarningReportFormatter(): WarningReportFormatter
    {
        return $this->getServiceLocator()->get(WarningReportFormatter::class);
    }

    private function getErrorReportFormatter(): ErrorReportFormatter
    {
        return $this->getServiceLocator()->get(ErrorReportFormatter::class);
    }

    private function getCsvImporter(): CsvItemImportHandler
    {
        return $this->getServiceLocator()->get(CsvItemImportHandler::class);
    }

    private function getReportBuilder(): ReportBuilder
    {
        return $this->getServiceLocator()->get(ReportBuilder::class);
    }
}
