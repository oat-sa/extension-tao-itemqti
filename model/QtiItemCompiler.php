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
 */

namespace oat\taoQtiItem\model;

use common_Logger;
use common_report_Report;
use core_kernel_classes_Resource;
use oat\taoQtiItem\model\qti\exception\XIncludeException;
use oat\taoQtiItem\model\qti\Service;
use tao_helpers_File;
use tao_models_classes_service_ConstantParameter;
use tao_models_classes_service_ServiceCall;
use tao_models_classes_service_StorageDirectory;
use taoItems_models_classes_ItemCompiler;
use taoItems_models_classes_ItemsService;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\qti\AssetParser;
use oat\taoQtiItem\model\qti\XIncludeLoader;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\IdentifiedElementContainer;
use GuzzleHttp\Psr7\Stream;
use League\Flysystem\File;

/**
 * The QTI Item Compiler
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoItems
 */
class QtiItemCompiler extends taoItems_models_classes_ItemCompiler
{
    /**
     * instance representing the service to run the QTI item
     * @var string
     */
    const INSTANCE_ITEMRUNNER = 'http://www.tao.lu/Ontologies/TAOItem.rdf#ServiceQtiItemRunner';
    
    /**
     * List of regexp of media that should be excluded from retrieval
     */
    private static $BLACKLIST = array(
        '/^https?:\/\/(www\.youtube\.[a-zA-Z]*|youtu\.be)\//',
        '/^data:[^\/]+\/[^;]+(;charset=[\w]+)?;base64,/'
    );
    
    /**
     * Compile qti item
     *
     * @throws taoItems_models_classes_CompilationFailedException
     * @return tao_models_classes_service_ServiceCall
     */
    public function compile()
    {

        $publicDirectory = $this->spawnPublicDirectory();
        $privateDirectory = $this->spawnPrivateDirectory();
        $item = $this->getResource();

        $report = new common_report_Report(common_report_Report::TYPE_SUCCESS, __('Published %s', $item->getLabel()));
        if (!taoItems_models_classes_ItemsService::singleton()->isItemModelDefined($item)) {
            return $this->fail(__('Item \'%s\' has no model', $item->getLabel()));
        }

        $langs = $this->getContentUsedLanguages();
        if (empty($langs)) {
            $report->setType(common_report_Report::TYPE_ERROR);
            $report->setMessage(__('Item "%s" is not available in any language', $item->getLabel()));
        }
        foreach ($langs as $compilationLanguage) {
            $langReport = $this->deployQtiItem($item, $compilationLanguage, $publicDirectory, $privateDirectory);
            $report->add($langReport);
            if ($langReport->getType() == common_report_Report::TYPE_ERROR) {
                $report->setType(common_report_Report::TYPE_ERROR);
                $report->setMessage(__('Failed to publish %1$s in %2$s', $item->getLabel(), $compilationLanguage));
                break;
            }
        }
        if ($report->getType() == common_report_Report::TYPE_SUCCESS) {
            $report->setData($this->createQtiService($item, $publicDirectory, $privateDirectory));
        }

        return $report;
    }

