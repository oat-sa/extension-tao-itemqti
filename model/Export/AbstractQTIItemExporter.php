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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 *               2013-2015 (update and modification) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */
namespace oat\taoQtiItem\model\Export;

use core_kernel_classes_Property;
use DOMDocument;
use DOMXPath;
use DOMNode;
use League\Flysystem\FileNotFoundException;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\filesystem\Directory;
use oat\qtiItemPci\model\portableElement\dataObject\IMSPciDataObject;
use oat\tao\model\media\sourceStrategy\HttpSource;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidAssetException;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\exception\ExportException;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use Psr\Http\Message\StreamInterface;
use taoItems_models_classes_ItemExporter;
use oat\taoQtiItem\model\qti\AssetParser;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\qti\Service;

abstract class AbstractQTIItemExporter extends taoItems_models_classes_ItemExporter
{

    /**
    * List of regexp of media that should be excluded from retrieval
    */
    private static $BLACKLIST = array(
        '/^data:[^\/]+\/[^;]+(;charset=[\w]+)?;base64,/'
    );

    /**
     * @var MetadataExporter Service to export metadata to IMSManifest
     */
    protected $metadataExporter;

    abstract public function buildBasePath();
    
    abstract protected function renderManifest(array $options, array $qtiItemData);
    
    abstract protected function itemContentPostProcessing($content);

