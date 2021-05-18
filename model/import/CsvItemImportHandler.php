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

use core_kernel_classes_Class;
use helpers_TimeOutHelper;
use oat\oatbox\filesystem\File;
use oat\oatbox\reporting\Report;
use oat\oatbox\reporting\ReportInterface;
use oat\oatbox\service\ConfigurableService;
use oat\tao\helpers\form\ElementMapFactory;
use oat\taoQtiItem\model\import\Metadata\MetadataResolver;
use oat\taoQtiItem\model\import\Parser\CsvParser;
use oat\taoQtiItem\model\import\Parser\Exception\InvalidImportException;
use oat\taoQtiItem\model\import\Parser\ParserInterface;
use oat\taoQtiItem\model\import\Template\ItemsQtiTemplateRender;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\metadata\MetadataValidator;
use tao_models_classes_dataBinding_GenerisFormDataBinder;
use tao_models_classes_dataBinding_GenerisFormDataBindingException;
use Throwable;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

class CsvItemImportHandler extends ConfigurableService
{
    /**
     * @throws InvalidImportException
     */
    public function import(
        File $uploadedFile,
        TemplateInterface $template,
        core_kernel_classes_Class $class
    ): ItemImportResult {
        helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);

        $itemValidatorResults = $this->getParser()->parseFile($uploadedFile, $template);

        // 1 - You validate header (Breaks import)
        // 2 - Validate line by line (Follow until the end and stores error + warnings)
        // 3 - Parse the lines replacing to default content if necessary (Output = XML string)
        // 4 - For each xmlstring, tries to create a QTI Item (import to DB + FS).

        $successReportsImport = 0;
        $importService = $this->getItemImportService();
        $templateProcessor = $this->getTemplateProcessor();
        $errorReportsImport = count($itemValidatorResults->getErrorReports());
        $xmlItems = $templateProcessor->processResultSet($itemValidatorResults, $template);

        // Maybe extract and increment $itemValidatorResults with errors?
        // Maybe rollback if import item does not work
        // Ask business if we want to revert what was imported (probably, yes)
        foreach ($xmlItems as $lineNumber => $xmlItem) {
            try {
                $metaData = $this->getMetadataResolver()->resolve($class, $xmlItem->getMetadata());

                $itemImportReport  = $importService->importQTIFile($xmlItem->getItemXML(), $class, true);
                $this->importMetadata($metaData, $itemImportReport);

                if (Report::TYPE_SUCCESS === $itemImportReport->getType()) {
                    $successReportsImport++;
                } else {
                    $error = new InvalidImportException();
                    $error->addError($lineNumber, $itemImportReport->getMessage());

                    $itemValidatorResults->addErrorReport($lineNumber, $error);
                    $errorReportsImport++;
                }
            } catch (Throwable $exception) {
                $this->getLogger()->warning(
                    sprintf('Tabular import: import failure %s', $exception->getMessage())
                );

                // Ask business if we want to revert what was imported (probably, yes)
                //FIXME Rollback any DB + FS change

                $errorReportsImport++;

                $error = new InvalidImportException();
                $error->addError($lineNumber, $exception->getMessage(), '');

                $itemValidatorResults->addErrorReport($lineNumber, $error);
            }
        }

        helpers_TimeOutHelper::reset();

        $itemValidatorResults->setTotalSuccessfulImport($successReportsImport);

        return $itemValidatorResults;
    }

    private function getParser(): ParserInterface
    {
        return $this->getServiceLocator()->get(CsvParser::class);
    }

    private function getItemImportService(): ImportService
    {
        return $this->getServiceLocator()->get(ImportService::SERVICE_ID);
    }

    private function getTemplateProcessor(): ItemsQtiTemplateRender
    {
        return $this->getServiceLocator()->get(ItemsQtiTemplateRender::class);
    }

    private function getMetadataResolver(): MetadataResolver
    {
        return $this->getServiceManager()->get(MetadataResolver::class);
    }

    /**
     * @throws tao_models_classes_dataBinding_GenerisFormDataBindingException
     */
    private function importMetadata(array $metaData, ReportInterface $itemImportReport): void
    {
        $itemRdf  = $itemImportReport->getData();
        $binder   = new tao_models_classes_dataBinding_GenerisFormDataBinder($itemRdf);
        $binder->bind($metaData);
    }
}
