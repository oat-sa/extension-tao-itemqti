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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\import;

use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\tao\model\import\ImportHandlerHelperTrait;
use oat\tao\model\import\TaskParameterProviderInterface;
use oat\taoQtiItem\model\event\QtiItemImportEvent;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\exception\UnsupportedQtiElement;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\parser\ValidationException;
use tao_models_classes_import_ImportHandler;
use common_report_Report as Report;
use common_Exception;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

/**
 * Import handler for QTI XML files
 *
 * @access  public
 * @author  Joel Bout, <joel@taotesting.com>
 * @package taoQTIItem
 */
class QtiItemImport implements
    tao_models_classes_import_ImportHandler,
    PhpSerializable,
    ServiceLocatorAwareInterface,
    TaskParameterProviderInterface
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;
    use ImportHandlerHelperTrait;

    /**
     * @see tao_models_classes_import_ImportHandler::getLabel()
     */
    public function getLabel()
    {
        return __('QTI/APIP XML Item Document');
    }

    /**
     * @see tao_models_classes_import_ImportHandler::getForm()
     */
    public function getForm()
    {
        $form = new QtiItemImportForm();

        return $form->getForm();
    }

    /**
     * @see tao_models_classes_import_ImportHandler::import()
     * @param \core_kernel_classes_Class $class
     * @param \tao_helpers_form_Form|array $form
     * @param string|null $userId owner of the resource
     * @return Report
     * @throws \oat\oatbox\service\ServiceNotFoundException
     */
    public function import($class, $form, $userId = null)
    {
        try {
            $uploadedFile = $this->fetchUploadedFile($form);

            $importService = ImportService::singleton();

            $report = Report::createSuccess(__('1 item imported from the given QTI/APIP XML Item Document.'));

            $subReport = $importService->importQTIFile($uploadedFile, $class, true);

            $report->add($subReport);

            $this->getUploadService()->remove($uploadedFile);

            if (Report::TYPE_SUCCESS == $report->getType()) {
                $this->getEventManager()->trigger(new QtiItemImportEvent($report));
            }
        } catch (UnsupportedQtiElement $e) {
            $report = Report::createFailure(
                // phpcs:disable Generic.Files.LineLength
                __("A QTI component is not supported. The system returned the following error: %s\n", $e->getUserMessage())
                // phpcs:enable Generic.Files.LineLength
            );
        } catch (QtiModelException $e) {
            $report = Report::createFailure(
                // phpcs:disable Generic.Files.LineLength
                __("One or more QTI components are not supported by the system. The system returned the following error: %s\n", $e->getUserMessage())
                // phpcs:enable Generic.Files.LineLength
            );
        } catch (ParsingException $e) {
            $report = Report::createFailure(
                // phpcs:disable Generic.Files.LineLength
                __("The validation of the imported QTI item failed. The system returned the following error:%s\n", $e->getMessage())
                // phpcs:enable Generic.Files.LineLength
            );
        } catch (ValidationException $e) {
            $report = $e->getReport();
        } catch (common_Exception $e) {
            $report = Report::createFailure(
                // phpcs:disable Generic.Files.LineLength
                __("An unexpected error occurred during the import of the QTI Item. The system returned the following error: %s\n", $e->getMessage())
                // phpcs:enable Generic.Files.LineLength
            );
        }

        return $report;
    }
}