    /**
     * Create a servicecall that runs the prepared qti item
     *
     * @param core_kernel_classes_Resource $item
     * @param tao_models_classes_service_StorageDirectory $publicDirectory
     * @param tao_models_classes_service_StorageDirectory $privateDirectory
     * @return tao_models_classes_service_ServiceCall
     */
    protected function createQtiService(
        core_kernel_classes_Resource $item,
        tao_models_classes_service_StorageDirectory $publicDirectory,
        tao_models_classes_service_StorageDirectory $privateDirectory
    ) {

        $service = new tao_models_classes_service_ServiceCall(new core_kernel_classes_Resource(self::INSTANCE_ITEMRUNNER));
        $service->addInParameter(new tao_models_classes_service_ConstantParameter(
                new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_ITEMPATH), $publicDirectory->getId()
            )
        );
        $service->addInParameter(
            new tao_models_classes_service_ConstantParameter(
                new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_ITEMDATAPATH), $privateDirectory->getId()
            )
        );
        $service->addInParameter(
            new tao_models_classes_service_ConstantParameter(
                new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_ITEMURI), $item
            )
        );

        return $service;
    }

    /**
     * Desploy all the required files into the provided directories
     *
     * @param core_kernel_classes_Resource $item
     * @param string $language
     * @param \tao_models_classes_service_StorageDirectory $publicDirectory
     * @param \tao_models_classes_service_StorageDirectory $privateDirectory
     * @return common_report_Report
     */
    protected function deployQtiItem(core_kernel_classes_Resource $item, $language, $publicDirectory, $privateDirectory)
    {
        $itemService = taoItems_models_classes_ItemsService::singleton();
        $qtiService = Service::singleton();

        //copy item.xml file to private directory
        $itemDir = $itemService->getItemDirectory($item, $language);

        $sourceItem = $itemDir->getFile('qti.xml');
        $privateDirectory->writeStream($language . '/qti.xml', $sourceItem->readStream());

        //copy client side resources (javascript loader)
        $qtiItemDir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $taoDir = \common_ext_ExtensionsManager::singleton()->getExtensionById('tao')->getDir();
        $assetPath = $qtiItemDir . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR;
        $assetLibPath = $taoDir . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR;
        if (\tao_helpers_Mode::is('production')) {
            $fh = fopen($assetPath . 'qtiLoader.min.js','r');
            $publicDirectory->writeStream($language.'/qtiLoader.min.js', $fh);
            fclose($fh);
        } else {
            $fh = fopen($assetPath . 'qtiLoader.js','r');
            $publicDirectory->writeStream($language.'/qtiLoader.js', $fh);
            fclose($fh);
            $fh = fopen($assetLibPath . 'require.js','r');
            $publicDirectory->writeStream($language.'/require.js', $fh);
            fclose($fh);
        }

        //  retrieve the media assets
        try {
            $qtiItem = $this->retrieveAssets($item, $language, $publicDirectory);

            //store variable qti elements data into the private directory
            $variableElements = $qtiService->getVariableElements($qtiItem);

            $stream = \GuzzleHttp\Psr7\stream_for(json_encode($variableElements));
            $privateDirectory->writePsrStream($language.'/variableElements.json', $stream);
            $stream->close();

            // render item based on the modified QtiItem
            $xhtml = $qtiService->renderQTIItem($qtiItem, $language);

            //note : no need to manually copy qti or other third party lib files, all dependencies are managed by requirejs
            // write index.html
            $stream = \GuzzleHttp\Psr7\stream_for($xhtml);
            $publicDirectory->writePsrStream($language.'/index.html', $stream, 'text/html');
            $stream->close();

            return new common_report_Report(
                common_report_Report::TYPE_SUCCESS, __('Successfully compiled "%s"', $language)
            );
        } catch (\tao_models_classes_FileNotFoundException $e) {
            return new common_report_Report(
                common_report_Report::TYPE_ERROR, __('Unable to retrieve asset "%s"', $e->getFilePath())
            );
        } catch (XIncludeException $e){
            return new common_report_Report(
                common_report_Report::TYPE_ERROR, $e->getUserMessage()
            );
        } catch (\Exception $e){
            return new common_report_Report(
                common_report_Report::TYPE_ERROR, $e->getMessage()
            );
        }
    }

    /**
     *
     * @param core_kernel_classes_Resource $item
     * @param string $lang
     * @param \tao_models_classes_service_StorageDirectory $publicDirectory
     * @return qti\Item
     */
    protected function retrieveAssets(core_kernel_classes_Resource $item, $lang, $publicDirectory)
    {
        $qtiItem  = Service::singleton()->getDataItemByRdfItem($item, $lang);

        $assetParser = new AssetParser($qtiItem, $publicDirectory);
        $assetParser->setGetSharedLibraries(false);
        $assetParser->setGetXinclude(false);
        $resolver = new ItemMediaResolver($item, $lang);
        $replacementList = array();
        foreach($assetParser->extract() as $type => $assets) {
            foreach($assets as $assetUrl) {
                foreach (self::$BLACKLIST as $blacklist) {
                    if (preg_match($blacklist, $assetUrl) === 1) {
                        continue(2);
                    }
                }
                $mediaAsset = $resolver->resolve($assetUrl);
                $mediaSource = $mediaAsset->getMediaSource();

                $basename = $mediaSource->getBaseName($mediaAsset->getMediaIdentifier());
                $replacement = $basename;
                $count = 0;
                while (in_array($replacement, $replacementList)) {
                    $dot = strrpos($basename, '.');
                    $replacement = $dot !== false
                        ? substr($basename, 0, $dot).'_'.$count.substr($basename, $dot)
                        : $basename.$count;
                    $count++;
                }
                $replacementList[$assetUrl] = $replacement;
                $tmpfile = $mediaSource->download($mediaAsset->getMediaIdentifier());
                $fh = fopen($tmpfile, 'r');
                $publicDirectory->writeStream($lang.'/'.$replacement, $fh);
                fclose($fh);
                unlink($tmpfile);

                //$fileStream = $mediaSource->getFileStream($mediaAsset->getMediaIdentifier());
                //$publicDirectory->writeStream($lang.'/'.$replacement, $fileStream);

            }
        }

        $dom = new \DOMDocument('1.0', 'UTF-8');
        if ($dom->loadXML($qtiItem->toXml()) === true) {
        
            $xpath = new \DOMXPath($dom);
            $attributeNodes = $xpath->query('//@*');
            foreach ($attributeNodes as $node) {
                if (isset($replacementList[$node->value])) {
                    $node->value = $replacementList[$node->value];
                }
            }
            $attributeNodes = $xpath->query('//pci:entry');
            unset($xpath);
            if ($attributeNodes->length > 0) {
                foreach ($attributeNodes as $node) {
                    $node->nodeValue = str_replace(array_keys($replacementList), array_values($replacementList), $node->nodeValue);
                }
            }
        } else {
            throw new \taoItems_models_classes_CompilationFailedException('Unable to load XML');
        }

        $qtiParser = new Parser($dom->saveXML());
        $assetRetrievedQtiItem =  $qtiParser->load();
        
         //loadxinclude
        $xincludeLoader = new XIncludeLoader($assetRetrievedQtiItem, $resolver);
        $xincludeLoader->load(true);

        return $assetRetrievedQtiItem;
    }

}
