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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti;

use common_exception_Error;
use common_exception_UserReadableException;
use common_Logger;
use common_report_Report;
use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use DOMDocument;
use Exception;
use helpers_File;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\qti\asset\AssetManager;
use oat\taoQtiItem\model\qti\asset\handler\LocalAssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\PortableAssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\SharedStimulusAssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\StimulusHandler;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\taoQtiItem\model\qti\exception\TemplateException;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardianResource;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\taoQtiItem\model\qti\parser\ValidationException;
use oat\taoQtiItem\model\event\ItemImported;
use qtism\data\storage\xml\XmlStorageException;
use tao_helpers_File;
use taoItems_models_classes_ItemsService;
use oat\oatbox\event\EventManager;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\service\ConfigurableService;

/**
 * Short description of class oat\taoQtiItem\model\qti\ImportService
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQTI
 */
class ImportService extends ConfigurableService
{

    const SERVICE_ID = 'taoQtiItem/ImportService';

    const PROPERTY_QTI_ITEM_IDENTIFIER = 'http://www.tao.lu/Ontologies/TAOItem.rdf#QtiItemIdentifier';

    /**
     * @return ImportService
     */
    public static function singleton() {
        return ServiceManager::getServiceManager()->get(self::SERVICE_ID);
    }

    /**
     * @var MetadataImporter Service to manage Lom metadata during package import
     */
    protected $metadataImporter;

    /**
     * Short description of method importQTIFile
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param $qtiFile
     * @param core_kernel_classes_Class $itemClass
     * @param bool $validate
     * @throws \common_Exception
     * @throws \common_ext_ExtensionException
     * @throws common_exception_Error
     * @return common_report_Report
     */
    public function importQTIFile($qtiFile, core_kernel_classes_Class $itemClass, $validate = true)
    {
        $report = null;

        try {

            $qtiModel = $this->createQtiItemModel($qtiFile, $validate);
            $rdfItem = $this->createRdfItem($itemClass, $qtiModel);

            $report = \common_report_Report::createSuccess(__('The IMS QTI Item was successfully imported.'), $rdfItem);

        } catch (ValidationException $ve) {
            $report = \common_report_Report::createFailure(__('The IMS QTI Item could not be imported.'));
            $report->add($ve->getReport());
        }

        return $report;
    }

    /**
     *
     * @param core_kernel_classes_Class $itemClass
     * @param Item $qtiModel
     * @param Resource $qtiItemResource
     * @throws common_exception_Error
     * @throws \common_Exception
     * @return core_kernel_classes_Resource
     */
    protected function createRdfItem(core_kernel_classes_Class $itemClass, Item $qtiModel)
    {
        $itemService = taoItems_models_classes_ItemsService::singleton();
        $qtiService = Service::singleton();

        if (!$itemService->isItemClass($itemClass)) {
            throw new common_exception_Error('provided non Itemclass for ' . __FUNCTION__);
        }

        $rdfItem = $itemService->createInstance($itemClass);

        //set the QTI type
        $itemService->setItemModel($rdfItem, new core_kernel_classes_Resource(ItemModel::MODEL_URI));

        //set the label
        $label = '';
        if($qtiModel->hasAttribute('label')) {
            $label = $qtiModel->getAttributeValue('label');
        } 
        
        if(empty($label)) {
           $label = $qtiModel->getAttributeValue('title'); 
        }
        $rdfItem->setLabel($label);

        //save itemcontent
        if (!$qtiService->saveDataItemToRdfItem($qtiModel, $rdfItem)) {
            throw new \common_Exception('Unable to save item');
        }

        return $rdfItem;
    }