    /**
     * Overriden export from QTI items.
     *
     * @see taoItems_models_classes_ItemExporter::export()
     * @param array $options An array of options.
     * @return \common_report_Report
     * @throws ExportException
     * @throws \common_Exception
     * @throws \common_exception_Error
     * @throws \core_kernel_persistence_Exception
     * @throws PortableElementInvalidAssetException
     */
    public function export($options = array())
    {
        $report = \common_report_Report::createSuccess();
        $asApip = isset($options['apip']) && $options['apip'] === true;
        
        $lang = \common_session_SessionManager::getSession()->getDataLanguage();
        $basePath = $this->buildBasePath();

        if(is_null($this->getItemModel())){
            $report->setMessage($this->getExportErrorMessage(__('not a QTI item')));
            $report->setType(\common_report_Report::TYPE_ERROR);
            return $report;
        }
        $dataFile = (string) $this->getItemModel()->getOnePropertyValue(new core_kernel_classes_Property(\taoItems_models_classes_ItemsService::TAO_ITEM_MODEL_DATAFILE_PROPERTY));
        $resolver = new ItemMediaResolver($this->getItem(), $lang);
	    $replacementList = array();
        $modelsAssets = $this->getPortableElementAssets($this->getItem(), $lang);
        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $portableElementsToExport = $portableAssetsToExport = [];

//        print_r($modelsAssets);

        foreach ($modelsAssets as $key => $portableElements) {

            /** @var  $element */
            foreach($portableElements as $element) {

                if (! $element instanceof Element) {
                    continue;
                }

//                var_dump($key, $element->getTypeIdentifier());
                try {
                    $object = $service->retrieve($key, $element->getTypeIdentifier());
                } catch (PortableElementException $e) {
                    $message = __('Fail to export item') . ' (' . $this->getItem()->getLabel() . '): ' . $e->getMessage();
                    return \common_report_Report::createFailure($message);
                }
                $portableElementsToExport[$element->getTypeIdentifier()] = $object;

                $files = $object->getModel()->getValidator()->getAssets($object, 'runtime');


                $portableAssetsToExport[$object->getTypeIdentifier()] = [];

                if($object instanceof IMSPciDataObject){
                    $baseUrl = $object->getTypeIdentifier();
                    $baseUrl = '';//add pcis to the root of the package
//                    \common_Logger::w('********** '.'/^'+$object->getTypeIdentifier()+'\// '.print_r($files, true));
                    foreach ($files as $url) {
                        try {
                            $stream = $service->getFileStream($object, $url);
//                            $rootApdatedUrl = preg_replace('/^'.$object->getTypeIdentifier().'\//', '', $url);
                            $rootApdatedUrl = $url;
                            $replacement = $this->copyAssetFile($stream, $baseUrl, $rootApdatedUrl, $replacementList);

//                            $pciBasePath = \helpers_File::getRelPath($basePath, '');
//                            \common_Logger::d("portableAssetsToExportportableAssetsToExport $pciBasePath $basePath $baseUrl $rootApdatedUrl $replacement ");


                            //TODO fix this !!!
                            $portableAssetsToExport[$object->getTypeIdentifier()][$url] = $replacement;
                            \common_Logger::i('File copied: "' . $url . '" for portable element ' . $object->getTypeIdentifier());
                        } catch (\tao_models_classes_FileNotFoundException $e) {
                            \common_Logger::i($e->getMessage());
                            $report->setMessage('Missing resource for ' . $url);
                            $report->setType(\common_report_Report::TYPE_ERROR);
                        }
                    }
                }else{
                    $baseUrl = $basePath . DIRECTORY_SEPARATOR . $object->getTypeIdentifier();
                    foreach ($files as $url) {
                        try {
                            // Skip shared libraries into portable element
                            if (strpos($url, './') !== 0) {
                                //wrong !
                                \common_Logger::i('Shared libraries skipped : ' . $url);
                                $portableAssetsToExport[$object->getTypeIdentifier()][$url] = $url;
                                continue;
                            }
                            $stream = $service->getFileStream($object, $url);
                            $replacement = $this->copyAssetFile($stream, $baseUrl, $url, $replacementList);
                            $portableAssetToExport = preg_replace('/^(.\/)(.*)/', $object->getTypeIdentifier() . "/$2", $replacement);
                            $portableAssetsToExport[$object->getTypeIdentifier()][$url] = $portableAssetToExport;
                            \common_Logger::i('File copied: "' . $url . '" for portable element ' . $object->getTypeIdentifier());
                        } catch (\tao_models_classes_FileNotFoundException $e) {
                            \common_Logger::i($e->getMessage());
                            $report->setMessage('Missing resource for ' . $url);
                            $report->setType(\common_report_Report::TYPE_ERROR);
                        }
                    }
                }

            }
        }

        $assets = $this->getAssets($this->getItem(), $lang);
        foreach ($assets as $assetUrl) {
            try{
                $mediaAsset = $resolver->resolve($assetUrl);
                $mediaSource = $mediaAsset->getMediaSource();

                if (!$mediaSource instanceof HttpSource) {
                    $link = $mediaAsset->getMediaIdentifier();
                    $stream = $mediaSource->getFileStream($link);
                    $baseName = ($mediaSource instanceof LocalItemSource) ? $link : 'assets/' . $mediaSource->getBaseName($link);
                    $replacement = $this->copyAssetFile($stream, $basePath, $baseName, $replacementList);
                    $replacementList[$assetUrl] = substr($replacement, strlen($basePath) + 1);//TODO revert this!!!
                }
            } catch(\tao_models_classes_FileNotFoundException $e){
                $replacementList[$assetUrl] = '';
                $report->setMessage('Missing resource for ' . $assetUrl);
                $report->setType(\common_report_Report::TYPE_ERROR);
            }
        }

//        var_dump($replacementList);exit;

        try{
            $xml = Service::singleton()->getXmlByRdfItem($this->getItem());
        }catch(FileNotFoundException $e){
            $report->setMessage($this->getExportErrorMessage(__('cannot find QTI XML')));
            $report->setType(\common_report_Report::TYPE_ERROR);
            return $report;
        }

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;

        if ($dom->loadXML($xml) === true) {
            $xpath = new \DOMXPath($dom);
            $attributeNodes = $xpath->query('//@*');
            $portableEntryNodes = $xpath->query("//*[local-name()='entry']|//*[local-name()='property']") ?: [];
            unset($xpath);

            foreach ($attributeNodes as $node) {
                if (isset($replacementList[$node->value])) {
                    $node->value = $replacementList[$node->value];
                }
            }
            foreach ($portableEntryNodes as $node) {
                $node->nodeValue = strtr(htmlentities($node->nodeValue, ENT_XML1), $replacementList);
            }

            $this->exportPortableAssets($dom, 'portableCustomInteraction', 'customInteractionTypeIdentifier', 'pci', $portableElementsToExport, $portableAssetsToExport);
            $this->exportPortableAssets($dom, 'portableInfoControl', 'infoControlTypeIdentifier', 'pic', $portableElementsToExport, $portableAssetsToExport);
        } else {
            $report->setMessage($this->getExportErrorMessage(__('cannot load QTI XML')));
            $report->setType(\common_report_Report::TYPE_ERROR);
            return $report;
        }

        if(($content = $dom->saveXML()) === false){
            $report->setMessage($this->getExportErrorMessage(__('invalid QTI XML')));
            $report->setType(\common_report_Report::TYPE_ERROR);
        }

        // Possibility to delegate (if necessary) some item content post-processing to sub-classes.
        $content = $this->itemContentPostProcessing($content);
        
        // add xml file
        $this->getZip()->addFromString($basePath . '/' . $dataFile, $content);

        if (! $report->getMessage()) {
            $report->setMessage(__('Item "%s" is ready to be exported', $this->getItem()->getLabel()));
        }

        return $report;
    }

