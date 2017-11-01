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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\scripts\update;

use League\Flysystem\Adapter\Local;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ServiceNotFoundException;
use oat\tao\model\TaoOntology;
use oat\tao\model\asset\AssetService;
use oat\tao\model\websource\ActionWebSource;
use oat\tao\model\websource\WebsourceManager;
use oat\tao\scripts\update\OntologyUpdater;
use oat\taoQtiItem\install\scripts\addValidationSettings;
use oat\taoQtiItem\install\scripts\createExportDirectory;
use oat\taoQtiItem\install\scripts\SetDragAndDropConfig;
use oat\taoQtiItem\model\Export\Extractor\MetaDataOntologyExtractor;
use oat\taoQtiItem\model\Export\ItemMetadataByClassExportHandler;
use oat\taoQtiItem\model\flyExporter\extractor\OntologyExtractor;
use oat\taoQtiItem\model\flyExporter\extractor\QtiExtractor;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;
use oat\taoQtiItem\model\ItemCategoriesService;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\portableElement\storage\PortableElementFileStorage;
use oat\tao\model\ClientLibRegistry;
use oat\taoQtiItem\model\update\ItemUpdateInlineFeedback;
use oat\taoQtiItem\model\QtiCreatorClientConfigRegistry;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\model\accessControl\func\AccessRule;
use oat\taoQtiItem\controller\QtiPreview;
use oat\taoQtiItem\controller\QtiCreator;
use oat\taoQtiItem\controller\QtiCssAuthoring;
use oat\taoQtiItem\scripts\install\InitMetadataService;
use oat\taoQtiItem\scripts\install\SetItemModel;
use oat\taoQtiItem\model\qti\ImportService;
use taoItems_actions_form_RestItemForm;
use taoItems_models_classes_ItemsService;
use taoTests_models_classes_TestsService;

/**
 *
 * @author Sam <sam@taotesting.com>
 */
class Updater extends \common_ext_ExtensionUpdater
{

