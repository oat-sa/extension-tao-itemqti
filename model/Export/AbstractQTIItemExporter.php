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
use oat\tao\model\media\sourceStrategy\HttpSource;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\qti\exception\ExportException;
use taoItems_models_classes_ItemExporter;
use oat\taoQtiItem\model\qti\AssetParser;
use oat\taoQtiItem\model\apip\ApipService;
use oat\taoQtiItem\helpers\Apip;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\qti\Service;
use oat\oatbox\service\ServiceManager;

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
     * @param array $options An array of options.
     * @return \common_report_Report $report
     * @see taoItems_models_classes_ItemExporter::export()
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
        // get the local resources and add them
        foreach ($this->getAssets($this->getItem(), $lang) as $assetUrl) {
            try{
                $mediaAsset = $resolver->resolve($assetUrl);
                $mediaSource = $mediaAsset->getMediaSource();
                if(!$mediaSource instanceof HttpSource){
                    $link = $mediaAsset->getMediaIdentifier();
                    $stream = $mediaSource->getFileStream($link);
                    $baseName = ($mediaSource instanceof LocalItemSource)? $link : 'assets/'.$mediaSource->getBaseName($link);
                    $replacement = $baseName;
                    $count = 0;
                    while (in_array($replacement, $replacementList)) {
                        $dot = strrpos($baseName, '.');
                        $replacement = $dot !== false
                        ? substr($baseName, 0, $dot).'_'.$count.substr($baseName, $dot)
                            : $baseName.$count;
                        $count++;
                    }

                    $replacementList[$assetUrl] = $replacement;
                    $this->addFile($stream, $basePath.'/'.$baseName);
                }
            } catch(\tao_models_classes_FileNotFoundException $e){
                $replacementList[$assetUrl] = '';
                $report->setMessage('Missing resource for ' . $assetUrl);
                $report->setType(\common_report_Report::TYPE_ERROR);
            }
        }
        $xml = Service::singleton()->getXmlByRdfItem($this->getItem());
        $dom = new \DOMDocument('1.0', 'UTF-8');
        if ($dom->loadXML($xml) === true) {
            $xpath = new \DOMXPath($dom);
            $attributeNodes = $xpath->query('//@*');
            unset($xpath);
            foreach ($attributeNodes as $node) {
                if (isset($replacementList[$node->value])) {
                    $node->value = $replacementList[$node->value];
                }
            }
        } else {
            throw new ExportException($this->getItem()->getLabel(), 'Unable to load XML');
        }
        if(($content = $dom->saveXML()) === false){
            throw new ExportException($this->getItem()->getLabel(), 'Unable to save XML');
        }

        // Possibility to delegate (if necessary) some item content post-processing to sub-classes.
        $content = $this->itemContentPostProcessing($content);
        
        // add xml file
        $this->getZip()->addFromString($basePath . '/' . $dataFile, $content);

        return $report;

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

    /**
     * Get the item's directory
     *
     * @param \core_kernel_classes_Resource $item The item
     * @param string                        $lang The item lang
     *
     * @return \tao_models_classes_service_StorageDirectory The directory
     */
    protected function getStorageDirectory(\core_kernel_classes_Resource $item, $lang)
    {
        $itemService = \taoItems_models_classes_ItemsService::singleton();
        $directory = $itemService->getItemDirectory($item, $lang);

        //we should use be language unaware for storage manipulation
        $path = str_replace($lang, '', $directory->getPrefix());
        $storageDirectory = new \tao_models_classes_service_StorageDirectory($item->getUri(), $directory->getFilesystem()->getId(), $path);
        $storageDirectory->setServiceLocator($this->getServiceManager());

        return $storageDirectory;
    }

    protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }

}