    /**
     * Format a consistent error reporting message
     *
     * @param string $errorMessage
     * @return string
     */
    private function getExportErrorMessage($errorMessage){
        return __('Item "%s" cannot be exported: %s', $this->getItem()->getLabel(), $errorMessage);
    }


    private function getImsPciExportPath($itemRelPath, $portableAssetsToExport, $file, $portableElement){
        return $itemRelPath.($portableAssetsToExport[$portableElement->getTypeIdentifier()][$file]);
    }
    /**
     * Reconstruct PortableElement XML from PortableElementStorage data
     *
     * @param DOMDocument $dom
     * @param $nodeName
     * @param $typeIdentifierAttributeName
     * @param $ns
     * @param $portableElementsToExport
     * @param $portableAssetsToExport
     * @throws \common_Exception
     */
    private function exportPortableAssets(DOMDocument $dom, $nodeName, $typeIdentifierAttributeName, $ns, $portableElementsToExport, $portableAssetsToExport){

        $xpath = new DOMXPath($dom);

        // Get all portable element from qti.xml
        $portableElementNodes = $dom->getElementsByTagName($nodeName);

        for ($i=0; $i<$portableElementNodes->length; $i++) {

            /** @var \DOMElement $currentPortableNode */
            $currentPortableNode = $portableElementNodes->item($i);

            //get the local namespace prefix to be used in new node creation
            $localNs = $currentPortableNode->hasAttribute('xmlns') ? '' : $ns.':';

            //get the portable element type identifier
            $identifier = $currentPortableNode->getAttribute($typeIdentifierAttributeName);

            if (! isset($portableElementsToExport[$identifier])) {
                throw new \common_Exception('Unable to find loaded portable element.');
            }
            /** @var PortableElementObject $portableElement */
            $portableElement = $portableElementsToExport[$identifier];

            if($currentPortableNode->getAttribute('xmlns') === 'http://www.imsglobal.org/xsd/portableCustomInteraction_v1') {

                $basePath = $this->buildBasePath();
                $itemRelPath = \helpers_File::getRelPath($basePath, '');

                //set version
                $currentPortableNode->setAttribute('data-version', $portableElement->getVersion());

                // If asset files list is empty for current identifier skip
                if ( !isset($portableAssetsToExport) || !isset($portableAssetsToExport[$portableElement->getTypeIdentifier()]) ){
                    continue;
                }

                /** @var \DOMElement $resourcesNode */
                $modulesNode = $currentPortableNode->getElementsByTagName('modules')->item(0);

                $this->removeOldNode($modulesNode, 'module');

                $runtime = $portableElement->getRuntime();
                if(isset($runtime['config'])){
                    $configs = $runtime['config'];
                    if(isset($configs[0])){
                        $file = $configs[0]['file'];
                        $finalRelPath = $this->getImsPciExportPath($itemRelPath, $portableAssetsToExport, $file, $portableElement);
                        //make this path relative to the item !
                        $modulesNode->setAttribute('primaryConfiguration', $finalRelPath);

                        if(isset($configs[0]['data']) && isset($configs[0]['data']['paths'])){
                            foreach($configs[0]['data']['paths'] as $id => $paths){
                                if(is_string($paths)){
                                    $paths = $portableAssetsToExport[$portableElement->getTypeIdentifier()][$paths];
                                }else if(is_array($paths)){
                                    for($i = 0; $i< count($paths) ; $i ++){
                                        $paths[$i] = $portableAssetsToExport[$portableElement->getTypeIdentifier()][$paths[$i]];
                                    }
                                }
                                $configs[0]['data']['paths'][$id] = $paths;
                            }

                            $stream = fopen('php://memory','r+');
                            fwrite($stream, json_encode($configs[0]['data'], JSON_UNESCAPED_SLASHES));
                            rewind($stream);
                            $this->addFile($stream, $portableAssetsToExport[$portableElement->getTypeIdentifier()][$file]);
                            fclose($stream);
                        }
                    }
                    if(isset($configs[1])){
                        $file = $configs[1]['file'];
                        $modulesNode->setAttribute('fallbackConfiguration', $this->getImsPciExportPath($itemRelPath, $portableAssetsToExport, $file, $portableElement));
                    }
                }

                foreach ($portableElement->getRuntimeKey('modules') as $id => $modules) {
                    $moduleNode = $dom->createElement($localNs . 'module');
                    $moduleNode->setAttribute('id', $id);
                    if(isset($modules[0])){
                        $file = $modules[0];
                        $moduleNode->setAttribute('primaryPath', $this->getImsPciExportPath($itemRelPath, $portableAssetsToExport, $file, $portableElement));
                    }
                    if(isset($modules[1])){
                        $file = $modules[1];
                        $moduleNode->setAttribute('fallbackPath', $this->getImsPciExportPath($itemRelPath, $portableAssetsToExport, $file, $portableElement));
                    }
                    $modulesNode->appendChild($moduleNode);
                }

            }else{

                // Add hook and version as attributes
                if ($portableElement->hasRuntimeKey('hook'))
                    $currentPortableNode->setAttribute('hook',
                        preg_replace('/^(.\/)(.*)/', $portableElement->getTypeIdentifier() . "/$2",
                            $portableElement->getRuntimeKey('hook')
                        )
                    );

                //set version
                $currentPortableNode->setAttribute('version', $portableElement->getVersion());

                // If asset files list is empty for current identifier skip
                if ( !isset($portableAssetsToExport) || !isset($portableAssetsToExport[$portableElement->getTypeIdentifier()]) ){
                    continue;
                }

                /** @var \DOMElement $resourcesNode */
                $resourcesNode = $currentPortableNode->getElementsByTagName('resources')->item(0);

                $this->removeOldNode($resourcesNode, 'libraries');
                $this->removeOldNode($resourcesNode, 'stylesheets');
                $this->removeOldNode($resourcesNode, 'mediaFiles');

                // Portable libraries
                $librariesNode = $dom->createElement($localNs . 'libraries');
                foreach ($portableElement->getRuntimeKey('libraries') as $library) {
                    $libraryNode = $dom->createElement($localNs . 'lib');
                    //the exported lib id must be adapted from a href mode to an amd name mode
                    $libraryNode->setAttribute('id', preg_replace('/\.js$/', '', $library));
                    $librariesNode->appendChild($libraryNode);
                }
                if ($librariesNode->hasChildNodes()) {
                    $resourcesNode->appendChild($librariesNode);
                }

                // Portable stylesheets
                $stylesheetsNode = $dom->createElement($localNs . 'stylesheets');
                foreach ($portableElement->getRuntimeKey('stylesheets') as $stylesheet) {
                    $stylesheetNode = $dom->createElement($localNs . 'link');
                    $stylesheetNode->setAttribute('href', $stylesheet);
                    $stylesheetNode->setAttribute('type', 'text/css');

                    $info = pathinfo($stylesheet);
                    $stylesheetNode->setAttribute('title', basename($stylesheet, '.' . $info['extension']));
                    $stylesheetsNode->appendChild($stylesheetNode);
                }
                if ($stylesheetsNode->hasChildNodes()) {
                    $resourcesNode->appendChild($stylesheetsNode);
                }

                // Portable mediaFiles
                $mediaFilesNode = $dom->createElement($localNs . 'mediaFiles');
                foreach ($portableElement->getRuntimeKey('mediaFiles') as $mediaFile) {
                    $mediaFileNode = $dom->createElement($localNs . 'file');
                    $mediaFileNode->setAttribute('src', $mediaFile);
                    $mediaFileNode->setAttribute('type', \tao_helpers_File::getMimeType(
                        $portableAssetsToExport[$portableElement->getTypeIdentifier()][preg_replace('/^'.$identifier.'\//', './', $mediaFile)]
                    ));
                    $mediaFilesNode->appendChild($mediaFileNode);
                }
                if ($mediaFilesNode->hasChildNodes()) {
                    $resourcesNode->appendChild($mediaFilesNode);
                }
            }

        }

        unset($xpath);
    }

