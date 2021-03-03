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

use common_Logger;
use helpers_TimeOutHelper;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\PhpSerializeStateless;
use oat\oatbox\reporting\Report;
use oat\tao\model\import\ImportHandlerHelperTrait;
use oat\tao\model\import\TaskParameterProviderInterface;
use oat\taoQtiItem\model\import\Parser\CsvParser;
use oat\taoQtiItem\model\import\Parser\InvalidImportException;
use tao_models_classes_import_ImportHandler;
use Throwable;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

class ItemCsvImporter implements
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

            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);

            //@TODO Parse file...
            /** @var CsvParser $parser */
            //$parser = $this->getServiceLocator()->get(CsvParser::class);

            //FIXME remove log after tests
            common_Logger::e('======> CONTENT: ' . $uploadedFile->readPsrStream()->getContents());

            helpers_TimeOutHelper::reset();

            $report = Report::createSuccess(__('CSV imported successfully')); //@FIXME @TODO Validate message with BA
        } catch (InvalidImportException $e) {
            $report = Report::createError(
                __(
                    'CSV import failed: required columns are missing (%)',
                    'col1, col2, col3' //@FIXME Get this from exception
                )
            );
        } catch (Throwable $e) {
            $report = Report::createError(
                __(
                    'An unexpected error occurred during the CSV import. The system returned the following error: "%s"',
                    $e->getMessage()
                )
            );
        } finally {
            if (isset($uploadedFile)) {
                $this->getUploadService()->remove($uploadedFile);
            }
        }

        return $report;
    }
}
