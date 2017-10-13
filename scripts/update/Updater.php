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

        $this->skip('10.0.0', '10.5.2');

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

        $this->skip('10.7.0', '10.8.0');

        if ($this->isVersion('10.8.0')) {
            $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
            $ext->setConfig('requirejsbundles', array(
                array(
                    'name' => 'taoqtiitem_bundle',
                    'path' => ROOT_URL . 'taoQtiItem/views/dist/controllers.min',
                    'modules' => array(
                        'taoQtiItem/controller/creator/index',
                        'taoQtiItem/controller/routes',
                        'taoQtiItem/qtiCreator/editor/areaBroker',
                        'taoQtiItem/qtiCreator/editor/blockAdder/blockAdder',
                        'taoQtiItem/qtiCreator/editor/ckEditor/ckProtector',
                        'taoQtiItem/qtiCreator/editor/ckEditor/groupToggler',
                        'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
                        'taoQtiItem/qtiCreator/editor/colorPicker/colorPicker',
                        'taoQtiItem/qtiCreator/editor/containerEditor',
                        'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
                        'taoQtiItem/qtiCreator/editor/elementSelector/selector',
                        'taoQtiItem/qtiCreator/editor/gridEditor/arrow',
                        'taoQtiItem/qtiCreator/editor/gridEditor/config',
                        'taoQtiItem/qtiCreator/editor/gridEditor/content',
                        'taoQtiItem/qtiCreator/editor/gridEditor/draggable',
                        'taoQtiItem/qtiCreator/editor/gridEditor/droppable',
                        'taoQtiItem/qtiCreator/editor/gridEditor/helper',
                        'taoQtiItem/qtiCreator/editor/gridEditor/resizable',
                        'taoQtiItem/qtiCreator/editor/infoControlRegistry',
                        'taoQtiItem/qtiCreator/editor/interactionsPanel',
                        'taoQtiItem/qtiCreator/editor/interactionsToolbar',
                        'taoQtiItem/qtiCreator/editor/jquery.gridEditor',
                        'taoQtiItem/qtiCreator/editor/MathEditor',
                        'taoQtiItem/qtiCreator/editor/mathInput/mathInput',
                        'taoQtiItem/qtiCreator/editor/propertiesPanel',
                        'taoQtiItem/qtiCreator/editor/response/choiceSelector',
                        'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
                        'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
                        'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
                        'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
                        'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
                        'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
                        'taoQtiItem/qtiCreator/editor/styleEditor/styleSheetToggler',
                        'taoQtiItem/qtiCreator/editor/targetFinder',
                        'taoQtiItem/qtiCreator/editor/widgetToolbar',
                        'taoQtiItem/qtiCreator/helper/ckConfigurator',
                        'taoQtiItem/qtiCreator/helper/commonRenderer',
                        'taoQtiItem/qtiCreator/helper/creatorRenderer',
                        'taoQtiItem/qtiCreator/helper/devTools',
                        'taoQtiItem/qtiCreator/helper/dummyElement',
                        'taoQtiItem/qtiCreator/helper/gridUnits',
                        'taoQtiItem/qtiCreator/helper/itemLoader',
                        'taoQtiItem/qtiCreator/helper/panel',
                        'taoQtiItem/qtiCreator/helper/popup',
                        'taoQtiItem/qtiCreator/helper/qtiElements',
                        'taoQtiItem/qtiCreator/helper/windowPopup',
                        'taoQtiItem/qtiCreator/helper/xincludeRenderer',
                        'taoQtiItem/qtiCreator/helper/xmlRenderer',
                        'taoQtiItem/qtiCreator/itemCreator',
                        'taoQtiItem/qtiCreator/model/choices/AssociableHotspot',
                        'taoQtiItem/qtiCreator/model/choices/Gap',
                        'taoQtiItem/qtiCreator/model/choices/GapImg',
                        'taoQtiItem/qtiCreator/model/choices/GapText',
                        'taoQtiItem/qtiCreator/model/choices/HotspotChoice',
                        'taoQtiItem/qtiCreator/model/choices/Hottext',
                        'taoQtiItem/qtiCreator/model/choices/InlineChoice',
                        'taoQtiItem/qtiCreator/model/choices/SimpleAssociableChoice',
                        'taoQtiItem/qtiCreator/model/choices/SimpleChoice',
                        'taoQtiItem/qtiCreator/model/Container',
                        'taoQtiItem/qtiCreator/model/feedbacks/ModalFeedback',
                        'taoQtiItem/qtiCreator/model/helper/container',
                        'taoQtiItem/qtiCreator/model/helper/event',
                        'taoQtiItem/qtiCreator/model/helper/invalidator',
                        'taoQtiItem/qtiCreator/model/helper/portableElement',
                        'taoQtiItem/qtiCreator/model/helper/response',
                        'taoQtiItem/qtiCreator/model/Img',
                        'taoQtiItem/qtiCreator/model/Include',
                        'taoQtiItem/qtiCreator/model/interactions/AssociateInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/ChoiceInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/EndAttemptInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/ExtendedTextInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/GapMatchInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/GraphicAssociateInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/GraphicGapMatchInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/GraphicOrderInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/HotspotInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/HottextInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/InlineChoiceInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/MatchInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/MediaInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/OrderInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/PortableCustomInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/SelectPointInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/SliderInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/TextEntryInteraction',
                        'taoQtiItem/qtiCreator/model/interactions/UploadInteraction',
                        'taoQtiItem/qtiCreator/model/Item',
                        'taoQtiItem/qtiCreator/model/Math',
                        'taoQtiItem/qtiCreator/model/mixin/editable',
                        'taoQtiItem/qtiCreator/model/mixin/editableContainer',
                        'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
                        'taoQtiItem/qtiCreator/model/Object',
                        'taoQtiItem/qtiCreator/model/pciCreatorContext',
                        'taoQtiItem/qtiCreator/model/PortableInfoControl',
                        'taoQtiItem/qtiCreator/model/qtiClasses',
                        'taoQtiItem/qtiCreator/model/ResponseProcessing',
                        'taoQtiItem/qtiCreator/model/RubricBlock',
                        'taoQtiItem/qtiCreator/model/Stylesheet',
                        'taoQtiItem/qtiCreator/model/Table',
                        'taoQtiItem/qtiCreator/model/variables/OutcomeDeclaration',
                        'taoQtiItem/qtiCreator/model/variables/ResponseDeclaration',
                        'taoQtiItem/qtiCreator/plugins/content/blockAdder',
                        'taoQtiItem/qtiCreator/plugins/content/changeTracker',
                        'taoQtiItem/qtiCreator/plugins/content/title',
                        'taoQtiItem/qtiCreator/plugins/loader',
                        'taoQtiItem/qtiCreator/plugins/menu/preview',
                        'taoQtiItem/qtiCreator/plugins/menu/print',
                        'taoQtiItem/qtiCreator/plugins/menu/save',
                        'taoQtiItem/qtiCreator/plugins/navigation/back',
                        'taoQtiItem/qtiCreator/plugins/panel/outcomeEditor',
                        'taoQtiItem/qtiCreator/renderers/choices/Gap',
                        'taoQtiItem/qtiCreator/renderers/choices/GapText',
                        'taoQtiItem/qtiCreator/renderers/choices/Hottext',
                        'taoQtiItem/qtiCreator/renderers/choices/InlineChoice',
                        'taoQtiItem/qtiCreator/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
                        'taoQtiItem/qtiCreator/renderers/choices/SimpleAssociableChoice.MatchInteraction',
                        'taoQtiItem/qtiCreator/renderers/choices/SimpleChoice.ChoiceInteraction',
                        'taoQtiItem/qtiCreator/renderers/choices/SimpleChoice.OrderInteraction',
                        'taoQtiItem/qtiCreator/renderers/config',
                        'taoQtiItem/qtiCreator/renderers/Container',
                        'taoQtiItem/qtiCreator/renderers/Img',
                        'taoQtiItem/qtiCreator/renderers/Include',
                        'taoQtiItem/qtiCreator/renderers/interactions/AssociateInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/ChoiceInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/EndAttemptInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/ExtendedTextInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/GapMatchInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/GraphicAssociateInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/GraphicGapMatchInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/GraphicOrderInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/HotspotInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/HottextInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/InlineChoiceInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/MatchInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/MediaInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/OrderInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/PortableCustomInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/SelectPointInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/SliderInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/TextEntryInteraction',
                        'taoQtiItem/qtiCreator/renderers/interactions/UploadInteraction',
                        'taoQtiItem/qtiCreator/renderers/Item',
                        'taoQtiItem/qtiCreator/renderers/Math',
                        'taoQtiItem/qtiCreator/renderers/ModalFeedback',
                        'taoQtiItem/qtiCreator/renderers/Object',
                        'taoQtiItem/qtiCreator/renderers/PortableInfoControl',
                        'taoQtiItem/qtiCreator/renderers/Renderer',
                        'taoQtiItem/qtiCreator/renderers/RubricBlock',
                        'taoQtiItem/qtiCreator/renderers/Table',
                        'taoQtiItem/qtiCreator/widgets/choices/gap/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/choices/gap/states/Question',
                        'taoQtiItem/qtiCreator/widgets/choices/gap/states/states',
                        'taoQtiItem/qtiCreator/widgets/choices/gap/Widget',
                        'taoQtiItem/qtiCreator/widgets/choices/gapText/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/choices/gapText/states/Question',
                        'taoQtiItem/qtiCreator/widgets/choices/gapText/states/states',
                        'taoQtiItem/qtiCreator/widgets/choices/gapText/Widget',
                        'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement',
                        'taoQtiItem/qtiCreator/widgets/choices/hottext/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/choices/hottext/states/Question',
                        'taoQtiItem/qtiCreator/widgets/choices/hottext/states/states',
                        'taoQtiItem/qtiCreator/widgets/choices/hottext/Widget',
                        'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/states/Question',
                        'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/states/states',
                        'taoQtiItem/qtiCreator/widgets/choices/inlineChoice/Widget',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/Question',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/states',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/Widget',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/states/Question',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/states/states',
                        'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/Widget',
                        'taoQtiItem/qtiCreator/widgets/choices/states/Active',
                        'taoQtiItem/qtiCreator/widgets/choices/states/Answer',
                        'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/choices/states/Question',
                        'taoQtiItem/qtiCreator/widgets/choices/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/choices/states/states',
                        'taoQtiItem/qtiCreator/widgets/choices/Widget',
                        'taoQtiItem/qtiCreator/widgets/helpers/content',
                        'taoQtiItem/qtiCreator/widgets/helpers/deletingState',
                        'taoQtiItem/qtiCreator/widgets/helpers/formElement',
                        'taoQtiItem/qtiCreator/widgets/helpers/identifier',
                        'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackConditions',
                        'taoQtiItem/qtiCreator/widgets/helpers/modalFeedbackRule',
                        'taoQtiItem/qtiCreator/widgets/helpers/movable',
                        'taoQtiItem/qtiCreator/widgets/helpers/pciMediaManager/pciMediaManager',
                        'taoQtiItem/qtiCreator/widgets/helpers/placeholder',
                        'taoQtiItem/qtiCreator/widgets/helpers/selectionWrapper',
                        'taoQtiItem/qtiCreator/widgets/helpers/textWrapper',
                        'taoQtiItem/qtiCreator/widgets/helpers/validators',
                        'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/ResponseWidget',
                        'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/ResponseWidget',
                        'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/endAttemptInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/endAttemptInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/endAttemptInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/states/NoRp',
                        'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/extendedTextInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/gapMatchInteraction/states/Answer',
                        'taoQtiItem/qtiCreator/widgets/interactions/gapMatchInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/gapMatchInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/gapMatchInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/gapMatchInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/gapMatchInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicOrderInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicOrderInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicOrderInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicOrderInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/graphicOrderInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/bgImage',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicInteractionShapeEditor',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicScorePopup',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/imageSelector',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/pairScoringForm',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/pathBuilder',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/resourceManager',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeEditor',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeFactory',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeHandlers',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeMover',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeResizer',
                        'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeSideBar',
                        'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/ResponseWidget',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/NoRp',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/states/Active',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/ResponseWidget',
                        'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/Answer',
                        'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/orderInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/orderInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/orderInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/orderInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Answer',
                        'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Active',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Custom',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/NoRp',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/interactions/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/Map',
                        'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/uploadInteraction/states/Question',
                        'taoQtiItem/qtiCreator/widgets/interactions/uploadInteraction/states/states',
                        'taoQtiItem/qtiCreator/widgets/interactions/uploadInteraction/Widget',
                        'taoQtiItem/qtiCreator/widgets/interactions/Widget',
                        'taoQtiItem/qtiCreator/widgets/item/states/Active',
                        'taoQtiItem/qtiCreator/widgets/item/states/states',
                        'taoQtiItem/qtiCreator/widgets/item/Widget',
                        'taoQtiItem/qtiCreator/widgets/states/Active',
                        'taoQtiItem/qtiCreator/widgets/states/Answer',
                        'taoQtiItem/qtiCreator/widgets/states/Choice',
                        'taoQtiItem/qtiCreator/widgets/states/Correct',
                        'taoQtiItem/qtiCreator/widgets/states/Custom',
                        'taoQtiItem/qtiCreator/widgets/states/Deleting',
                        'taoQtiItem/qtiCreator/widgets/states/factory',
                        'taoQtiItem/qtiCreator/widgets/states/Inactive',
                        'taoQtiItem/qtiCreator/widgets/states/Invalid',
                        'taoQtiItem/qtiCreator/widgets/states/Map',
                        'taoQtiItem/qtiCreator/widgets/states/NoRp',
                        'taoQtiItem/qtiCreator/widgets/states/Question',
                        'taoQtiItem/qtiCreator/widgets/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
                        'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
                        'taoQtiItem/qtiCreator/widgets/static/img/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/img/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/img/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/img/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/include/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/include/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/include/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/math/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/math/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/math/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/math/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/modalFeedback/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/modalFeedback/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/modalFeedback/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/modalFeedback/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/object/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/object/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/object/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/object/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/portableInfoControl/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/portableInfoControl/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/rubricBlock/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/rubricBlock/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/rubricBlock/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/rubricBlock/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/table/components/tableActions',
                        'taoQtiItem/qtiCreator/widgets/static/table/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/table/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/table/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/table/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/text/states/Active',
                        'taoQtiItem/qtiCreator/widgets/static/text/states/Sleep',
                        'taoQtiItem/qtiCreator/widgets/static/text/states/states',
                        'taoQtiItem/qtiCreator/widgets/static/text/Widget',
                        'taoQtiItem/qtiCreator/widgets/static/Widget',
                        'taoQtiItem/qtiCreator/widgets/Widget',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/AssociableHotspot',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/Gap',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/GapImg',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/GapText',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/HotspotChoice',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/Hottext',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/InlineChoice',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/SimpleAssociableChoice',
                        'taoQtiItem/qtiXmlRenderer/renderers/choices/SimpleChoice',
                        'taoQtiItem/qtiXmlRenderer/renderers/config',
                        'taoQtiItem/qtiXmlRenderer/renderers/Container',
                        'taoQtiItem/qtiXmlRenderer/renderers/feedbacks/ModalFeedback',
                        'taoQtiItem/qtiXmlRenderer/renderers/Img',
                        'taoQtiItem/qtiXmlRenderer/renderers/Include',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/AssociateInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/ChoiceInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/EndAttemptInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/ExtendedTextInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/GapMatchInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/GraphicAssociateInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/GraphicGapMatchInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/GraphicOrderInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/HotspotInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/HottextInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/InlineChoiceInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/MatchInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/MediaInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/OrderInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/PortableCustomInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/Prompt',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/SelectPointInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/SliderInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/TextEntryInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/interactions/UploadInteraction',
                        'taoQtiItem/qtiXmlRenderer/renderers/Item',
                        'taoQtiItem/qtiXmlRenderer/renderers/Math',
                        'taoQtiItem/qtiXmlRenderer/renderers/Object',
                        'taoQtiItem/qtiXmlRenderer/renderers/OutcomeDeclaration',
                        'taoQtiItem/qtiXmlRenderer/renderers/PortableInfoControl',
                        'taoQtiItem/qtiXmlRenderer/renderers/Renderer',
                        'taoQtiItem/qtiXmlRenderer/renderers/ResponseDeclaration',
                        'taoQtiItem/qtiXmlRenderer/renderers/ResponseProcessing',
                        'taoQtiItem/qtiXmlRenderer/renderers/responses/SimpleFeedbackRule',
                        'taoQtiItem/qtiXmlRenderer/renderers/RubricBlock',
                        'taoQtiItem/qtiXmlRenderer/renderers/Stylesheet',
                        'taoQtiItem/qtiXmlRenderer/renderers/Table',
                    ),
                ),
                array(
                    'name' => 'taoqtiitem_runtime_bundle',
                    'path' => ROOT_URL . 'taoQtiItem/views/dist/qtiBootstrap.min',
                    'modules' => array(
                        'taoQtiItem/qtiItem/core/choices/AssociableHotspot',
                        'taoQtiItem/qtiItem/core/choices/Choice',
                        'taoQtiItem/qtiItem/core/choices/ContainerChoice',
                        'taoQtiItem/qtiItem/core/choices/Gap',
                        'taoQtiItem/qtiItem/core/choices/GapImg',
                        'taoQtiItem/qtiItem/core/choices/GapText',
                        'taoQtiItem/qtiItem/core/choices/Hotspot',
                        'taoQtiItem/qtiItem/core/choices/HotspotChoice',
                        'taoQtiItem/qtiItem/core/choices/Hottext',
                        'taoQtiItem/qtiItem/core/choices/InlineChoice',
                        'taoQtiItem/qtiItem/core/choices/SimpleAssociableChoice',
                        'taoQtiItem/qtiItem/core/choices/SimpleChoice',
                        'taoQtiItem/qtiItem/core/choices/TextEntry',
                        'taoQtiItem/qtiItem/core/choices/TextVariableChoice',
                        'taoQtiItem/qtiItem/core/Container',
                        'taoQtiItem/qtiItem/core/Element',
                        'taoQtiItem/qtiItem/core/feedbacks/Feedback',
                        'taoQtiItem/qtiItem/core/feedbacks/FeedbackBlock',
                        'taoQtiItem/qtiItem/core/feedbacks/FeedbackInline',
                        'taoQtiItem/qtiItem/core/feedbacks/ModalFeedback',
                        'taoQtiItem/qtiItem/core/IdentifiedElement',
                        'taoQtiItem/qtiItem/core/Img',
                        'taoQtiItem/qtiItem/core/Include',
                        'taoQtiItem/qtiItem/core/interactions/AssociateInteraction',
                        'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
                        'taoQtiItem/qtiItem/core/interactions/ChoiceInteraction',
                        'taoQtiItem/qtiItem/core/interactions/ContainerInteraction',
                        'taoQtiItem/qtiItem/core/interactions/CustomInteraction',
                        'taoQtiItem/qtiItem/core/interactions/EndAttemptInteraction',
                        'taoQtiItem/qtiItem/core/interactions/ExtendedTextInteraction',
                        'taoQtiItem/qtiItem/core/interactions/GapMatchInteraction',
                        'taoQtiItem/qtiItem/core/interactions/GraphicAssociateInteraction',
                        'taoQtiItem/qtiItem/core/interactions/GraphicGapMatchInteraction',
                        'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
                        'taoQtiItem/qtiItem/core/interactions/GraphicOrderInteraction',
                        'taoQtiItem/qtiItem/core/interactions/HotspotInteraction',
                        'taoQtiItem/qtiItem/core/interactions/HottextInteraction',
                        'taoQtiItem/qtiItem/core/interactions/InlineChoiceInteraction',
                        'taoQtiItem/qtiItem/core/interactions/InlineInteraction',
                        'taoQtiItem/qtiItem/core/interactions/Interaction',
                        'taoQtiItem/qtiItem/core/interactions/MatchInteraction',
                        'taoQtiItem/qtiItem/core/interactions/MediaInteraction',
                        'taoQtiItem/qtiItem/core/interactions/ObjectInteraction',
                        'taoQtiItem/qtiItem/core/interactions/OrderInteraction',
                        'taoQtiItem/qtiItem/core/interactions/Prompt',
                        'taoQtiItem/qtiItem/core/interactions/SelectPointInteraction',
                        'taoQtiItem/qtiItem/core/interactions/SliderInteraction',
                        'taoQtiItem/qtiItem/core/interactions/TextEntryInteraction',
                        'taoQtiItem/qtiItem/core/interactions/UploadInteraction',
                        'taoQtiItem/qtiItem/core/Item',
                        'taoQtiItem/qtiItem/core/Loader',
                        'taoQtiItem/qtiItem/core/Math',
                        'taoQtiItem/qtiItem/core/Object',
                        'taoQtiItem/qtiItem/core/PortableInfoControl',
                        'taoQtiItem/qtiItem/core/qtiClasses',
                        'taoQtiItem/qtiItem/core/response/SimpleFeedbackRule',
                        'taoQtiItem/qtiItem/core/ResponseProcessing',
                        'taoQtiItem/qtiItem/core/RubricBlock',
                        'taoQtiItem/qtiItem/core/Stylesheet',
                        'taoQtiItem/qtiItem/core/Table',
                        'taoQtiItem/qtiItem/core/variables/OutcomeDeclaration',
                        'taoQtiItem/qtiItem/core/variables/ResponseDeclaration',
                        'taoQtiItem/qtiItem/core/variables/VariableDeclaration',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/Gap',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/GapImg',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/GapText',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/Hottext',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/InlineChoice',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.MatchInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.ChoiceInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.OrderInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/config',
                        'taoQtiItem/qtiCommonRenderer/renderers/Container',
                        'taoQtiItem/qtiCommonRenderer/renderers/Img',
                        'taoQtiItem/qtiCommonRenderer/renderers/Include',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/AssociateInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/ChoiceInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/EndAttemptInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/GapMatchInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicAssociateInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicGapMatchInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicOrderInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/HottextInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/MatchInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/Prompt',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/SelectPointInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/SliderInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/TextEntryInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/interactions/UploadInteraction',
                        'taoQtiItem/qtiCommonRenderer/renderers/Item',
                        'taoQtiItem/qtiCommonRenderer/renderers/Math',
                        'taoQtiItem/qtiCommonRenderer/renderers/ModalFeedback',
                        'taoQtiItem/qtiCommonRenderer/renderers/Object',
                        'taoQtiItem/qtiCommonRenderer/renderers/PortableInfoControl',
                        'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
                        'taoQtiItem/qtiCommonRenderer/renderers/RubricBlock',
                        'taoQtiItem/qtiCommonRenderer/renderers/Stylesheet',
                        'taoQtiItem/qtiCommonRenderer/renderers/Table',
                        'taoQtiItem/qtiCommonRenderer/helpers/ckConfigurator',
                        'taoQtiItem/qtiCommonRenderer/helpers/container',
                        'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
                        'taoQtiItem/qtiCommonRenderer/helpers/instructions/Instruction',
                        'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
                        'taoQtiItem/qtiCommonRenderer/helpers/itemStylesheetHandler',
                        'taoQtiItem/qtiCommonRenderer/helpers/patternMask',
                        'taoQtiItem/qtiCommonRenderer/helpers/PciPrettyPrint',
                        'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
                        'taoQtiItem/qtiCommonRenderer/helpers/PortableElement',
                        'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
                        'taoQtiItem/qtiCommonRenderer/helpers/uploadMime',
                    ),
                ),
            ));

            $this->setVersion('11.0.0');
        }

    }
}
