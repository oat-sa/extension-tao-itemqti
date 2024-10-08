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

namespace oat\taoQtiItem\model\import;

use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\import\ImportHandlerHelperTrait;
use oat\tao\model\import\TaskParameterProviderInterface;
use oat\taoQtiItem\model\event\QtiItemImportEvent;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\taoQtiTest\models\classes\metadata\MetadataLomService;
use tao_models_classes_import_ImportHandler;
use helpers_TimeOutHelper;
use common_report_Report;
use Exception;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

/**
 * Import handler for QTI packages
 *
 * @access  public
 * @author  Joel Bout, <joel@taotesting.com>
 * @package taoQTIItem
 */
class QtiPackageImport implements
    tao_models_classes_import_ImportHandler,
    PhpSerializable,
    ServiceLocatorAwareInterface,
    TaskParameterProviderInterface
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;
    use ImportHandlerHelperTrait {
        getTaskParameters as getDefaultTaskParameters;
    }

    public const METADATA_IMPORT_ELEMENT_NAME = 'metadataImport';
    public const DISABLED_ELEMENTS = 'disabledFields';

    /**
     * @see tao_models_classes_import_ImportHandler::getLabel()
     */
    public function getLabel()
    {
        return __('QTI/APIP Content Package');
    }

    /**
     * @see tao_models_classes_import_ImportHandler::getForm()
     */
    public function getForm()
    {
        $form = new QtiPackageImportForm();
        return $form->getForm();
    }

    /**
     * @see tao_models_classes_import_ImportHandler::import()
     * @param \core_kernel_classes_Class $class
     * @param \tao_helpers_form_Form|array $form
     * @param string|null $userId owner of the resource
     * @return common_report_Report
     * @throws \oat\oatbox\service\ServiceNotFoundException
     */
    public function import($class, $form, $userId = null)
    {
        try {
            // for backward compatibility
            $rollbackInfo = $form instanceof \tao_helpers_form_Form
                ? (array) $form->getValue('rollback')
                : (array) $form['rollback'];

            $uploadedFile = $this->fetchUploadedFile($form);

            //the zip extraction is a long process that can exced the 30s timeout
            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);

            $isImportMetadataEnabled = false;
            if (isset($form[QtiPackageImportForm::METADATA_FORM_ELEMENT_NAME])) {
                $isImportMetadataEnabled = (bool) $form[QtiPackageImportForm::METADATA_FORM_ELEMENT_NAME] === true;
            }

            $report = ImportService::singleton()->importQTIPACKFile(
                $uploadedFile,
                $class,
                true,
                in_array('error', $rollbackInfo),
                in_array('warning', $rollbackInfo),
                null,
                null,
                null,
                null,
                $isImportMetadataEnabled
            );

            helpers_TimeOutHelper::reset();

            $this->getUploadService()->remove($uploadedFile);

            if (common_report_Report::TYPE_SUCCESS == $report->getType()) {
                $this->getEventManager()->trigger(new QtiItemImportEvent($report));
            }
        } catch (ExtractException $e) {
            $report = common_report_Report::createFailure(
                __('The ZIP archive containing the IMS QTI Item cannot be extracted.')
            );
        } catch (ParsingException $e) {
            $report = common_report_Report::createFailure(
                __('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.')
            );
        } catch (Exception $e) {
            $report = common_report_Report::createFailure(
                // phpcs:disable Generic.Files.LineLength
                __('An unexpected error occurred during the import of the IMS QTI Item Package. The system returned the following error: "%s"', $e->getMessage())
                // phpcs:enable Generic.Files.LineLength
            );
        }

        return $report;
    }

    /**
     * Defines the task parameters to be stored for later use.
     *
     * @param \tao_helpers_form_Form $form
     * @return array
     */
    public function getTaskParameters(\tao_helpers_form_Form $form)
    {
        return array_merge(
            [
                'rollback' => $form->getValue('rollback'),
                QtiPackageImportForm::METADATA_FORM_ELEMENT_NAME => $form->getValue(
                    QtiPackageImportForm::METADATA_FORM_ELEMENT_NAME
                ) ?? null,
            ],
            $this->getDefaultTaskParameters($form)
        );
    }
}
