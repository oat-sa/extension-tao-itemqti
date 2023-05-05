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
 * Copyright (c) 2014-2020 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\scripts\update;

use common_Exception;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\ServiceNotFoundException;
use oat\tao\model\TaoOntology;
use oat\tao\model\asset\AssetService;
use oat\tao\model\taskQueue\TaskLogInterface;
use oat\tao\model\user\TaoRoles;
use oat\tao\model\websource\ActionWebSource;
use oat\tao\model\websource\WebsourceManager;
use oat\tao\scripts\update\OntologyUpdater;
use oat\taoQtiItem\install\scripts\SetDragAndDropConfig;
use oat\taoQtiItem\model\compile\QtiItemCompilerAssetBlacklist;
use oat\taoQtiItem\model\Export\Extractor\MetaDataOntologyExtractor;
use oat\taoQtiItem\model\Export\ItemMetadataByClassExportHandler;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;
use oat\taoQtiItem\model\ItemCategoriesService;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\portableElement\model\PortableModelRegistry;
use oat\taoQtiItem\model\portableElement\PortableElementService;
use oat\taoQtiItem\model\portableElement\storage\PortableElementFileStorage;
use oat\tao\model\ClientLibRegistry;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\GenericLomManifestClassificationExtractor;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationExtractor;
use oat\taoQtiItem\model\qti\metadata\ontology\LomInjector as OntologyLomInjector;
use oat\taoQtiItem\model\qti\metadata\imsManifest\LomInjector as ImsManifestLomInjector;
use oat\taoQtiItem\model\tasks\ImportQtiItem;
use oat\taoQtiItem\model\QtiCreatorClientConfigRegistry;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\model\accessControl\func\AccessRule;
use oat\taoQtiItem\controller\QtiPreview;
use oat\taoQtiItem\controller\QtiCreator;
use oat\taoQtiItem\controller\QtiCssAuthoring;
use oat\taoQtiItem\scripts\install\InitMetadataService;
use oat\taoQtiItem\scripts\install\SetItemModel;
use oat\taoQtiItem\model\qti\ImportService;
use taoItems_models_classes_ItemsService;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoQtiItem\model\qti\Service;
use oat\oatbox\event\EventManager;

/**
 *
 * @author Sam <sam@taotesting.com>
 * @deprecated use migrations instead. See https://github.com/oat-sa/generis/wiki/Tao-Update-Process
 */
class Updater extends \common_ext_ExtensionUpdater
{
    /**
     *
     * @param string $initialVersion
     * @return string
     * @throws common_Exception
     */
    public function update($initialVersion)
    {

        if ($this->isBetween('0.0.0', '2.20.0')) {
            throw new \common_exception_NotImplemented(
                'Updates from versions prior to Tao 3.1 are not longer supported, please update to Tao 3.1 first'
            );
        }
        $this->skip('2.20.0', '2.22.0');

        if ($this->isVersion('2.22.0')) {
            $simpleExporter = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $columns = $simpleExporter->getOption('columns');
            $responseIdentifier['responseIdentifier'] =  [
                'extractor' => 'QtiExtractor',
                'parameters' =>  [
                    'callback' => 'getResponseIdentifier',
                ]
            ];

            $offset = array_search('BR', array_keys($columns));
            $columns = array_slice($columns, 0, $offset, true)
                + $responseIdentifier
                + array_slice($columns, $offset, null, true);

            $simpleExporter->setOption('columns', $columns);
            $simpleExporter->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $simpleExporter);

            $this->setVersion('2.23.0');
        }

