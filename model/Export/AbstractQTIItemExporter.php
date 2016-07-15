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
use oat\oatbox\service\ServiceManager;
use oat\tao\model\media\sourceStrategy\HttpSource;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\portableElement\common\PortableElementFactory;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\pic\model\PicModel;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\exception\ExportException;
use Psr\Http\Message\StreamInterface;
use SebastianBergmann\Comparator\Factory;
use taoItems_models_classes_ItemExporter;
use oat\taoQtiItem\model\qti\AssetParser;
use oat\taoQtiItem\model\apip\ApipService;
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

    abstract public function buildBasePath();

    /**
     * Overriden export from QTI items.
     *
     * @see taoItems_models_classes_ItemExporter::export()
     * @param array $options An array of options.
     * @return \common_report_Report $report
     * @throws ExportException
     * @throws \common_exception_Error
     * @throws \core_kernel_persistence_Exception
     */
    public function export($options = array())
    {
        $report = \common_report_Report::createSuccess();
        $asApip = isset($options['apip']) && $options['apip'] === true;
        
        $lang = \common_session_SessionManager::getSession()->getDataLanguage();
        $basePath = $this->buildBasePath();

        if(is_null($this->getItemModel())){
            throw new ExportException('', 'No Item Model found for item : '.$this->getItem()->getUri());
        }
        $dataFile = (string) $this->getItemModel()->getOnePropertyValue(
            new core_kernel_classes_Property(TAO_ITEM_MODEL_DATAFILE_PROPERTY));
        $content = $this->getItemService()->getItemContent($this->getItem());
        $replacementList = array();

        $modelsAssets = $this->getPortableElementAssets($this->getItem(), $lang);
        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $portableElements = [];

        foreach ($modelsAssets as $key => $portableElement) {

            if (! $portableElement instanceof Element) {
                continue;
            }

            if ($key == 'pciElement') {
                $model = new PciModel();
            } elseif ($key == 'picElement') {
                $model = new PicModel();
            } else {
                \common_Logger::i('QTI item exporter is not correctly set. Unknown key model ' . $key);
                continue;
            }

            $model->setTypeIdentifier($portableElement->getTypeIdentifier());
            $portableElement = $service->hydrateModel($model);

            $validator = PortableElementFactory::getValidator($portableElement);
            $files = $validator->getRequiredAssets('runtime');

            $baseUrl = $basePath . DIRECTORY_SEPARATOR . $model->getTypeIdentifier();

            foreach ($files as $url) {
                try {
                    // Skip shared libraries into portable element
                    if (strpos($url, './') !== 0) {
                        \common_Logger::i('Shared libraries skipped : ' . $url);
                        $replacementList[$url] = $url;
                        continue;
                    }
                    $stream = $service->getFileStream($portableElement, $url);
                    $replacement = $this->copyAssetFile($stream, $baseUrl, $url, $replacementList);
                    $replacementList[$url] = $replacement;
                    \common_Logger::i('File copied: "' . $url . '" for portable element ' . $portableElement->getTypeIdentifier());
                } catch (\tao_models_classes_FileNotFoundException $e) {
                    \common_Logger::i($e->getMessage());
                    $report->setMessage('Missing resource for ' . $url);
                    $report->setType(\common_report_Report::TYPE_ERROR);
                }
            }

            $portableElements[$portableElement->getTypeIdentifier()] = $portableElement;
        }


        $assets = $this->getAssets($this->getItem(), $lang);
        foreach ($assets as $assetUrl) {
            try{
                $resolver = new ItemMediaResolver($this->getItem(), $lang);
                $mediaAsset = $resolver->resolve($assetUrl);
                $mediaSource = $mediaAsset->getMediaSource();

                if (!$mediaSource instanceof HttpSource) {
                    $link = $mediaAsset->getMediaIdentifier();
                    $stream = $mediaSource->getFileStream($link);
                    $baseName = ($mediaSource instanceof LocalItemSource) ? $link : 'assets/' . $mediaSource->getBaseName($link);
                    $replacement = $this->copyAssetFile($stream, $basePath, $baseName, $replacementList);
                    $replacementList[$assetUrl] = $replacement;
                }
            } catch(\tao_models_classes_FileNotFoundException $e){
                $replacementList[$assetUrl] = '';
                $report->setMessage('Missing resource for ' . $assetUrl);
                $report->setType(\common_report_Report::TYPE_ERROR);
            }
        }

        $xml = \taoItems_models_classes_ItemsService::singleton()->getItemContent($this->getItem());
        $dom = new \DOMDocument('1.0', 'UTF-8');
        if ($dom->loadXML($xml) === true) {
            $xpath = new \DOMXPath($dom);

            $attributeNodes = $dom->getElementsByTagName('portableCustomInteraction');
            for ($i=0; $i<$attributeNodes->length; $i++) {
                $identifier = $attributeNodes->item($i)->getAttribute('customInteractionTypeIdentifier');

                if (! isset($portableElements[$identifier])) {
                    continue;
                }

                $portableElement = $portableElements[$identifier];
                $attributeNodes->item($i)->setAttribute('hook', $portableElement->getRuntimeKey('hook'));
                $attributeNodes->item($i)->setAttribute('version', $portableElement->getVersion());

                $resourcesNode = $attributeNodes->item($i)->getElementsByTagName('resources')->item(0);

                // Portable libraries
                $librariesNode = $dom->createElement('pci:libraries');
                foreach ($portableElement->getRuntimeKey('libraries') as $library) {
                    $libraryNode = $dom->createElement('pci:lib');
                    $libraryNode->setAttribute('id', $replacementList[$library]);
                    $librariesNode->appendChild($libraryNode);
                }

                $oldLibrariesNode = $xpath->query('.//pci:libraries', $resourcesNode);
                if ($oldLibrariesNode->length > 0) {
                    $resourcesNode->removeChild($oldLibrariesNode->item(0));
                }

                if ($librariesNode->hasChildNodes()) {
                    $resourcesNode->appendChild($librariesNode);
                }

                // Portable stylesheets
                $stylesheetsNode = $dom->createElement('pci:stylesheets');
                foreach ($portableElement->getRuntimeKey('stylesheets') as $stylesheets) {
                    $stylesheetNode = $dom->createElement('pci:link');
                    $stylesheetNode->setAttribute('href', $replacementList[$stylesheets]);
                    $stylesheetNode->setAttribute('type', 'text/css');
                    $info = pathinfo($stylesheets);
                    $stylesheetNode->setAttribute('title', basename($stylesheets,'.'.$info['extension']));
                    $stylesheetsNode->appendChild($stylesheetNode);
                }

                $oldStylesheetsNode = $xpath->query('.//pci:stylesheets', $resourcesNode);
                if ($oldStylesheetsNode->length > 0) {
                    $resourcesNode->removeChild($oldStylesheetsNode->item(0));
                }

                if ($stylesheetsNode->hasChildNodes()) {
                    $resourcesNode->appendChild($stylesheetsNode);
                }

                // Portable mediaFiles
                $mediaFilesNode = $dom->createElement('pci:mediaFiles');
                foreach ($portableElement->getRuntimeKey('mediaFiles') as $mediaFiles) {
                    $mediaFileNode = $dom->createElement('pci:file');
                    $mediaFileNode->setAttribute('src', $replacementList[$mediaFiles]);
                    $mediaFilesNode->appendChild($mediaFileNode);
                }

                $oldMediaFilesNode = $xpath->query('.//pci:mediaFiles', $resourcesNode);
                if ($oldMediaFilesNode->length > 0) {
                    $resourcesNode->removeChild($oldMediaFilesNode->item(0));
                }

                if ($mediaFilesNode->hasChildNodes()) {
                    $resourcesNode->appendChild($mediaFilesNode);
                }






//                $identifier = $attributeNodes->item($i)->setAttribute('hook', 'customInteractionTypeIdentifier');


//                $attributeNodes->item($i)->removeChild('resources');
//                $librariesNode = $attributeNodes->item($i)->appendChild('resources');

//                \common_Logger::i(print_r($portableLibraries, true));
//                foreach ($libraries[$identifier] as $library) {
////                    $librariesNode->appendChild('library')
//                }
//                \common_Logger::i(print_r(
//                    ,true));
//
////                $attributeNodes->getAttribute('customInteractionTypeIdentifier');
//                \common_Logger::i(print_r($attributeNodes->getAttribute('customInteractionTypeIdentifier'), true));
//                \common_Logger::i(print_r($attributeNodes->item($i)->nodeValue, true));
            }
//            foreach ($attributeNodes as $portableNode) {
//                \common_Logger::i($portableNode->getAttributes('customInteractionTypeIdentifier'));
//            }
//            foreach ($libraries as $library) {
//                $xpath->addChild('name', 'Mr. Parser');
//            }

//            foreach ($attributeNodes as $node) {
//                if (isset($replacementList[$node->value])) {
//                    $node->value = $replacementList[$node->value];
//                }
//            }

            $attributeNodes = $xpath->query('//portableCustomInteraction/resources/libraries');
            unset($xpath);
//            foreach ($libraries as $library) {
//
//            }
            foreach ($attributeNodes as $node) {
                \common_Logger::i($node->value);
                if (isset($replacementList[$node->value])) {
                    $node->value = $replacementList[$node->value];
                }
            }
            unset($xpath);
        } else {
            throw new ExportException($this->getItem()->getLabel(), 'Unable to load XML');
        }

        if(($content = $dom->saveXML()) === false){
            throw new ExportException($this->getItem()->getLabel(), 'Unable to save XML');
        }
        
        if ($asApip === true) {
            // 1. let's merge qti.xml and apip.xml.
            // 2. retrieve apip related assets.
            $apipService = ApipService::singleton();
            $apipContentDoc = $apipService->getApipAccessibilityContent($this->getItem());
            
            if ($apipContentDoc === null) {
                \common_Logger::i("No APIP accessibility content found for item '" . $this->getItem()->getUri() . "', default inserted.");
                $apipContentDoc = $apipService->getDefaultApipAccessibilityContent($this->getItem());
            }
            
            $qtiItemDoc = new DOMDocument('1.0', 'UTF-8');
            $qtiItemDoc->formatOutput = true;
            $qtiItemDoc->loadXML($content);
            
            // Retrieve APIP related assets...
            $content = $qtiItemDoc->saveXML();
            $fileHrefElts = $qtiItemDoc->getElementsByTagName('fileHref');
            for ($i = 0; $i < $fileHrefElts->length; $i++) {
                $fileHrefElt = $fileHrefElts->item($i);
                $destPath = $basePath . '/' . $fileHrefElt->nodeValue;
                $sourcePath = $this->getItemLocation() . $fileHrefElt->nodeValue;
                $this->addFile($sourcePath, $destPath);
            }
        }
        
        // add xml file
        $this->getZip()->addFromString($basePath . '/' . $dataFile, $content);

        return $report;

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
        $this->addFile($stream, $basePath . '/' . $baseName);
        $stream->close();
        return $replacement;
    }

    protected function getAssets(\core_kernel_classes_Resource $item, $lang)
    {
        $qtiItem = Service::singleton()->getDataItemByRdfItem($item, $lang);
        $assetParser = new AssetParser($qtiItem);
        $assetParser->setGetSharedLibraries(false);
        $assetParser->setGetCustomElement(false);
        $returnValue = array();
        foreach($assetParser->extract() as $type => $assets) {
            foreach($assets as $assetUrl) {
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
        $assetParser = new AssetParser($qtiItem);
        return $assetParser->extractPortableAssetElements();
    }
}
