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

use common_report_Report;
use core_kernel_classes_Resource;
use oat\oatbox\filesystem\Directory;
use oat\taoItems\model\ItemCompilerIndex;
use oat\taoQtiItem\model\compile\QtiItemCompilerAssetBlacklist;
use oat\taoQtiItem\model\qti\exception\XIncludeException;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use tao_models_classes_service_ConstantParameter;
use tao_models_classes_service_ServiceCall;
use tao_models_classes_service_StorageDirectory;
use taoItems_models_classes_CompilationFailedException;
use taoItems_models_classes_ItemCompiler;
use taoItems_models_classes_ItemsService;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\qti\AssetParser;
use oat\taoQtiItem\model\qti\XIncludeLoader;
use oat\taoItems\model\media\ItemMediaResolver;

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
    public const INSTANCE_ITEMRUNNER = 'http://www.tao.lu/Ontologies/TAOItem.rdf#ServiceQtiItemRunner';

    /**
     * {@inheritDoc}
     * @see \tao_models_classes_Compiler::compile()
     */
    public function compile()
    {
        $report = $this->internalCompile();
        if ($report->getType() == common_report_Report::TYPE_SUCCESS) {
            // replace instances with service
            list($item, $publicDirectory, $privateDirectory) = $report->getData();
            $report->setData($this->createQtiService($item, $publicDirectory, $privateDirectory));
        }
        return $report;
    }

    /**
     * Compile qti item
     *
     * @throws taoItems_models_classes_CompilationFailedException
     * @return common_report_Report
     */
    protected function internalCompile()
    {
        $item = $this->getResource();
        $publicDirectory = $this->spawnPublicDirectory();
        $privateDirectory = $this->spawnPrivateDirectory();

        $report = new common_report_Report(common_report_Report::TYPE_SUCCESS, __('Published %s', $item->getLabel()));
        $report->setData([$item, $publicDirectory, $privateDirectory]);
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

        $service = new tao_models_classes_service_ServiceCall(
            new core_kernel_classes_Resource(self::INSTANCE_ITEMRUNNER)
        );
        $service->addInParameter(new tao_models_classes_service_ConstantParameter(
            new core_kernel_classes_Resource(taoItems_models_classes_ItemsService::INSTANCE_FORMAL_PARAM_ITEM_PATH),
            $publicDirectory->getId()
        ));
        $service->addInParameter(
            new tao_models_classes_service_ConstantParameter(
                new core_kernel_classes_Resource(
                    taoItems_models_classes_ItemsService::INSTANCE_FORMAL_PARAM_ITEM_DATA_PATH
                ),
                $privateDirectory->getId()
            )
        );
        $service->addInParameter(
            new tao_models_classes_service_ConstantParameter(
                new core_kernel_classes_Resource(taoItems_models_classes_ItemsService::INSTANCE_FORMAL_PARAM_ITEM_URI),
                $item
            )
        );

        return $service;
    }

    /**
     * Desploy all the required files into the provided directories
     *
     * @param core_kernel_classes_Resource $item
     * @param string $language
     * @param tao_models_classes_service_StorageDirectory $publicDirectory
     * @param tao_models_classes_service_StorageDirectory $privateDirectory
     * @return common_report_Report
     */
    protected function deployQtiItem(
        core_kernel_classes_Resource $item,
        $language,
        tao_models_classes_service_StorageDirectory $publicDirectory,
        tao_models_classes_service_StorageDirectory $privateDirectory
    ) {
        $itemService = taoItems_models_classes_ItemsService::singleton();
        $qtiService = Service::singleton();

        //copy item.xml file to private directory
        $itemDir = $itemService->getItemDirectory($item, $language);

        $sourceItem = $itemDir->getFile('qti.xml');
        $privateDirectory->writeStream($language . '/qti.xml', $sourceItem->readStream());

        //copy client side resources (javascript loader)
        $qtiItemDir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $taoDir = \common_ext_ExtensionsManager::singleton()->getExtensionById('tao')->getDir();
        $assetPath = $qtiItemDir . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR;
        $assetLibPath = $taoDir . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR
            . 'lib' . DIRECTORY_SEPARATOR;

        if (\tao_helpers_Mode::is('production')) {
            $fh = fopen($assetPath . 'loader' . DIRECTORY_SEPARATOR . 'qtiLoader.min.js', 'r');
            $publicDirectory->writeStream($language . '/qtiLoader.min.js', $fh);
            fclose($fh);
        } else {
            $fh = fopen($assetPath . 'runtime' . DIRECTORY_SEPARATOR . 'qtiLoader.js', 'r');
            $publicDirectory->writeStream($language . '/qtiLoader.js', $fh);
            fclose($fh);
            $fh = fopen($assetLibPath . 'require.js', 'r');
            $publicDirectory->writeStream($language . '/require.js', $fh);
            fclose($fh);
        }

        //  retrieve the media assets
        try {
            $qtiItem = $this->retrieveAssets($item, $language, $publicDirectory);
            $this->compileItemIndex($item->getUri(), $qtiItem, $language);

            //store variable qti elements data into the private directory
            $variableElements = $qtiService->getVariableElements($qtiItem);

            $stream = \GuzzleHttp\Psr7\stream_for(json_encode($variableElements));
            $privateDirectory->writePsrStream($language . '/variableElements.json', $stream);
            $stream->close();

            // render item based on the modified QtiItem
            $xhtml = $qtiService->renderQTIItem($qtiItem, $language);

            //note : no need to manually copy qti or other third party lib files, all dependencies are managed
            // by requirejs
            // write index.html
            $stream = \GuzzleHttp\Psr7\stream_for($xhtml);
            $publicDirectory->writePsrStream($language . '/index.html', $stream, 'text/html');
            $stream->close();

            return new common_report_Report(
                common_report_Report::TYPE_SUCCESS,
                __('Successfully compiled "%s"', $language)
            );
        } catch (\tao_models_classes_FileNotFoundException $e) {
            return new common_report_Report(
                common_report_Report::TYPE_ERROR,
                __('Unable to retrieve asset "%s"', $e->getFilePath())
            );
        } catch (XIncludeException $e) {
            return new common_report_Report(
                common_report_Report::TYPE_ERROR,
                $e->getUserMessage()
            );
        } catch (\Exception $e) {
            return new common_report_Report(
                common_report_Report::TYPE_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * @param core_kernel_classes_Resource $item
     * @param string $lang
     * @param Directory $publicDirectory
     * @return qti\Item
     * @throws taoItems_models_classes_CompilationFailedException
     */
    protected function retrieveAssets(core_kernel_classes_Resource $item, $lang, Directory $publicDirectory)
    {
        $qtiItem  = Service::singleton()->getDataItemByRdfItem($item, $lang);

        if (is_null($qtiItem)) {
            throw new taoItems_models_classes_CompilationFailedException(
                __('Unable to retrieve item : ' . $item->getLabel())
            );
        }

        $assetParser = new AssetParser($qtiItem, $publicDirectory);
        $assetParser->setGetSharedLibraries(false);
        $assetParser->setGetXinclude(false);
        $resolver = new ItemMediaResolver($item, $lang);
        $replacementList = [];
        foreach ($assetParser->extract() as $type => $assets) {
            foreach ($assets as $assetUrl) {

                /** @var QtiItemCompilerAssetBlacklist $blacklistService */
                $blacklistService = $this->getServiceLocator()->get(QtiItemCompilerAssetBlacklist::SERVICE_ID);
                if ($blacklistService->isBlacklisted($assetUrl)) {
                    continue;
                }

                $mediaAsset = $resolver->resolve($assetUrl);
                $mediaSource = $mediaAsset->getMediaSource();

                $basename = $mediaSource->getBaseName($mediaAsset->getMediaIdentifier());
                $replacement = $basename;
                $count = 0;
                while (in_array($replacement, $replacementList)) {
                    $dot = strrpos($basename, '.');
                    $replacement = $dot !== false
                        ? substr($basename, 0, $dot) . '_' . $count . substr($basename, $dot)
                        : $basename . $count;
                    $count++;
                }
                $replacementList[$assetUrl] = $replacement;
                $tmpfile = $mediaSource->download($mediaAsset->getMediaIdentifier());
                $fh = fopen($tmpfile, 'r');
                $publicDirectory->writeStream($lang . '/' . $replacement, $fh);
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

            //@TODO : Fix me please
            $attributeNodes = $xpath->query("//*[local-name()='entry']|//*[local-name()='property']") ?: [];
            unset($xpath);
            foreach ($attributeNodes as $node) {
                if ($node->nodeValue) {
                    $node->nodeValue = strtr(htmlentities($node->nodeValue, ENT_XML1), $replacementList);
                }
            }
        } else {
            throw new taoItems_models_classes_CompilationFailedException('Unable to load XML');
        }

        $qtiParser = new Parser($dom->saveXML());
        $assetRetrievedQtiItem =  $qtiParser->load();

        //loadxinclude
        $xincludeLoader = new XIncludeLoader($assetRetrievedQtiItem, $resolver);
        $xincludeLoader->load(false);

        return $assetRetrievedQtiItem;
    }

    /**
     * @param string $uri
     * @param Item $qtiItem
     * @param $language
     */
    protected function compileItemIndex($uri, Item $qtiItem, $language)
    {
        $context = $this->getContext();
        if ($context && $context instanceof ItemCompilerIndex) {
            $context->setItem($uri, $language, $qtiItem->getAttributeValues());
        }
    }
}
