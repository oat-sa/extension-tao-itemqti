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

namespace oat\taoQtiItem\model\qti;

use oat\tao\model\media\MediaService;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\helpers\Apip;
use oat\taoQtiItem\model\apip\ApipService;
use \tao_models_classes_GenerisService;
use \core_kernel_classes_Class;
use \core_kernel_classes_Resource;
use \core_kernel_versioning_Repository;
use \common_report_Report;
use \taoItems_models_classes_ItemsService;
use \common_exception_Error;
use \common_ext_ExtensionsManager;
use \core_kernel_classes_Property;
use \tao_models_classes_Parser;
use \tao_helpers_File;
use \helpers_File;
use \Exception;
use \DOMDocument;
use \common_exception_UserReadableException;
use \common_Logger;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\qti\parser\ValidationException;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoMediaManager\model\SharedStimulusImporter;
use oat\taoMediaManager\model\SharedStimulusPackageImporter;
use oat\taoItems\model\media\ItemMediaResolver;

/**
 * Short description of class oat\taoQtiItem\model\qti\ImportService
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQTI
 
 */
class ImportService extends tao_models_classes_GenerisService
{

    /**
     * Short description of method importQTIFile
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param $qtiFile
     * @param core_kernel_classes_Class $itemClass
     * @param bool $validate
     * @param core_kernel_versioning_Repository $repository unused
     * @throws \common_Exception
     * @throws \common_ext_ExtensionException
     * @throws common_exception_Error
     * @return common_report_Report
     */
    public function importQTIFile($qtiFile, core_kernel_classes_Class $itemClass, $validate = true, core_kernel_versioning_Repository $repository = null, $extractApip = false)
    {
        $report = null;

        try {
            
            $qtiModel = $this->createQtiItemModel($qtiFile, $validate);
            
            $rdfItem = $this->createRdfItem($itemClass, $qtiModel);
            
            // If APIP content must be imported, just extract the apipAccessibility element
            // and store it along the qti.xml file.
            if ($extractApip === true) {
                $this->storeApip($qtiFile, $rdfItem);
            }
            
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
     * @param unknown $qtiModel
     * @throws common_exception_Error
     * @throws \common_Exception
     * @return unknown
     */
    protected function createRdfItem(core_kernel_classes_Class $itemClass, $qtiModel)
    {
        $itemService = taoItems_models_classes_ItemsService::singleton();
        $qtiService = Service::singleton();
        
        if (!$itemService->isItemClass($itemClass)) {
            throw new common_exception_Error('provided non Itemclass for '.__FUNCTION__);
        }
        
        $rdfItem = $itemService->createInstance($itemClass);
        
        //set the QTI type
        $itemService->setItemModel($rdfItem, new core_kernel_classes_Resource(ItemModel::MODEL_URI));
        
        //set the label
        $rdfItem->setLabel($qtiModel->getAttributeValue('title'));
        
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
            $basePath = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
            $qtiParser->validate();
        
            if (!$qtiParser->isValid()) {
                $failedValidation = true;
                
                $eStrs = array();
                foreach ($qtiParser->getErrors() as $libXmlError) {
                    $eStrs[] = __('QTI-XML error at line %1$d "%2$s".', $libXmlError['line'], str_replace('[LibXMLError] ', '', trim($libXmlError['message'])));
                }
        
                // Make sure there are no duplicate...
                $eStrs = array_unique($eStrs);
        
                // Add sub-report.
                throw new ValidationException($qtiFile, $eStrs);
            }
        }
        
        $qtiItem = $qtiParser->load();
        return $qtiItem;
    }
    
    protected function createQtiManifest($manifestFile, $validate = true)
    {
        //load and validate the manifest
        $qtiManifestParser = new ManifestParser($manifestFile);
        
        if ($validate) {
            $basePath = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
            $qtiManifestParser->validateMultiple(array(
                $basePath.'model/qti/data/imscp_v1p1.xsd',
                $basePath.'model/qti/data/apipv1p0/Core_Level/Package/apipv1p0_imscpv1p2_v1p0.xsd'
            ));
        
            if(!$qtiManifestParser->isValid()) {
        
                $eStrs = array();
                foreach ($qtiManifestParser->getErrors() as $libXmlError) {
                    $eStrs[] = __('XML error at line %1$d "%2$s".', $libXmlError['line'], str_replace('[LibXMLError] ', '', trim($libXmlError['message'])));
                }

                // Add sub-report.
                throw new ValidationException($manifestFile, $eStrs);
            }
        }
        
        return $qtiManifestParser->load();
    }
    
    private function storeApip($qtiFile, $rdfItem)
    {
        $originalDoc = new DOMDocument('1.0', 'UTF-8');
        $originalDoc->load($qtiFile);
        
        $apipService = ApipService::singleton();
        $apipService->storeApipAccessibilityContent($rdfItem, $originalDoc);
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
     * @param core_kernel_versioning_Repository $repository
     * @param bool $rollbackOnError
     * @param bool $rollbackOnWarning
     * @throws Exception
     * @throws ExtractException
     * @throws ParsingException
     * @throws \common_Exception
     * @throws \common_ext_ExtensionException
     * @throws common_exception_Error
     * @return common_report_Report
     */
    public function importQTIPACKFile($file, core_kernel_classes_Class $itemClass, $validate = true, core_kernel_versioning_Repository $repository = null, $rollbackOnError = false, $rollbackOnWarning = false, $extractApip = false)
    {
        
        $report = new common_report_Report(common_report_Report::TYPE_SUCCESS, '');
        
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
        
        try {
            //load the information about resources in the manifest 
            $qtiItemResources = $this->createQtiManifest($folder.'imsmanifest.xml');
            $itemService = taoItems_models_classes_ItemsService::singleton();
            $qtiService = Service::singleton();
            
            // The metadata import feature needs a DOM representation of the manifest.
            $domManifest = new DOMDocument('1.0', 'UTF-8');
            $domManifest->load($folder.'imsmanifest.xml');
            $metadataMapping = $qtiService->getMetadataRegistry()->getMapping();
            $metadataInjectors = array();
            $metadataGuardians = array();
            $metadataClassLookups = array();
            $metadataValues = array();
            
            foreach ($metadataMapping['injectors'] as $injector) {
                $metadataInjectors[] = new $injector();
            }
            
            foreach ($metadataMapping['guardians'] as $guardian) {
                $metadataGuardians[] = new $guardian();
            }
            
            foreach ($metadataMapping['classLookups'] as $classLookup) {
                $metadataClassLookups[] = new $classLookup();
            }
            
            foreach ($metadataMapping['extractors'] as $extractor) {
                $metadataExtractor = new $extractor();
                $metadataValues = array_merge($metadataValues, $metadataExtractor->extract($domManifest));
            }
            
            $itemCount = 0;
            $successItems = array();
            
            $name = basename($file, '.zip');
            $name = preg_replace('/[^_]+_/', '',$name, 1);
            $sources = MediaService::singleton()->getWritableSources();
            $sharedStorage = array_shift($sources);
            $sharedFiles = array();
            
            // Will contains "already in item bank" ontology resources.
            $alreadyStored = array();
            
            foreach ($qtiItemResources as $qtiItemResource) {

                $itemCount++;
                
                try {
                    
                    $resourceIdentifier = $qtiItemResource->getIdentifier();
                    
                    // Use the guardians to check whether or not the item has to be imported.
                    foreach ($metadataGuardians as $guardian) {
                        
                        if (isset($metadataValues[$resourceIdentifier]) === true) {
                            if (($guard = $guardian->guard($metadataValues[$resourceIdentifier])) !== false) {
                                $msg = __('The IMS QTI Item referenced as "%s" in the IMS Manifest file was already stored in the Item Bank.', $qtiItemResource->getIdentifier());
                                $report->add(common_report_Report::createInfo($msg, $guard));
                                
                                // Simply do not import again.
                                continue 2;
                            }
                        }
                    }
                    
                    $targetClass = null;
                    // Use the classLookups to determine where the item has to go.
                    foreach ($metadataClassLookups as $classLookup) {
                        if (isset($metadataValues[$resourceIdentifier]) === true) {
                            if (($targetClass = $classLookup->lookup($metadataValues[$resourceIdentifier])) !== false) {
                                break;
                            }
                        }
                    }
                    
                    $qtiFile = $folder . $qtiItemResource->getFile();
                    
                    $qtiModel = $this->createQtiItemModel($qtiFile);
                    $rdfItem = $this->createRdfItem((($targetClass !== null) ? $targetClass : $itemClass), $qtiModel);
                    $itemContent = $itemService->getItemContent($rdfItem);

                    $xincluded = array();
                    foreach($qtiModel->getBody()->getComposingElements('oat\taoQtiItem\model\qti\Xinclude') as $xincludeEle) {
                        $xincluded[] = $xincludeEle->attr('href');
                    }
                    
                    $local = new LocalItemSource(array('item' => $rdfItem));
                    foreach ($qtiItemResource->getAuxiliaryFiles() as $auxResource) {
                        // file on FS
                        $auxFile = $folder.str_replace('/', DIRECTORY_SEPARATOR, $auxResource);
                        
                        // rel path in item
                        $auxPath = str_replace(DIRECTORY_SEPARATOR, '/', helpers_File::getRelPath($qtiFile, $auxFile));
                        
                        if (!empty($sharedStorage) && in_array($auxPath, $xincluded)) {
                            $md5 = md5_file($auxFile);
                            if (isset($sharedFiles[$md5])) {
                                $info = $sharedFiles[$md5];
                                \common_Logger::i('Auxiliary file \''.$auxPath.'\' linked to shared storage.');
                            } else {
                                // TODO cleanup sharedstimulus import/export
                                // move to taoQti item or library
                                
                                // validate the shared stimulus
                                SharedStimulusImporter::isValidSharedStimulus($auxFile);
                                
                                // embed assets in the shared stimulus
                                $newXmlFile = SharedStimulusPackageImporter::embedAssets($auxFile);
                                $info = $sharedStorage->add($newXmlFile, basename($auxFile), $name);
                                if (method_exists($sharedStorage, 'forceMimeType')) {
                                    // add() does not return link, so we need to parse it
                                    $resolver = new ItemMediaResolver($rdfItem, '');
                                    $asset = $resolver->resolve($info['uri']);
                                    $sharedStorage->forceMimeType($asset->getMediaIdentifier(), 'application/qti+xml');
                                }
                                $sharedFiles[$md5] = $info;
                                \common_Logger::i('Auxiliary file \''.$auxPath.'\' added to shared storage.');
                            }
                        } else {
                            // store locally, in a safe directory
                            $safePath = '';
                            if (dirname($auxPath) !== '.') {
                                $safePath = str_replace('../', '', dirname($auxPath)).'/';
                            }
                            $info = $local->add($auxFile, basename($auxFile), $safePath);
                            \common_Logger::i('Auxiliary file \''.$auxPath.'\' copied.');
                        }
                        
                        // replace uri if changed
                        if ($auxPath != ltrim($info['uri'], '/')) {
                            $itemContent = str_replace($auxPath, $info['uri'], $itemContent);
                        }
                    }
                    
                    // Finally, import metadata.
                    $this->importItemMetadata($metadataValues, $qtiItemResource, $rdfItem, $metadataInjectors);
                    
                    // And Apip if wanted
                    if ($extractApip) {
                        $this->storeApip($qtiFile, $rdfItem);
                    }
                    
                    $itemService->setItemContent($rdfItem, $itemContent);
                    $successItems[$qtiItemResource->getIdentifier()] = $rdfItem;
                    
                    $msg = __('The IMS QTI Item referenced as "%s" in the IMS Manifest file was successfully imported.', $qtiItemResource->getIdentifier());
                    $report->add(common_report_Report::createSuccess($msg, $rdfItem));
                    
                } catch (ParsingException $e) {
                    $report->add(new common_report_Report(common_report_Report::TYPE_ERROR, $e->getUserMessage()));
                } catch (ValidationException $ve) {
                    $itemReport = \common_report_Report::createFailure(__('IMS QTI Item referenced as "%s" in the IMS Manifest file could not be imported.', $qtiItemResource->getIdentifier()));
                    $itemReport->add($ve->getReport());
                    $report->add($itemReport);
                } catch (Exception $e) {
                    // an error occured during a specific item
                    $report->add(new common_report_Report(common_report_Report::TYPE_ERROR, __("An unknown error occured while importing the IMS QTI Package.")));
                    common_Logger::e($e->getMessage());
                }
            }

            if (!empty($successItems)) {
                // Some items were imported from the package.
                $report->setMessage(__('%d Item(s) of %d imported from the given IMS QTI Package.', count($successItems), $itemCount));
                
                if (count($successItems) !== $itemCount) {
                    $report->setType(common_report_Report::TYPE_WARNING);
                }
            }
            else {
                $report->setMessage(__('No Items could be imported from the given IMS QTI package.'));
                $report->setType(common_report_Report::TYPE_ERROR);
            }
            
            if ($rollbackOnError === true) {
                if ($report->getType() === common_report_Report::TYPE_ERROR || $report->contains(common_report_Report::TYPE_ERROR)) {
                    $this->rollback($successItems, $report);
                }
            } elseif ($rollbackOnWarning === true) {
                if ($report->getType() === common_report_Report::TYPE_WARNING || $report->contains(common_report_Report::TYPE_WARNING)) {
                    $this->rollback($successItems, $report);
                }
            }
        } catch (ValidationException $ve) {
            $validationReport = \common_report_Report::createFailure("The IMS Manifest file could not be validated");
            $validationReport->add($ve->getReport());
            $report->setMessage(__("No Items could be imported from the given IMS QTI package."));
            $report->setType(common_report_Report::TYPE_ERROR);
            $report->add($validationReport);
        } catch (common_exception_UserReadableException $e) {
            $report = new common_report_Report(common_report_Report::TYPE_ERROR, __($e->getUserMessage()));
            $report->add($e);
        }
        
        // cleanup
        tao_helpers_File::delTree($folder);

        return $report;
    }

    /**
     * Import metadata to a given QTI Item.
     * 
     * @param oat\taoQtiItem\model\qti\metadata\MetadataValue[] $metadataValues An array of MetadataValue objects.
     * @param Resource $qtiResource The object representing the QTI Resource, from an IMS Manifest perspective.
     * @param core_kernel_classes_Resource $resource The object representing the target QTI Item in the Ontology.
     * @param oat\taoQtiItem\model\qti\metadata\MetadataInjector[] $ontologyInjectors Implementations of MetadataInjector that will take care to inject the metadata values in the appropriate Ontology Resource Properties.
     * @throws oat\taoQtiItem\model\qti\metadata\MetadataInjectionException If an error occurs while importing the metadata. 
     */
    public function importItemMetadata(array $metadataValues, Resource $qtiResource, core_kernel_classes_Resource $resource, array $ontologyInjectors = array())
    {
        // Filter metadata values for this given item.
        $identifier = $qtiResource->getIdentifier();
        if (isset($metadataValues[$identifier]) === true) {
            
            $values = $metadataValues[$identifier];
            
            foreach ($ontologyInjectors as $injector) {
                $injector->inject($resource, array($identifier => $values));
            }
        }
    }

    /**
     * @param array $items
     * @param common_report_Report $report
     * @throws common_exception_Error
     */
    protected function rollback(array $items, common_report_Report $report) 
    {
        foreach ($items as $id => $item) {
            @taoItems_models_classes_ItemsService::singleton()->deleteItem($item);
            $report->add(new common_report_Report(common_report_Report::TYPE_WARNING, __('The IMS QTI Item referenced as "%s" in the IMS Manifest was successfully rolled back.', $id)));
        }
    }
}