    protected function createQtiItemModel($qtiFile, $validate = true)
    {
        $qtiXml = Authoring::sanitizeQtiXml($qtiFile);
        //validate the file to import
        $qtiParser = new Parser($qtiXml);

        if ($validate) {
            $qtiParser->validate();

            if (!$qtiParser->isValid()) {
                $eStrs = array();
                foreach ($qtiParser->getErrors() as $libXmlError) {
                    $eStrs[] = __('QTI-XML error at line %1$d "%2$s".', $libXmlError['line'],
                        str_replace('[LibXMLError] ', '', trim($libXmlError['message'])));
                }

                // Make sure there are no duplicate...
                $eStrs = array_unique($eStrs);

                // Add sub-report.
                throw new ValidationException($qtiFile, $eStrs);
            }
        }

        $qtiItem = $qtiParser->load();
        if (!$qtiItem && count($qtiParser->getErrors())) {
            $errors = [];
            foreach ($qtiParser->getErrors() as $error) {
                $errors[] = $error['message'];
            }

            throw new ValidationException($qtiFile, $errors);
        }

        return $qtiItem;
    }

    protected function createQtiManifest($manifestFile, $validate = true)
    {
        //load and validate the manifest
        $qtiManifestParser = new ManifestParser($manifestFile);

        if ($validate) {
            $qtiManifestParser->validate();

            if (!$qtiManifestParser->isValid()) {

                $eStrs = array();
                foreach ($qtiManifestParser->getErrors() as $libXmlError) {
                    if(isset($libXmlError['line'])){
                        $error = __('XML error at line %1$d "%2$s".', $libXmlError['line'],
                            str_replace('[LibXMLError] ', '', trim($libXmlError['message'])));
                    } else{
                        $error = __('XML error "%1$s".',str_replace('[LibXMLError] ', '', trim($libXmlError['message'])));
                    }
                    $eStrs[] = $error;

                }

                // Add sub-report.
                throw new ValidationException($manifestFile, $eStrs);
            }
        }

        return $qtiManifestParser->load();
    }