        if ($this->isVersion('2.23.0')) {
            $simpleExporter = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $columns = $simpleExporter->getOption('columns');
            $columns['BR'] =  [
                'extractor' => 'QtiExtractor',
                'parameters' => [
                    'callback' => 'getRightAnswer',
                    'callbackParameters' => [
                        'delimiter' => '|',
                    ],
                    'valuesAsColumns' => true
                ]
            ];
            $simpleExporter->setOption('columns', $columns);
            $simpleExporter->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $simpleExporter);
            $this->setVersion('2.24.0');
        }

        $this->skip('2.24.0', '2.25.0');

        if ($this->isVersion('2.25.0')) {
            QtiCreatorClientConfigRegistry::getRegistry()->registerPlugin(
                'back',
                'taoQtiItem/qtiCreator/plugins/navigation/back',
                'navigation'
            );

            $this->setVersion('2.26.0');
        }

        if ($this->isVersion('2.26.0')) {
            AclProxy::applyRule(
                new AccessRule(
                    'grant',
                    'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor',
                    QtiPreview::class
                )
            );
            AclProxy::applyRule(
                new AccessRule(
                    'grant',
                    'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor',
                    QtiCreator::class
                )
            );
            AclProxy::applyRule(
                new AccessRule(
                    'grant',
                    'http://www.tao.lu/Ontologies/TAOItem.rdf#AbstractItemAuthor',
                    QtiCssAuthoring::class
                )
            );
            $this->setVersion('2.27.0');
        }

        $this->skip('2.27.0', '2.28.4');

        if ($this->isVersion('2.28.4')) {
            $setDragAndDropConfig = new SetDragAndDropConfig();
            $setDragAndDropConfig([]);
            $this->setVersion('2.29.0');
        }

        $this->skip('2.29.0', '2.30.1');

        if ($this->isVersion('2.30.1')) {
            $setDragAndDropConfig = new SetDragAndDropConfig();
            $setDragAndDropConfig([]);
            $this->setVersion('2.31.0');
        }

        $this->skip('2.31.0', '5.7.0');

        if ($this->isVersion('5.7.0')) {
            $eventManager = $this->getServiceManager()->get(\oat\oatbox\event\EventManager::CONFIG_ID);
            $eventManager->attach(
                \oat\taoItems\model\event\ItemRdfUpdatedEvent::class,
                [\oat\taoQtiItem\model\Listener\ItemUpdater::class, 'catchItemRdfUpdatedEvent']
            );
            $this->getServiceManager()->register(\oat\oatbox\event\EventManager::CONFIG_ID, $eventManager);

            $this->setVersion('5.7.1');
        }

        $this->skip('5.7.1', '5.7.3');

        if ($this->isVersion('5.7.3')) {
            $categoriesService = new ItemCategoriesService(['properties' => []]);
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
            $registry->register(
                'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicGapMatchInteraction',
                $option
            );

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

        if ($this->isVersion('8.2.0')) {
            $fsId = 'portableElementStorage';

            //create a new web source of ActionWebSource (without token requirement)
            $websource = ActionWebSource::spawnWebsource($fsId);

            /** @var FileSystemService $fsm */
            $fsm = $this->getServiceManager()->get(FileSystemService::SERVICE_ID);
            if (! $fsm->hasDirectory($fsId)) {
                $fsm->createFileSystem($fsId, $fsId);
                $this->getServiceManager()->register(FileSystemService::SERVICE_ID, $fsm);
            }

            // assign the new web source to the existing PortableElementFileStorage while leaving existing filesystem
            // intact
            try {
                $portableElementStorage = $this->getServiceManager()->get(PortableElementFileStorage::SERVICE_ID);
                $oldWebsourceId = $portableElementStorage->getOption(PortableElementFileStorage::OPTION_WEBSOURCE);
                //remove old websource
                $oldWebsource = WebsourceManager::singleton()->getWebsource($oldWebsourceId);
                WebsourceManager::singleton()->removeWebsource($oldWebsource);
            } catch (ServiceNotFoundException $e) {
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

        if ($this->isVersion('9.11.4')) {
            //register location of portable libs to legacy share lib aliases for backward compatibility
            $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
            $portableSafeLibPath = $assetService->getJsBaseWww('taoQtiItem') . 'js/legacyPortableSharedLib';
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
            $clientLibRegistry->register(
                'OAT/sts/transform-helper',
                $portableSafeLibPath . '/OAT/sts/transform-helper'
            );
            $clientLibRegistry->register('OAT/handlebars', $portableSafeLibPath . '/handlebars');
            $clientLibRegistry->register('OAT/sts/stsEventManager', $portableSafeLibPath . '/OAT/sts/stsEventManager');
            $clientLibRegistry->register('OAT/waitForMedia', $portableSafeLibPath . '/OAT/waitForMedia');
            $clientLibRegistry->register('OAT/customEvent', $portableSafeLibPath . '/OAT/customEvent');
            $clientLibRegistry->register('OAT/mediaPlayer', $portableSafeLibPath . '/OAT/mediaPlayer');

            $this->setVersion('10.0.0');
        }

        $this->skip('10.0.0', '10.6.0');

        if ($this->isVersion('10.6.0')) {
            $service = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $options = $service->getOptions();
            $options['extractors']['MetaDataOntologyExtractor'] = new MetaDataOntologyExtractor();
            $options['columns']['metadataProperties'] = [
                'extractor' => 'MetaDataOntologyExtractor',
                'parameters' => [
                    'valuesAsColumns' => true,
                    'excludedProperties' => [
                        taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT,
                        taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL,
                        // constant was moved, and to not broke updater we placed value here
                        'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemContentSourceName',
                        TaoOntology::PROPERTY_LOCK,
                    ],
                ]
            ];

            $service->setOptions($options);

            $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $service);

            $this->setVersion('10.7.0');
        }

        $this->skip('10.7.0', '11.3.0');

        if ($this->isVersion('11.3.0')) {
            $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
            $ext->setConfig('XMLParser', [
                'preserveWhiteSpace' => false,
                'formatOutput'       => true,
                'validateOnParse'    => false,
            ]);
            $this->setVersion('11.4.0');
        }

        $this->skip('11.4.0', '12.5.0');

        if ($this->isVersion('12.5.0')) {
            $assetBlacklistService = new QtiItemCompilerAssetBlacklist([
                QtiItemCompilerAssetBlacklist::BLACKLIST => [
                    '/^https?:\/\/(www\.youtube\.[a-zA-Z]*|youtu\.be)\//',
                    '/^data:[^\/]+\/[^;]+(;charset=[\w]+)?;base64,/'
                ]
            ]);

            $this->getServiceManager()->register(QtiItemCompilerAssetBlacklist::SERVICE_ID, $assetBlacklistService);
            $this->setVersion('12.6.0');
        }

        $this->skip('12.6.0', '13.0.1');

        if ($this->isVersion('13.0.1')) {
            $portableElementService = new PortableElementService();
            $portableElementService->setServiceLocator($this->getServiceManager());

            foreach (PortableModelRegistry::getRegistry()->getModels() as $model) {
                $portableElements = $model->getRegistry()->getLatest();
                foreach ($portableElements as $portableElement) {
                    $path = $model->getRegistry()->export($portableElement);
                    $portableElementService->import($model->getId(), $path);
                }
            }

            $this->setVersion('13.1.0');
        }

        $this->skip('13.1.0', '13.3.2');

        if ($this->isVersion('13.3.2')) {
            AclProxy::applyRule(
                new AccessRule(
                    'grant',
                    TaoRoles::REST_PUBLISHER,
                    ['ext' => 'taoQtiItem', 'mod' => 'RestQtiItem']
                )
            );
            $this->setVersion('13.4.0');
        }

        $this->skip('13.4.0', '15.2.2');

        if ($this->isVersion('15.2.2')) {
            /** @var TaskLogInterface|ConfigurableService $taskLogService */
            $taskLogService = $this->getServiceManager()->get(TaskLogInterface::SERVICE_ID);

            $taskLogService->linkTaskToCategory(ImportQtiItem::class, TaskLogInterface::CATEGORY_IMPORT);

            $this->getServiceManager()->register(TaskLogInterface::SERVICE_ID, $taskLogService);

            $this->setVersion('15.3.0');
        }

        $this->skip('15.3.0', '15.6.1');

        if ($this->isVersion('15.6.1')) {
            $service = $this->getServiceManager()->get(SimpleExporter::SERVICE_ID);
            $options = $service->getOptions();

            // remove 'fileSystem' key
            unset($options['fileSystem']);

            $service->setOptions($options);
            $this->getServiceManager()->register(SimpleExporter::SERVICE_ID, $service);

            $this->setVersion('16.0.0');
        }

        $this->skip('16.0.0', '19.4.0');

        if ($this->isVersion('19.4.0')) {
            /** @var MetadataService $metadataService */
            $metadataService = $this->getServiceManager()->get(MetadataService::SERVICE_ID);

            $metadataImporter = $metadataService->getImporter();
            $metadataImporter->register(MetadataImporter::INJECTOR_KEY, OntologyLomInjector::class);
            $metadataImporter->register(
                MetadataImporter::EXTRACTOR_KEY,
                GenericLomManifestClassificationExtractor::class
            );

            $metadataExporter = $metadataService->getExporter();
            $metadataExporter->register(MetadataExporter::INJECTOR_KEY, ImsManifestLomInjector::class);
            $metadataExporter->register(
                MetadataExporter::EXTRACTOR_KEY,
                GenericLomOntologyClassificationExtractor::class
            );

            $this->setVersion('19.5.0');
        }

        $this->skip('19.5.0', '19.9.2');

        if ($this->isVersion('19.9.2')) {
            $importService = $this->getServiceManager()->get(ImportService::SERVICE_ID);
            $importService->setOption(ImportService::CONFIG_VALIDATE_RESPONSE_PROCESSING, false);
            $this->getServiceManager()->register(ImportService::SERVICE_ID, $importService);
            $this->setVersion('19.10.0');
        }

        $this->skip('19.10.0', '20.4.5');

        if ($this->isVersion('20.4.5')) {
            $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
            $taoQtiItemNpmDist = $assetService->getJsBaseWww('taoQtiItem')
                . 'node_modules/@oat-sa/tao-item-runner-qti/dist/';
            $clientLibRegistry = ClientLibRegistry::getRegistry();
            $clientLibRegistry->register('taoQtiItem/qtiCommonRenderer', $taoQtiItemNpmDist . 'qtiCommonRenderer');
            $clientLibRegistry->register('taoQtiItem/qtiItem', $taoQtiItemNpmDist . 'qtiItem');
            $clientLibRegistry->register('taoQtiItem/qtiRunner', $taoQtiItemNpmDist . 'qtiRunner');
            $clientLibRegistry->register('taoQtiItem/runner', $taoQtiItemNpmDist . 'runner');
            $clientLibRegistry->register('taoQtiItem/scoring', $taoQtiItemNpmDist . 'scoring');
            $this->setVersion('21.0.0');
        }

        $this->skip('21.0.0', '23.9.7');

        if ($this->isVersion('23.9.7')) {
            $importService = $this->getServiceManager()->get(ImportService::SERVICE_ID);
            $importService->setOption(ImportService::OPTION_IMPORT_LOCK_TTL, 60);
            $this->getServiceManager()->register(ImportService::SERVICE_ID, $importService);
            $this->setVersion('23.10.0');
        }

        $this->skip('23.10.0', '23.10.1');

        if ($this->isVersion('23.10.1')) {
            $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
            $eventManager->attach(
                ItemCreatedEvent::class,
                [Service::class, 'catchItemCreatedEvent']
            );
            $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);

            $this->setVersion('23.11.0');
        }

        $this->skip('23.11.0', '23.11.6');

        if ($this->isVersion('23.11.6')) {
            $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
            $taoQtiItemNpmDist = $assetService->getJsBaseWww('taoQtiItem')
                . 'node_modules/@oat-sa/tao-item-runner-qti/dist/';
            $clientLibRegistry = ClientLibRegistry::getRegistry();
            $clientLibRegistry->register('taoQtiItem/reviewRenderer', $taoQtiItemNpmDist . 'reviewRenderer');
            $this->setVersion('23.12.0');
        }

        $this->skip('23.12.0', '25.1.0');

        //Updater files are deprecated. Please use migrations.
        //See: https://github.com/oat-sa/generis/wiki/Tao-Update-Process

        $this->setVersion($this->getExtension()->getManifest()->getVersion());
    }
}
