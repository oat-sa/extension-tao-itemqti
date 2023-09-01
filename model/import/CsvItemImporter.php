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

    private const DEFAULT_CSV_SEPARATOR = ';';

    /** @var ServerRequestInterface|null */
    private $request;

    public function __construct(ServerRequestInterface $request = null)
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
        $form = new CsvImportForm(
            [],
            [
                'classUri' => $this->request ? $this->request->getParsedBody()['classUri'] : null
            ]
        );

        return $form->getForm();
    }

    /**
     * @inheritdoc
     */
    public function import($class, $form, $userId = null)
    {
        $reportBuilder = $this->getReportBuilder();

        try {
            $uploadedFile = $this->fetchUploadedFile($form);
            $template = $this->getTemplateRepository()->findById(CsvTemplateRepository::DEFAULT);

            $importer = $this->getCsvImporter();
            $importer->setCsvSeparator(self::DEFAULT_CSV_SEPARATOR); //@TODO Get it from UI/Task

            $importResults = $importer->import($uploadedFile, $template, $class);

            $report = $reportBuilder->buildByResults($importResults, $importResults->getFirstItem());
        } catch (Throwable $e) {
            $report = $reportBuilder->buildByException($e);

            $this->getLogger()->warning($report->getMessage());
        } finally {
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

    private function getCsvImporter(): CsvItemImportHandler
    {
        return $this->getServiceLocator()->get(CsvItemImportHandler::class);
    }

    private function getReportBuilder(): ReportBuilder
    {
        return $this->getServiceLocator()->get(ReportBuilder::class);
    }
}