    /**
     * imports a qti package and
     * returns the number of items imported
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param $file
     * @param core_kernel_classes_Class $itemClass
     * @param bool $validate
     * @param bool $rollbackOnError
     * @param bool $rollbackOnWarning
     * @param bool $enableMetadataGuardians
     * @param bool $enableMetadataValidators
     * @param bool $itemMustExist
     * @param bool $itemMustBeOverwritten
     * @throws Exception
     * @throws ExtractException
     * @throws ParsingException
     * @throws \common_Exception
     * @throws \common_ext_ExtensionException
     * @throws common_exception_Error
     * @return common_report_Report
     */
    public function importQTIPACKFile(
        $file,
        core_kernel_classes_Class $itemClass,
        $validate = true,
        $rollbackOnError = false,
        $rollbackOnWarning = false,
        $enableMetadataGuardians = true,
        $enableMetadataValidators = true,
        $itemMustExist = false,
        $itemMustBeOverwritten = false
    ) {
        $initialLogMsg = "Importing QTI Package with the following options:\n";
        $initialLogMsg .= '- Rollback On Warning: ' . json_encode($rollbackOnWarning) . "\n";
        $initialLogMsg .= '- Rollback On Error: ' . json_encode($rollbackOnError) . "\n";
        $initialLogMsg .= '- Enable Metadata Guardians: ' . json_encode($enableMetadataGuardians) . "\n";
        $initialLogMsg .= '- Enable Metadata Validators: ' . json_encode($enableMetadataValidators) . "\n";
        $initialLogMsg .= '- Item Must Exist: ' . json_encode($itemMustExist) . "\n";
        $initialLogMsg .= '- Item Must Be Overwritten: ' .json_encode($itemMustBeOverwritten) . "\n";
        \common_Logger::d($initialLogMsg);

        //load and validate the package
        $qtiPackageParser = new PackageParser($file);

        if ($validate) {
            $qtiPackageParser->validate();
            if (!$qtiPackageParser->isValid()) {
                throw new ParsingException('Invalid QTI package format');
            }
        }

        //extract the package
        $folder = $qtiPackageParser->extract();
        if (!is_dir($folder)) {
            throw new ExtractException();
        }

        $report = new common_report_Report(common_report_Report::TYPE_SUCCESS, '');
        $successItems = array();
        $allCreatedClasses = array();
        $overwrittenItems = array();
        $itemCount = 0;

        try {

            // The metadata import feature needs a DOM representation of the manifest.
            $domManifest = new DOMDocument('1.0', 'UTF-8');
            $domManifest->load($folder . 'imsmanifest.xml');

            /** @var Resource[] $qtiItemResources */
            $qtiItemResources = $this->createQtiManifest($folder . 'imsmanifest.xml');

            $metadataValues = $this->getMetadataImporter()->extract($domManifest);

            $createdClasses = array();
            foreach ($qtiItemResources as $qtiItemResource) {
                $itemCount++;
                $itemReport = $this->importQtiItem(
                    $folder,
                    $qtiItemResource,
                    $itemClass,
                    array(),
                    $metadataValues,
                    array(),
                    array(),
                    array(),
                    array(),
                    $createdClasses,
                    $enableMetadataGuardians,
                    $enableMetadataValidators,
                    $itemMustExist,
                    $itemMustBeOverwritten,
                    $overwrittenItems
                );
                
                $allCreatedClasses = array_merge($allCreatedClasses, $createdClasses);
                
                $rdfItem = $itemReport->getData();
                
                if ($rdfItem) {
                    $successItems[$qtiItemResource->getIdentifier()] = $rdfItem;
                }
                
                $report->add($itemReport);
            }
        } catch (ValidationException $ve) {
            $validationReport = \common_report_Report::createFailure("The IMS Manifest file could not be validated");
            $validationReport->add($ve->getReport());
            $report->setMessage(__("No Items could be imported from the given IMS QTI package."));
            $report->setType(common_report_Report::TYPE_ERROR);
            $report->add($validationReport);
        } catch (common_exception_UserReadableException $e) {
            $report = new common_report_Report(common_report_Report::TYPE_ERROR, $e->getUserMessage());
            $report->add($e);
        }

        if (!empty($successItems)) {
            // Some items were imported from the package.
            $report->setMessage(__('%d Item(s) of %d imported from the given IMS QTI Package.', count($successItems),
                $itemCount));

            if (count($successItems) !== $itemCount) {
                $report->setType(common_report_Report::TYPE_WARNING);
            }
        } else {
            $report->setMessage(__('No Items could be imported from the given IMS QTI package.'));
            $report->setType(common_report_Report::TYPE_ERROR);
        }

        if ($rollbackOnError === true) {
            if ($report->getType() === common_report_Report::TYPE_ERROR || $report->contains(common_report_Report::TYPE_ERROR)) {
                $this->rollback($successItems, $report, $allCreatedClasses, $overwrittenItems);
            }
        } elseif ($rollbackOnWarning === true) {
            if ($report->contains(common_report_Report::TYPE_WARNING)) {
                $this->rollback($successItems, $report, $allCreatedClasses, $overwrittenItems);
            }
        }

        // cleanup
        tao_helpers_File::delTree($folder);

        return $report;
    }