    /**
     *
     * @param string $initialVersion
     * @return string
     */
    public function update($initialVersion){

        $currentVersion = $initialVersion;

        $this->setVersion($currentVersion);

        $this->skip('2.6', '2.7.4');

        if($currentVersion == '2.7.4'){
            $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
            $ext->setConfig('qtiCreator', array('multi-column' => false));
            $currentVersion = '2.7.5';
        }

        $this->skip('2.7.5', '2.7.8');

		if($currentVersion == '2.7.8'){

            $clientLibRegistry = ClientLibRegistry::getRegistry();
            $clientLibRegistry->register('qtiCustomInteractionContext', '../../../taoQtiItem/views/js/runtime/qtiCustomInteractionContext');
            $clientLibRegistry->register('qtiInfoControlContext', '../../../taoQtiItem/views/js/runtime/qtiInfoControlContext');

            $currentVersion = '2.7.9';
        }

        $this->skip('2.7.9', '2.8.1');

        if ($currentVersion == '2.8.1') {
            $qtiItem = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
            $qtiItem->setConfig('userScripts', array());
            $currentVersion = '2.9.0';
        }

        $this->skip('2.9.0', '2.12.0');

        if($this->isBetween('2.12.0','2.13.0')) {
            $itemQtiExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
            $compilerClassConfig = 'oat\taoQtiItem\model\QtiItemCompiler';

            $itemQtiExt->setConfig('compilerClass', $compilerClassConfig);
            $this->setVersion('2.13.0');
        }

	    if($this->isVersion('2.13.0')) {

            \oat\tao\model\ClientLibConfigRegistry::getRegistry()->register(
                'taoQtiItem/qtiRunner/core/QtiRunner',
                array(
                    'inlineModalFeedback' => false
                )
            );

            $dir = \taoItems_models_classes_ItemsService::singleton()->getDefaultItemDirectory();

            // maybe it's a dirty way but it's quicker. too much modification would have been required in ItemUpdater
            $adapter = $dir->getFileSystem()->getAdapter();
            if (!$adapter instanceof Local) {
                throw new \Exception(__CLASS__.' can only handle local files');
            }
            $itemUpdater = new ItemUpdateInlineFeedback($adapter->getPathPrefix());
            $itemUpdater->update(true);

            $this->setVersion('2.14.0');
        }

		$this->skip('2.14.0','2.15.1');

        if($this->isVersion('2.15.1')){
            $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
            $validation = array(
                'default' => array(
                    __DIR__.'/../../model/qti/data/imscp_v1p1.xsd',
                    __DIR__.'/../../model/qti/data/apipv1p0/Core_Level/Package/apipv1p0_imscpv1p2_v1p0.xsd'
                )
            );
            $ext->setConfig('manifestValidation', $validation);
            $this->setVersion('2.16.0');
        }

        if($this->isVersion('2.16.0')){
            $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
            $validation = array(
                'http://www.imsglobal.org/xsd/imsqti_v2p0' => array(
                    __DIR__.'/../../model/qti/data/qtiv2p0/imsqti_v2p0.xsd'
                ),
                'http://www.imsglobal.org/xsd/apip/apipv1p0/qtiitem/imsqti_v2p1' => array(
                    __DIR__.'/../../model/qti/data/apipv1p0/Core_Level/Package/apipv1p0_qtiitemv2p1_v1p0.xsd'
                ),
                'default' => array(
                    __DIR__.'/../../model/qti/data/qtiv2p1/imsqti_v2p1.xsd',
                )
            );
            $ext->setConfig('contentValidation', $validation);
            $this->setVersion('2.17.0');
        }

		if($this->isVersion('2.17.0')){
			$this->setVersion('2.17.1');
		}

        if($this->isVersion('2.17.1')){
            $service = new addValidationSettings();
            $service([]);
            $this->setVersion('2.17.2');
        }

		$this->skip('2.17.2', '2.19.0');

        if ($this->isVersion('2.19.0')) {

            if (!$this->getServiceManager()->has(SimpleExporter::SERVICE_ID)) {
                $service = new ItemExporter(array(
                    'fileSystem' => 'taoQtiItem',
                    'fileLocation' => 'export' . DIRECTORY_SEPARATOR . 'export.csv',
                    'extractors' => array (
                        'OntologyExtractor' => new OntologyExtractor(),
                        'QtiExtractor' => new QtiExtractor()
                    ),
                    'columns' => array (
                        'label' => array (
                            'extractor' => 'OntologyExtractor',
                            'parameters' => array (
                                'property' => RDFS_LABEL
                            )
                        ),
                        'type' => array (
                            'extractor' => 'QtiExtractor',
                            'parameters' => array (
                                'callback' => 'getInteractionType'
                            )
                        ),
                        'nb choice' => array (
                            'extractor' => 'QtiExtractor',
                            'parameters' => array (
                                'callback' => 'getNumberOfChoices'
                            )
                        ),
                        'BR' => array (
                            'extractor' => 'QtiExtractor',
                            'parameters' => array (
                                'callback' => 'getRightAnswer',
                                'callbackParameters' => array(
                                    'delimiter' => '|'
                                )
                            )
                        ),
                        'choiceInteraction' => array (
                            'extractor' => 'QtiExtractor',
                            'parameters' => array (
                                'callback' => 'getChoices',
                                'valuesAsColumns' => true,
                            )
                        ),
                    )
                ));
                $service->setServiceManager($this->getServiceManager());
                $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $service);

                $createExportDirectoryScript = new createExportDirectory();
                $createExportDirectoryScript([]);
            }

            $this->setVersion('2.20.0');
        }

	$this->skip('2.20.0', '2.22.0');

        if ($this->isVersion('2.22.0')) {
            $simpleExporter = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $columns = $simpleExporter->getOption('columns');
            $responseIdentifier['responseIdentifier'] = array (
                'extractor' => 'QtiExtractor',
                'parameters' => array (
                    'callback' => 'getResponseIdentifier',
                )
            );

            $offset = array_search('BR', array_keys($columns));
            $columns = array_slice($columns, 0, $offset, true) + $responseIdentifier + array_slice($columns, $offset, NULL, true);

            $simpleExporter->setOption('columns', $columns);
            $simpleExporter->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $simpleExporter);

