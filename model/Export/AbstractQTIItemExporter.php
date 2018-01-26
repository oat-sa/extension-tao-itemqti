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
use oat\tao\model\media\sourceStrategy\HttpSource;
use oat\taoItems\model\media\LocalItemSource;
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
        $portableElements = $this->getPortableElementAssets($this->getItem(), $lang);
        $service = new PortableElementService();
        $service->setServiceLocator(ServiceManager::getServiceManager());

        $portableElementsToExport = [];
        $portableAssets = [];

        foreach($portableElements as $element) {

            if (! $element instanceof Element) {
                continue;
            }

            try {
                $object = $service->getPortableObjectFromInstance($element);
            } catch (PortableElementException $e) {
                $message = __('Fail to export item') . ' (' . $this->getItem()->getLabel() . '): ' . $e->getMessage();
                return \common_report_Report::createFailure($message);
            }

            $portableElementExporter = $object->getModel()->getExporter($object, $this);
            $portableElementsToExport[$element->getTypeIdentifier()] = $portableElementExporter;
            try {
                $portableAssets = array_merge($portableAssets, $portableElementExporter->copyAssetFiles($replacementList));
            } catch (\tao_models_classes_FileNotFoundException $e) {
                \common_Logger::i($e->getMessage());
                $report->setMessage('Missing portable element asset for "' . $object->getTypeIdentifier() . '"": ' .  $e->getMessage());
                $report->setType(\common_report_Report::TYPE_ERROR);
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
            foreach ($portableElementsToExport as $portableElementExporter){
                $portableElementExporter->exportDom($dom);
            }

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

        ///return some useful data to the export report
        $report->setData(['portableAssets' => $portableAssets]);

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
        return $replacement;
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
}