    /**
     * @param $folder
     * @param \oat\taoQtiItem\model\qti\Resource $qtiItemResource
     * @param $itemClass
     * @param array $dependencies
     * @param array $metadataValues
     * @param array $metadataInjectors
     * @param array $metadataGuardians
     * @param array $metadataClassLookups
     * @param array $sharedFiles
     * @param array $createdClasses
     * @param boolean $enableMetadataGuardians
     * @param boolean $enableMetadataValidators
     * @param bool $itemMustExist
     * @param bool $itemMustBeOverwritten
     * @return common_report_Report
     * @throws common_exception_Error
     */
    public function importQtiItem(
        $folder,
        Resource $qtiItemResource,
        $itemClass,
        array $dependencies = array(),
        array $metadataValues = array(),
        array $metadataInjectors = array(),
        array $metadataGuardians = array(),
        array $metadataClassLookups = array(),
        array $sharedFiles = array(),
        &$createdClasses = array(),
        $enableMetadataGuardians = true,
        $enableMetadataValidators = true,
        $itemMustExist = false,
        $itemMustBeOverwritten = false,
        &$overwrittenItems = array()
    ) {
        try {
            $qtiService = Service::singleton();
            $overWriting = false;

            //load the information about resources in the manifest
            try {
                $resourceIdentifier = $qtiItemResource->getIdentifier();

                $this->getMetadataImporter()->setMetadataValues($metadataValues);
                $guardian = false;

                if ($enableMetadataGuardians === true) {
                    $guardian = $this->getMetadataImporter()->guard($resourceIdentifier);
                    if ($guardian !== false) {
                        // Item found by guardians.
                        if ($itemMustBeOverwritten === true) {
                            \common_Logger::i('Resource "' . $resourceIdentifier . '" is already stored in the database and will be overwritten.');
                            $overWriting = true;
                        } else {
                            \common_Logger::i('Resource "' . $resourceIdentifier . '" is already stored in the database and will not be imported.');
                            return common_report_Report::createInfo(
                                __('The IMS QTI Item referenced as "%s" in the IMS Manifest file was already stored in the Item Bank.', $resourceIdentifier),
                                new MetadataGuardianResource($guardian)
                            );
                        }

                    } else {
                        // Item not found by guardians.
                        if ($itemMustExist === true) {
                            \common_Logger::i('Resource "' . $resourceIdentifier . '" must be already stored in the database in order to proceed.');
                            return new common_report_Report(
                                common_report_Report::TYPE_ERROR,
                                __('The IMS QTI Item referenced as "%s" in the IMS Manifest file should have been found the Item Bank. Item not found.', $resourceIdentifier)
                            );
                        }
                    }
                }

                if ($enableMetadataValidators === true) {
                    $validationReport = $this->getMetadataImporter()->validate($resourceIdentifier);

                    if ($validationReport->getType() !== \common_report_Report::TYPE_SUCCESS) {
                        $validationReport->setMessage(__('Item metadata with identifier "%s" is not valid: ', $resourceIdentifier).$validationReport->getMessage());
                        \common_Logger::i('Item metadata is not valid: ' . $validationReport->getMessage());
                        return $validationReport;
                    }
                }

                $targetClass = $this->getMetadataImporter()->classLookUp($resourceIdentifier, $createdClasses);

                $qtiFile = $folder . helpers_File::urlToPath($qtiItemResource->getFile());

                common_Logger::i('file :: ' . $qtiItemResource->getFile());

                $qtiModel = $this->createQtiItemModel($qtiFile);
                if ($guardian !== false && $itemMustBeOverwritten) {
                    \common_Logger::d('Resource "' . $resourceIdentifier . '" will overwrite item with URI ' . $guardian->getUri());
                    $rdfItem = $guardian;
                    $overwrittenItems[$guardian->getUri()]= $qtiService->backupContentByRdfItem($rdfItem);
                    $qtiService->saveDataItemToRdfItem($qtiModel, $rdfItem);
                } else {
                    $rdfItem = $this->createRdfItem((($targetClass !== false) ? $targetClass : $itemClass), $qtiModel);
                }

                // Setting qtiIdentifier property
                $qtiIdentifierProperty = new \core_kernel_classes_Property(self::PROPERTY_QTI_ITEM_IDENTIFIER);
                $rdfItem->editPropertyValues($qtiIdentifierProperty, $resourceIdentifier);

                $itemAssetManager = new AssetManager();
                $itemAssetManager->setItemContent($qtiModel->toXML());
                $itemAssetManager->setSource($folder);

                /**
                 * Load asset handler following priority handler defined by you
                 * The first applicable will be used to import assets
                 */

                /** Portable element handler */
                $peHandler = new PortableAssetHandler($qtiModel, $folder, dirname($qtiFile));
                $itemAssetManager->loadAssetHandler($peHandler);

                if ($this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)->isInstalled('taoMediaManager')) {
                    /** Shared stimulus handler */
                    $sharedStimulusHandler = new SharedStimulusAssetHandler();
                    $sharedStimulusHandler
                        ->setQtiModel($qtiModel)
                        ->setItemSource(new ItemMediaResolver($rdfItem, ''))
                        ->setSharedFiles($sharedFiles)
                        ->setParentPath($rdfItem->getLabel());
                    $itemAssetManager->loadAssetHandler($sharedStimulusHandler);
                } else {
                    $handler = new StimulusHandler();
                    $handler->setQtiItem($qtiModel);
                    $handler->setItemSource(new LocalItemSource(array('item' => $rdfItem)));
                    $itemAssetManager->loadAssetHandler($handler);
                }

                /** Local storage handler */
                $localHandler = new LocalAssetHandler();
                $localHandler->setItemSource(new LocalItemSource(array('item' => $rdfItem)));
                $itemAssetManager->loadAssetHandler($localHandler);

                $itemAssetManager
                    ->importAuxiliaryFiles($qtiItemResource)
                    ->importDependencyFiles($qtiItemResource, $dependencies);

                $itemAssetManager->finalize();

                $qtiModel = $this->createQtiItemModel($itemAssetManager->getItemContent(), false);
                $qtiService->saveDataItemToRdfItem($qtiModel, $rdfItem);

                $this->getMetadataImporter()->inject($resourceIdentifier, $rdfItem);

                $eventManager = ServiceManager::getServiceManager()->get(EventManager::CONFIG_ID);
                $eventManager->trigger(new ItemImported($rdfItem, $qtiModel));

                // Build report message.
                if ($guardian !== false) {
                    $msg = __('The IMS QTI Item referenced as "%s" in the IMS Manifest file was successfully overwritten.', $qtiItemResource->getIdentifier());
                } else {
                    $msg = __('The IMS QTI Item referenced as "%s" in the IMS Manifest file was successfully imported.', $qtiItemResource->getIdentifier());
                }

                $report = common_report_Report::createSuccess($msg, $rdfItem);

            } catch (ParsingException $e) {

                $message = __('Resource "' . $resourceIdentifier . 'has an error. ') . $e->getUserMessage();

                $report = new common_report_Report(common_report_Report::TYPE_ERROR, $message);

            } catch (ValidationException $ve) {
                $report = common_report_Report::createFailure(__('IMS QTI Item referenced as "%s" in the IMS Manifest file could not be imported.', $resourceIdentifier));
                $report->add($ve->getReport());
            } catch (XmlStorageException $e){

                $files = array();
                $message = __('There are errors in the following shared stimulus : ').PHP_EOL;
                /** @var \LibXMLError $error */
                foreach($e->getErrors() as $error){
                    if(!in_array($error->file, $files)){
                        $files[] = $error->file;
                        $message .= '- '.basename($error->file).' :'.PHP_EOL;
                    }
                    $message .= $error->message.' at line : '.$error->line.PHP_EOL;
                }
                $message .= __(' For Resource "' . $resourceIdentifier);

                $report = new common_report_Report(common_report_Report::TYPE_ERROR,
                    $message);
            } catch (PortableElementInvalidModelException $pe) {
                $report = common_report_Report::createFailure(__('IMS QTI Item referenced as "%s" contains a portable element and cannot be imported.', $resourceIdentifier));
                $report->add($pe->getReport());
                if (isset($rdfItem) && ! is_null($rdfItem) && $rdfItem->exists() && !$overWriting) {
                    $rdfItem->delete();
                }
            } catch (PortableElementException $e) {
                // an error occurred during a specific item
                if ($e instanceof common_exception_UserReadableException) {
                    $msg = __('Error on item %1$s : %2$s', $resourceIdentifier, $e->getUserMessage());
                } else {
                    $msg = __('Error on item %s', $resourceIdentifier);
                    common_Logger::d($e->getMessage());
                }
                $report = new common_report_Report(common_report_Report::TYPE_ERROR,$msg);
                if (isset($rdfItem) && ! is_null($rdfItem) && $rdfItem->exists()  && !$overWriting) {
                    $rdfItem->delete();
                }
            } catch (TemplateException $e) {
                $report = new common_report_Report(common_report_Report::TYPE_ERROR,
                    __('The IMS QTI Item referenced as "%s" in the IMS Manifest file failed:  %s',$resourceIdentifier, $e->getMessage()));
                if (isset($rdfItem) && ! is_null($rdfItem) && $rdfItem->exists() && !$overWriting) {
                    $rdfItem->delete();
                }
            } catch (Exception $e) {
                // an error occurred during a specific item
                $report = new common_report_Report(common_report_Report::TYPE_ERROR, __("An unknown error occured while importing the IMS QTI Package with identifier: ". $resourceIdentifier));
                if (isset($rdfItem) && ! is_null($rdfItem) && $rdfItem->exists()  && !$overWriting) {
                    $rdfItem->delete();
                }
                common_Logger::e($e->getMessage());
            }
        } catch (ValidationException $ve) {
            $validationReport = common_report_Report::createFailure("The IMS Manifest file could not be validated");
            $validationReport->add($ve->getReport());
            $report->setMessage(__("No Items could be imported from the given IMS QTI package."));
            $report->setType(common_report_Report::TYPE_ERROR);
            $report->add($validationReport);
        } catch (common_exception_UserReadableException $e) {
            $report = new common_report_Report(common_report_Report::TYPE_ERROR, __($e->getUserMessage()));
            $report->add($e);
        }