            $this->setVersion('2.23.0');
        }

        if ($this->isVersion('2.23.0')) {
            $simpleExporter = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $columns = $simpleExporter->getOption('columns');
            $columns['BR'] = array (
                'extractor' => 'QtiExtractor',
                'parameters' => array(
                    'callback' => 'getRightAnswer',
                    'callbackParameters' => array(
                        'delimiter' => '|',
                    ),
                    'valuesAsColumns' => true
                )
            );
            $simpleExporter->setOption('columns', $columns);
            $simpleExporter->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $simpleExporter);
            $this->setVersion('2.24.0');
        }

        $this->skip('2.24.0', '2.25.0');

        if ($this->isVersion('2.25.0')) {

            QtiCreatorClientConfigRegistry::getRegistry()->registerPlugin('back', 'taoQtiItem/qtiCreator/plugins/navigation/back', 'navigation');

            $this->setVersion('2.26.0');
        }

        if ($this->isVersion('2.26.0')) {
            AclProxy::applyRule(new AccessRule('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiPreview::class));
            AclProxy::applyRule(new AccessRule('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiCreator::class));
            AclProxy::applyRule(new AccessRule('grant', 'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor', QtiCssAuthoring::class));
            $this->setVersion('2.27.0');
        }

        $this->skip('2.27.0', '2.28.4');

	    if($this->isVersion('2.28.4')){
            $setDragAndDropConfig = new SetDragAndDropConfig();
            $setDragAndDropConfig([]);
            $this->setVersion('2.29.0');
        }

        $this->skip('2.29.0', '2.30.1');

        if($this->isVersion('2.30.1')) {
            $setDragAndDropConfig = new SetDragAndDropConfig();
            $setDragAndDropConfig([]);
            $this->setVersion('2.31.0');
        }

        $this->skip('2.31.0', '5.7.0');

        if ($this->isVersion('5.7.0')) {

            $eventManager = $this->getServiceManager()->get(\oat\oatbox\event\EventManager::CONFIG_ID);
            $eventManager->attach(\oat\taoItems\model\event\ItemRdfUpdatedEvent::class,
                array(\oat\taoQtiItem\model\Listener\ItemUpdater::class, 'catchItemRdfUpdatedEvent')
            );
            $this->getServiceManager()->register(\oat\oatbox\event\EventManager::CONFIG_ID, $eventManager);

            $this->setVersion('5.7.1');
        }

        $this->skip('5.7.1', '5.7.3');

        if ($this->isVersion('5.7.3')) {
            $categoriesService = new ItemCategoriesService(array('properties' => array()));
            $categoriesService->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(ItemCategoriesService::SERVICE_ID, $categoriesService);
            $this->setVersion('5.8.0');
        }

        $this->skip('5.8.0', '6.8.1');

        if ($this->isVersion('6.8.1')) {
            $option = [
                'flipDirectedPair' => true
            ];
            $registry = \oat\tao\model\ClientLibConfigRegistry::getRegistry();
            $registry->register('taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicGapMatchInteraction', $option);

            $this->setVersion('6.8.2');
        }

        $this->skip('6.8.2', '6.18.1');

        if ($this->isVersion('6.18.1')) {
            $updater = new InitMetadataService();
            $updater->setServiceLocator($this->getServiceManager());
            $updater([]);
            $this->setVersion('6.19.0');
        }

        $this->skip('6.19.0', '8.0.2');

        if ($this->isVersion('8.0.2')) {
            OntologyUpdater::syncModels();
            $this->runExtensionScript(SetItemModel::class);
            $this->setVersion('8.1.0');
        }

        $this->skip('8.1.0', '8.2.0');

        if ($this->isVersion('8.2.0')){

            $fsId = 'portableElementStorage';

            //create a new web source of ActionWebSource (without token requirement)
            $websource = ActionWebSource::spawnWebsource($fsId);

            /** @var FileSystemService $fsm */
            $fsm = $this->getServiceManager()->get(FileSystemService::SERVICE_ID);
            if (! $fsm->hasDirectory($fsId)) {
                $fsm->createFileSystem($fsId, $fsId);
                $this->getServiceManager()->register(FileSystemService::SERVICE_ID, $fsm);
            }

            //assign the new web source to the existing PortableElementFileStorage while leaving existing filesystem intact
            try{
                $portableElementStorage = $this->getServiceManager()->get(PortableElementFileStorage::SERVICE_ID);
                $oldWebsourceId = $portableElementStorage->getOption(PortableElementFileStorage::OPTION_WEBSOURCE);
                //remove old websource
                $oldWebsource = WebsourceManager::singleton()->getWebsource($oldWebsourceId);
                WebsourceManager::singleton()->removeWebsource($oldWebsource);

            } catch (ServiceNotFoundException $e){
                $portableElementStorage = new PortableElementFileStorage();
            }
            $portableElementStorage->setOption(PortableElementFileStorage::OPTION_WEBSOURCE, $websource->getId());
            $portableElementStorage->setOption(PortableElementFileStorage::OPTION_FILESYSTEM, $fsId);
            $this->getServiceManager()->register(PortableElementFileStorage::SERVICE_ID, $portableElementStorage);


            $this->setVersion('8.3.0');
        }

        $this->skip('8.3.0', '8.8.0');

        if ($this->isVersion('8.8.0')) {
            $itemModelService = $this->getServiceManager()->get(ItemModel::SERVICE_ID);
            $exportHandlers = $itemModelService->getOption(ItemModel::EXPORT_HANDLER);
            array_unshift($exportHandlers, new ItemMetadataByClassExportHandler());
            $itemModelService->setOption(ItemModel::EXPORT_HANDLER, $exportHandlers);
            $this->getServiceManager()->register(ItemModel::SERVICE_ID, $itemModelService);

            $this->setVersion('8.9.0');
        }

        $this->skip('8.9.0', '8.15.0');

        if ($this->isVersion('8.15.0')) {
            $itemImportService = new ImportService([]);
            $itemImportService->setServiceLocator($this->getServiceManager());
            $this->getServiceManager()->register(ImportService::SERVICE_ID, $itemImportService);
            $this->setVersion('8.16.0');
        }

        $this->skip('8.16.0', '9.11.4');

        if($this->isVersion('9.11.4')){

            //register location of portable libs to legacy share lib aliases for backward compatibility
            $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
            $portableSafeLibPath = $assetService->getJsBaseWww('taoQtiItem').'js/legacyPortableSharedLib';
            $clientLibRegistry = ClientLibRegistry::getRegistry();
            $clientLibRegistry->register('IMSGlobal/jquery_2_1_1', $portableSafeLibPath . '/jquery_2_1_1');
            $clientLibRegistry->register('OAT/lodash', $portableSafeLibPath . '/lodash');
            $clientLibRegistry->register('OAT/async', $portableSafeLibPath . '/async');
            $clientLibRegistry->register('OAT/raphael', $portableSafeLibPath . '/raphael');
            $clientLibRegistry->register('OAT/scale.raphael', $portableSafeLibPath . '/OAT/scale.raphael');
            $clientLibRegistry->register('OAT/jquery.qtip', $portableSafeLibPath . '/jquery.qtip');
            $clientLibRegistry->register('OAT/util/xml', $portableSafeLibPath . '/OAT/util/xml');
            $clientLibRegistry->register('OAT/util/math', $portableSafeLibPath . '/OAT/util/math');
            $clientLibRegistry->register('OAT/util/html', $portableSafeLibPath . '/OAT/util/html');
            $clientLibRegistry->register('OAT/util/EventMgr', $portableSafeLibPath . '/OAT/util/EventMgr');
            $clientLibRegistry->register('OAT/util/event', $portableSafeLibPath . '/OAT/util/event');
            $clientLibRegistry->register('OAT/util/asset', $portableSafeLibPath . '/OAT/util/asset');
            $clientLibRegistry->register('OAT/util/tpl', $portableSafeLibPath . '/OAT/util/tpl');
            $clientLibRegistry->register('OAT/sts/common', $portableSafeLibPath . '/OAT/sts/common');
            $clientLibRegistry->register('OAT/interact', $portableSafeLibPath . '/interact');
            $clientLibRegistry->register('OAT/interact-rotate', $portableSafeLibPath . '/OAT/interact-rotate');
            $clientLibRegistry->register('OAT/sts/transform-helper', $portableSafeLibPath . '/OAT/sts/transform-helper');
            $clientLibRegistry->register('OAT/handlebars', $portableSafeLibPath . '/handlebars');
            $clientLibRegistry->register('OAT/sts/stsEventManager', $portableSafeLibPath . '/OAT/sts/stsEventManager');
            $clientLibRegistry->register('OAT/waitForMedia', $portableSafeLibPath . '/OAT/waitForMedia');
            $clientLibRegistry->register('OAT/customEvent', $portableSafeLibPath . '/OAT/customEvent');
            $clientLibRegistry->register('OAT/mediaPlayer', $portableSafeLibPath . '/OAT/mediaPlayer');

            $this->setVersion('10.0.0');
        }

        $this->skip('10.0.0', '10.6.0');

        if($this->isVersion('10.6.0')){

            $service = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $options = $service->getOptions();
            $options['extractors']['MetaDataOntologyExtractor'] = new MetaDataOntologyExtractor();
            $options['columns']['metadataProperties'] = [
                'extractor' => 'MetaDataOntologyExtractor',
                'parameters' => array(
                    'valuesAsColumns' => true,
                    'excludedProperties' => array(
                        taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT,
                        taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL,
                        taoItems_actions_form_RestItemForm::PROPERTY_ITEM_CONTENT_SRC,
                        TaoOntology::PROPERTY_LOCK,
                    ),
                )
            ];

            $service->setOptions($options);

            $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $service);

            $this->setVersion('10.7.0');
        }

        $this->skip('10.7.0', '10.9.3');

    }
}
