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
 *
 */

namespace oat\taoQtiItem\controller;

use common_exception_Error;
use core_kernel_classes_Resource;
use oat\generis\model\data\event\ResourceUpdated;
use oat\oatbox\event\EventManager;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\tao\model\TaoOntology;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\model\CreatorConfig;
use oat\taoQtiItem\model\event\ItemCreatorLoad;
use oat\taoQtiItem\model\HookRegistry;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Resource;
use oat\taoQtiItem\model\qti\Service;
use tao_actions_CommonModule;
use tao_helpers_File;
use tao_helpers_Uri;
use taoItems_models_classes_ItemsService;
use oat\taoQtiItem\model\ItemModel;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\tao\model\media\MediaService;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use common_exception_BadRequest;

/**
 * QtiCreator Controller provide actions to edit a QTI item
 *
 * @author CRP Henri Tudor - TAO Team - {@link http://www.tao.lu}
 * @package taoQTI
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class QtiCreator extends tao_actions_CommonModule
{
    use EventManagerAwareTrait;
    /**
     * create a new QTI item
     *
     * @throws common_exception_BadRequest
     * @throws common_exception_Error
     *
     * @requiresRight id WRITE
     */
    public function createItem()
    {
        if(!\tao_helpers_Request::isAjax()){
            throw new common_exception_BadRequest('wrong request mode');
        }
        $clazz = new \core_kernel_classes_Resource($this->getRequestParameter('id'));
        if ($clazz->isClass()) {
            $clazz = new \core_kernel_classes_Class($clazz);
        } else {
            foreach ($clazz->getTypes() as $type) {
                // determine class from selected instance
                $clazz = $type;
                break;
            }
        }
        $service = \taoItems_models_classes_ItemsService::singleton();

        $label = $service->createUniqueLabel($clazz);
        $item = $service->createInstance($clazz, $label);

        if(!is_null($item)){
            $service->setItemModel($item, new \core_kernel_classes_Resource(ItemModel::MODEL_URI));
            $this->getEventManager()->trigger(new ItemCreatedEvent($item->getUri()));
            $response = array(
                'label'	=> $item->getLabel(),
                'uri' 	=> $item->getUri()
            );
        } else {
            $response = false;
        }
        $this->returnJson($response);
    }

    public function index()
    {

        if (!$this->hasRequestParameter('instance')) {
            throw new common_exception_Error('The item creator needs to be opened with an item');
        }
        $item = new core_kernel_classes_Resource(tao_helpers_Uri::decode($this->getRequestParameter('instance')));

        $config = $this->getCreatorConfig($item);

        $this->setData('config', $config->toArray());
        $this->setView('QtiCreator/index.tpl');

        $this->getEventManager()->trigger(new ItemCreatorLoad());
    }

    public function getMediaSources()
    {
        $exclude = '';
        if($this->hasRequestParameter('exclude')){
            $exclude = $this->getRequestParameter('exclude');
        }
        // get the config media Sources
        $sources = array_keys(MediaService::singleton()->getBrowsableSources());
        $mediaSources = array();
        if($exclude !== 'local'){
            $mediaSources[] = array('root' => 'local', 'path' => '/');
        }
        foreach($sources as $source){
            if($source !== $exclude){
                $mediaSources[] = array('root' => $source, 'path' => 'taomedia://'.$source.'/');
            }
        }

        $this->returnJson($mediaSources);
    }

    public function getItemData()
    {

        $returnValue = array(
            'itemData' => null
        );

        if ($this->hasRequestParameter('uri')) {
            $lang = taoItems_models_classes_ItemsService::singleton()->getSessionLg();
            $itemUri = tao_helpers_Uri::decode($this->getRequestParameter('uri'));
            $itemResource = new core_kernel_classes_Resource($itemUri);

            $item = Service::singleton()->getDataItemByRdfItem($itemResource, $lang, false);//do not resolve xinclude here, leave it to the client side
            if (!is_null($item)) {
                $returnValue['itemData'] = $item->toArray();
            }

            $availableLangs = \tao_helpers_I18n::getAvailableLangsByUsage(new core_kernel_classes_Resource(TaoOntology::PROPERTY_STANCE_LANGUAGE_USAGE_DATA));
            $returnValue['languagesList'] = $availableLangs;
        }

        $this->returnJson($returnValue);
    }

    public function saveItem()
    {

        $returnValue = array('success' => false);

        if ($this->hasRequestParameter('uri')) {

            $uri = urldecode($this->getRequestParameter('uri'));
            $xml = file_get_contents('php://input');
            $rdfItem = new core_kernel_classes_Resource($uri);
            /** @var Service $itemService */
            $itemService = Service::singleton();

            //check if the item is QTI item
            if($itemService->hasItemModel($rdfItem, array(ItemModel::MODEL_URI))){
                try {
                    Authoring::checkEmptyMedia($xml);
                    $returnValue['success'] = $itemService->saveXmlItemToRdfItem($xml, $rdfItem);
                    $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
                    $eventManager->trigger(new ResourceUpdated($rdfItem));
                } catch (QtiModelException $e) {
                    $returnValue = array(
                        'success' => false,
                        'type' => 'Error',
                        'message' => $e->getUserMessage()
                    );
                }
            }
        }

        $this->returnJson($returnValue);
    }

    public function getFile()
    {

        if ($this->hasRequestParameter('uri')
            && $this->hasRequestParameter('lang')
            && $this->hasRequestParameter('relPath')
        ) {
            $uri = urldecode($this->getRequestParameter('uri'));
            $rdfItem = new core_kernel_classes_Resource($uri);

            $lang = urldecode($this->getRequestParameter('lang'));

            $rawParams = $this->getRequest()->getRawParameters();
            $relPath   = ltrim(rawurldecode($rawParams['relPath']), '/');

            $this->renderFile($rdfItem, $relPath, $lang);
        }
    }

    private function renderFile($item, $path, $lang)
    {

        if (tao_helpers_File::securityCheck($path, true)) {
            $resolver = new ItemMediaResolver($item, $lang);
            $asset = $resolver->resolve($path);
            $filePath = $asset->getMediaSource()->download($asset->getMediaIdentifier());
            \tao_helpers_Http::returnFile($filePath);
        } else {
            throw new common_exception_Error('invalid item preview file path');
        }
    }

    /**
     * Get the configuration of the Item Creator
     * @param core_kernel_classes_Resource $item the selected item
     * @return CreatorConfig the configration
     */
    protected function getCreatorConfig(core_kernel_classes_Resource $item){

        $config = new CreatorConfig();

        $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
        $creatorConfig = $ext->getConfig('qtiCreator');

        if (is_array($creatorConfig)) {
            foreach ($creatorConfig as $prop => $value) {
                $config->setProperty($prop, $value);
            }
        }

        $config->setProperty('uri', $item->getUri());
        $config->setProperty('label', $item->getLabel());

        //set the current data lang in the item content to keep the integrity
        //@todo : allow preview in a language other than the one in the session
        $lang = \common_session_SessionManager::getSession()->getDataLanguage();
        $config->setProperty('lang', $lang);

        //base url:
        $url = tao_helpers_Uri::url('getFile', 'QtiCreator', 'taoQtiItem', array(
            'uri' => $item->getUri(),
            'lang' => $lang,
            'relPath' => ''
        ));
        $config->setProperty('baseUrl', $url);

        //map the multi column config to the plugin
        //TODO migrate the config
        if($config->getProperty('multi-column') == true){
            $config->addPlugin('blockAdder', 'taoQtiItem/qtiCreator/plugins/content/blockAdder', 'content');
        }

        $mediaSourcesUrl = tao_helpers_Uri::url(
            'getMediaSources',
            'QtiCreator',
            'taoQtiItem'
        );

        $config->setProperty('mediaSourcesUrl', $mediaSourcesUrl);

        //initialize all registered hooks:
        $hookClasses = HookRegistry::getRegistry()->getMap();
        foreach ($hookClasses as $hookClass) {
            $hook = new $hookClass();
            $hook->init($config);
        }

        $config->init();

        return $config;
    }
}