    public function copyAssetFile(StreamInterface $stream, $basePath, $baseName, &$replacementList)
    {
        $replacement = $baseName;

        $count = 0;
        while (in_array($replacement, $replacementList)) {
            $dot = strrpos($baseName, '.');
            $replacement = $dot !== false
                ? substr($baseName, 0, $dot) . '_' . $count . substr($baseName, $dot)
                : $baseName . $count;
            $count++;
        }

        // To check if replacement is to replace basename ???
        // Please check it seriously next time!
        $newRelPath = (empty($basePath) ? '' : $basePath.'/' ) . preg_replace( '/^(.\/)/', '',$replacement);
        $this->addFile($stream, $newRelPath);
        $stream->close();
        return $newRelPath;
    }

    /**
     * Get the item's assets
     *
     * @param \core_kernel_classes_Resource $item The item
     * @param string                        $lang The item lang
     *
     * @return string[] The assets URLs
     */
    protected function getAssets(\core_kernel_classes_Resource $item, $lang)
    {
        $qtiItem = Service::singleton()->getDataItemByRdfItem($item, $lang);
        if (is_null($qtiItem)) {
            return [];
        }
        $assetParser = new AssetParser($qtiItem, $this->getStorageDirectory($item, $lang));
        $assetParser->setGetSharedLibraries(false);
        $returnValue = array();
        foreach ($assetParser->extract() as $type => $assets) {
            foreach ($assets as $assetUrl) {
                foreach (self::$BLACKLIST as $blacklist) {
                    if (preg_match($blacklist, $assetUrl) === 1) {
                        continue(2);
                    }
                }
                $returnValue[] = $assetUrl;
            }
        }
        return $returnValue;
    }

