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
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementFactory;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\pic\model\PicModel;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\exception\ExportException;
use Psr\Http\Message\StreamInterface;
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
     * @throws \oat\taoQtiItem\model\portableElement\common\exception\PortableElementInvalidAssetException
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
        $dataFile = (string) $this->getItemModel()->getOnePropertyValue(new core_kernel_classes_Property(TAO_ITEM_MODEL_DATAFILE_PROPERTY));
        $resolver = new ItemMediaResolver($this->getItem(), $lang);
	    $replacementList = array();
        $modelsAssets = $this->getPortableElementAssets($this->getItem(), $lang);
        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $portableElementsToExport = $portableAssetsToExport = [];

        foreach ($modelsAssets as $key => $portableElements) {

            if ($key == 'pciElement') {
                $model = new PciModel();
            } elseif ($key == 'picElement') {
                $model = new PicModel();
            } else {
                \common_Logger::i('QTI item exporter is not correctly set. Unknown key model ' . $key);
                continue;
            }

            /** @var PortableElementModel $portableElement */
            foreach($portableElements as $element) {

                if (!$element instanceof Element) {
                    continue;
                }

                $model->setTypeIdentifier($element->getTypeIdentifier());
                $portableElement = $service->hydrateModel($model);
                $portableElementsToExport[$portableElement->getTypeIdentifier()] = $portableElement;

                $validator = PortableElementFactory::getValidator($portableElement);
                $files = $validator->getRequiredAssets('runtime');

                $baseUrl = $basePath . DIRECTORY_SEPARATOR . $portableElement->getTypeIdentifier();
                $portableAssetsToExport[$portableElement->getTypeIdentifier()] = [];

                foreach ($files as $url) {
                    try {
                        // Skip shared libraries into portable element
                        if (strpos($url, './') !== 0) {
                            \common_Logger::i('Shared libraries skipped : ' . $url);
                            $portableAssetsToExport[$portableElement->getTypeIdentifier()][$url] = $url;
                            continue;
                        }
                        $stream = $service->getFileStream($portableElement, $url);
                        $replacement = $this->copyAssetFile($stream, $baseUrl, $url, $replacementList);
                        $portableAssetToExport = preg_replace('/^(.\/)(.*)/', $portableElement->getTypeIdentifier() . "/$2", $replacement);
                        $portableAssetToExport =  preg_replace( '/^(.\/)/', '',$portableAssetToExport);
                        $portableAssetsToExport[$portableElement->getTypeIdentifier()][$url] = $portableAssetToExport;
                        \common_Logger::i('File copied: "' . $url . '" for portable element ' . $portableElement->getTypeIdentifier());
                    } catch (\tao_models_classes_FileNotFoundException $e) {
                        \common_Logger::i($e->getMessage());
                        $report->setMessage('Missing resource for ' . $url);
                        $report->setType(\common_report_Report::TYPE_ERROR);
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
                    $replacementList[$assetUrl] = $replacement;
                }
            } catch(\tao_models_classes_FileNotFoundException $e){
                $replacementList[$assetUrl] = '';
                $report->setMessage('Missing resource for ' . $assetUrl);
                $report->setType(\common_report_Report::TYPE_ERROR);
            }
        }
        $xml = Service::singleton()->getXmlByRdfItem($this->getItem());
        $dom = new DOMDocument('1.0', 'UTF-8');
        if ($dom->loadXML($xml) === true) {
            $this->exportPortableAssets($dom, 'portableCustomInteraction', 'customInteractionTypeIdentifier', 'pci', $portableElementsToExport, $portableAssetsToExport);
            $this->exportPortableAssets($dom, 'portableInfoControl', 'infoControlTypeIdentifier', 'pic', $portableElementsToExport, $portableAssetsToExport);
        } else {
            throw new ExportException($this->getItem()->getLabel(), 'Unable to load XML');
        }

        $dom->preserveWhiteSpace = true;
        $dom->formatOutput = true;
        if(($content = $dom->saveXML()) === false){
            throw new ExportException($this->getItem()->getLabel(), 'Unable to save XML');
        }

        // Possibility to delegate (if necessary) some item content post-processing to sub-classes.
        $content = $this->itemContentPostProcessing($content);
        
        // add xml file
        $this->getZip()->addFromString($basePath . '/' . $dataFile, $content);

        return $report;
    }

    private function exportPortableAssets(DOMDocument $dom, $nodeName, $typeIdentifierAttributeName, $ns, $portableElementsToExport, $portableAssetsToExport){

        $xpath = new DOMXPath($dom);

        // Get all portable element from qti.xml
        $portableElementNodes = $dom->getElementsByTagName($nodeName);

        for ($i=0; $i<$portableElementNodes->length; $i++) {

            $identifier = $portableElementNodes->item($i)->getAttribute($typeIdentifierAttributeName);

            if (! isset($portableElementsToExport[$identifier])) {
                throw new \common_Exception('Unable to find loaded portable element.');
            }
            $portableElement = $portableElementsToExport[$identifier];

            // Add hook and version as attributes
            if ($portableElement->hasRuntimeKey('hook'))
                $portableElementNodes->item($i)->setAttribute(
                    'hook',
                    preg_replace(
                        '/^(.\/)(.*)/', $portableElement->getTypeIdentifier() . "/$2",
                        $portableElement->getRuntimeKey('hook')
                    )
                );
            $portableElementNodes->item($i)->setAttribute('version', $portableElement->getVersion());
            // If asset files list is empty for current identifier skip
            if ( (! isset($portableAssetsToExport))
                || (! isset($portableAssetsToExport[$portableElement->getTypeIdentifier()]))
            ) {
                continue;
            }

            $resourcesNode = $portableElementNodes->item($i)->getElementsByTagName('resources')->item(0);

            // Portable libraries
            $librariesNode = $dom->createElement($ns.':libraries');
            foreach ($portableElement->getRuntimeKey('libraries') as $library) {
                $libraryNode = $dom->createElement($ns.':lib');
                //the exported lib id must be adapted from a href mode to an amd name mode
                $libraryNode->setAttribute(
                    'id', preg_replace('/\.js$/', '', $portableAssetsToExport[$portableElement->getTypeIdentifier()][$library])
                );
                $librariesNode->appendChild($libraryNode);
            }

            $oldLibrariesNode = $xpath->query('.//'.$ns.':libraries', $resourcesNode);
            if ($oldLibrariesNode->length > 0) {
                $resourcesNode->removeChild($oldLibrariesNode->item(0));
            }
            if ($librariesNode->hasChildNodes()) {
                $resourcesNode->appendChild($librariesNode);
            }

            // Portable stylesheets
            $stylesheetsNode = $dom->createElement($ns.':stylesheets');
            foreach ($portableElement->getRuntimeKey('stylesheets') as $stylesheet) {
                $stylesheetNode = $dom->createElement($ns.':link');
                $stylesheetNode->setAttribute(
                    'href', $portableAssetsToExport[$portableElement->getTypeIdentifier()][$stylesheet]
                );
                $stylesheetNode->setAttribute('type', 'text/css');

                $info = pathinfo($stylesheet);
                $stylesheetNode->setAttribute('title', basename($stylesheet, '.' . $info['extension']));
                $stylesheetsNode->appendChild($stylesheetNode);
            }
            $oldStylesheetsNode = $xpath->query('.//'.$ns.':stylesheets', $resourcesNode);
            if ($oldStylesheetsNode->length > 0) {
                $resourcesNode->removeChild($oldStylesheetsNode->item(0));
            }
            if ($stylesheetsNode->hasChildNodes()) {
                $resourcesNode->appendChild($stylesheetsNode);
            }

            // Portable mediaFiles
            $mediaFilesNode = $dom->createElement($ns.':mediaFiles');
            foreach ($portableElement->getRuntimeKey('mediaFiles') as $mediaFile) {
                $mediaFileNode = $dom->createElement($ns.':file');
                $mediaFileNode->setAttribute(
                    'src', $portableAssetsToExport[$portableElement->getTypeIdentifier()][$mediaFile]
                );
                $mediaFileNode->setAttribute('type', \tao_helpers_File::getMimeType(
                    $portableAssetsToExport[$portableElement->getTypeIdentifier()][$mediaFile]
                ));
                $mediaFilesNode->appendChild($mediaFileNode);
            }
            $oldMediaFilesNode = $xpath->query('.//'.$ns.':mediaFiles', $resourcesNode);
            if ($oldMediaFilesNode->length > 0) {
                $resourcesNode->removeChild($oldMediaFilesNode->item(0));
            }

            if ($mediaFilesNode->hasChildNodes()) {
                $resourcesNode->appendChild($mediaFilesNode);
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
        $this->addFile($stream, $basePath . '/' . $baseName);
        $stream->close();
        return $replacement;
    }

    protected function getAssets(\core_kernel_classes_Resource $item, $lang)
    {
        $qtiItem = Service::singleton()->getDataItemByRdfItem($item, $lang);
        $assetParser = new AssetParser($qtiItem);
        $assetParser->setGetSharedLibraries(false);
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
        $assetParser->setGetCustomElementDefinition(true);
        return $assetParser->extractPortableAssetElements();
    }
}
