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

use Throwable;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use oat\oatbox\PhpSerializeStateless;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\import\Parser\InvalidCsvImportException;
use oat\taoQtiItem\model\import\Report\ErrorReportFormatter;
use oat\taoQtiItem\model\import\Report\WarningReportFormatter;
use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;
use oat\taoQtiItem\model\import\Repository\TemplateRepositoryInterface;
use oat\tao\model\import\ImportHandlerHelperTrait;
use oat\tao\model\import\TaskParameterProviderInterface;
use tao_models_classes_import_ImportHandler;

class CsvItemImporter implements
    tao_models_classes_import_ImportHandler,
    ServiceLocatorAwareInterface,
    TaskParameterProviderInterface
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;
    use ImportHandlerHelperTrait {
        getTaskParameters as getDefaultTaskParameters;
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
        $form = new CsvImportForm();

        return $form->getForm();
    }

    /**
     * @inheritdoc
     */
    public function import($class, $form, $userId = null)
    {
        try {
            $uploadedFile = $this->fetchUploadedFile($form);
            $template = $this->getTemplateRepository()->findById(CsvTemplateRepository::DEFAULT);

            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);

            $itemValidatorResults = $this->getParser()->parseFile($uploadedFile, $template);

            $importService = $this->getItemImportService();
            $templateProcessor = $this->getTemplateProcessor();

            $successReportsImport = [];
            $errorReportsImport = [];
            $xmlItems = $templateProcessor->processResultSet($itemValidatorResults, $template);
            foreach ($xmlItems as $xmlItem) {
                $itemImportReport = $importService->importQTIFile($xmlItem, $class, true);

                if ($itemImportReport->getType() === Report::TYPE_SUCCESS) {
                    $successReportsImport[] = $itemImportReport;
                } else {
                    $errorReportsImport[] = $itemImportReport;
                }
            }

            helpers_TimeOutHelper::reset();

            $report = Report::createSuccess(
                __(
                    0===count($importerResults->getErrorReports())?
                    'CSV import successful: %s/%s line(s) are imported':
                    'CSV import partially successful: %s/%s line(s) are imported (%s warning(s), %s error(s))',
                    $importerResults->getTotalSuccessfulImport(),
                    count($importerResults->getItems()) + count($importerResults->getErrorReports()),
                    count($importerResults->getWarningReports()),
                    count($importerResults->getErrorReports())
                )
            );
        } catch (InvalidCsvImportException $e) {
            $report = Report::createError(__('CSV import failed'), []);
            $report->add(
                Report::createError(
                    __(
                        'CSV import failed: required columns are missing (%s)',
                        implode(', ', $e->getMissingHeaderColumns())
                    )
                )
            );
        } catch (Throwable $e) {
            $report = Report::createError(__('CSV import failed'), []);
            $report->add(
                Report::createError(
                    __(
                        'An unexpected error occurred during the CSV import. The system returned the following error: "%s"',
                        $e->getMessage()
                    )
                )
            );
        } finally {
            $warningParsingReport = $importerResults->getWarningReports();
            $errorParsingReport = $importerResults->getErrorReports();
            if (!empty($warningParsingReport)) {
                $report->add($this->getWarningReportFormatter()->format($warningParsingReport));
            }
            if (!empty($errorParsingReport)) {
                $report->add($this->getErrorReportFormatter()->format($errorParsingReport));
            }
            if (isset($uploadedFile)) {
//                $this->getUploadService()->remove($uploadedFile); @FIX uncomment before merge
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
}