    protected function getPortableElementAssets(\core_kernel_classes_Resource $item, $lang)
    {
        $qtiItem = Service::singleton()->getDataItemByRdfItem($item, $lang);
        if (is_null($qtiItem)) {
            return [];
        }
        $directory = $this->getStorageDirectory($item, $lang);
        $assetParser = new AssetParser($qtiItem, $directory);
        $assetParser->setGetCustomElementDefinition(true);
        return $assetParser->extractPortableAssetElements();
    }

    /**
     * Get the item's directory
     *
     * @param \core_kernel_classes_Resource $item The item
     * @param string                        $lang The item lang
     *
     * @return Directory The directory
     */
    protected function getStorageDirectory(\core_kernel_classes_Resource $item, $lang)
    {
        $itemService = \taoItems_models_classes_ItemsService::singleton();
        $directory = $itemService->getItemDirectory($item, $lang);

        //we should use be language unaware for storage manipulation
        $path = str_replace($lang, '', $directory->getPrefix());
        return $itemService->getDefaultItemDirectory()->getDirectory($path);
    }

    protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }

    /**
     * Get the service to export Metadata
     *
     * @return MetadataExporter
     */
    protected function getMetadataExporter()
    {
        if (! $this->metadataExporter) {
            $this->metadataExporter = $this->getServiceManager()->get(MetadataService::SERVICE_ID)->getExporter();
        }
        return $this->metadataExporter;
    }

    protected function removeOldNode(DOMNode $resourcesNode, $nodeName){
        $xpath = new \DOMXPath($resourcesNode->ownerDocument);
        $oldNodeList = $xpath->query('.//*[local-name(.) = "'.$nodeName.'"]', $resourcesNode);
        if ($oldNodeList->length > 0) {
            foreach($oldNodeList as $oldNode){
                $resourcesNode->removeChild($oldNode);
            }
        }
        unset($xpath);
    }
}