        return $report;

    }

    /**
     * Import metadata to a given QTI Item.
     *
     * @deprecated use MetadataService::getImporter::inject()
     *
     * @param MetadataValue[] $metadataValues An array of MetadataValue objects.
     * @param Resource $qtiResource The object representing the QTI Resource, from an IMS Manifest perspective.
     * @param core_kernel_classes_Resource $resource The object representing the target QTI Item in the Ontology.
     * @param MetadataInjector[] $ontologyInjectors Implementations of MetadataInjector that will take care to inject the metadata values in the appropriate Ontology Resource Properties.
     * @throws MetadataInjectionException If an error occurs while importing the metadata.
     */
    public function importResourceMetadata(
        array $metadataValues,
        Resource $qtiResource,
        core_kernel_classes_Resource $resource,
        array $ontologyInjectors = array()
    ) {
        // Filter metadata values for this given item.
        $identifier = $qtiResource->getIdentifier();
        if (isset($metadataValues[$identifier]) === true) {
            \common_Logger::i("Preparing Metadata Values for resource '${identifier}'...");
            $values = $metadataValues[$identifier];

            foreach ($ontologyInjectors as $injector) {
                $valuesCount = count($values);
                $injectorClass = get_class($injector);
                \common_Logger::i("Attempting to inject ${valuesCount} Metadata Values in database for resource '${identifier}' with Metadata Injector '${injectorClass}'.");
                $injector->inject($resource, array($identifier => $values));
            }
        }
    }

    /**
     * @param array $items
     * @param common_report_Report $report
     * @param array $createdClasses (optional)
     * @throws common_exception_Error
     */
    protected function rollback(array $items, common_report_Report $report, array $createdClasses = array(), array $overwrittenItems = array())
    {
        $overwrittenItemsIds = array_keys($overwrittenItems);
        $qtiService = Service::singleton();

        // 1. Simply delete items that were not involved in overwriting.
        foreach ($items as $id => $item) {
            if (!$item instanceof MetadataGuardianResource && !in_array($item->getUri(), $overwrittenItemsIds)) {
                \common_Logger::d("Deleting item '${id}'...");
                @taoItems_models_classes_ItemsService::singleton()->deleteResource($item);

                $report->add(new common_report_Report(common_report_Report::TYPE_WARNING,
                    __('The IMS QTI Item referenced as "%s" in the IMS Manifest was successfully rolled back.', $id)));
            }
        }

        // 2. Restore overwritten item contents.
        foreach ($overwrittenItems as $overwrittenItemId => $backupName) {
            common_Logger::d("Restoring content for item '${overwrittenItemId}'...");
            @$qtiService->restoreContentByRdfItem(new core_kernel_classes_Resource($overwrittenItemId), $backupName);
        }
        
        foreach ($createdClasses as $createdClass) {
            @$createdClass->delete();
        }
    }

    /**
     * Get the lom metadata importer
     *
     * @return MetadataImporter
     */
    protected function getMetadataImporter()
    {
        if (! $this->metadataImporter) {
            $this->metadataImporter = $this->getServiceLocator()->get(MetadataService::SERVICE_ID)->getImporter();
        }
        return $this->metadataImporter;
    }
}
