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
 * Copyright (c) 2013-2019 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\controller;

use common_exception_BadRequest;
use common_exception_Error;
use core_kernel_classes_Resource;
use core_kernel_classes_Class;
use oat\generis\model\data\event\ResourceUpdated;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\event\EventManager;
use oat\tao\model\http\HttpJsonResponseTrait;
use oat\tao\model\media\MediaService;
use oat\tao\model\TaoOntology;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\model\CreatorConfig;
use oat\taoQtiItem\model\event\ItemCreatorLoad;
use oat\taoQtiItem\model\HookRegistry;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\qti\event\UpdatedItemEventDispatcher;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\parser\XmlToItemParser;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\qti\validator\ItemIdentifierValidator;
use oat\generis\model\GenerisRdf;
use oat\taoQtiItem\model\import\Repository\CsvTemplateRepository;
use tao_actions_CommonModule;
use tao_helpers_File;
use tao_helpers_Http;
use tao_helpers_Uri;
use taoItems_models_classes_ItemsService;
use tao_helpers_form_elements_Htmlarea as HtmlArea;
use tao_helpers_form_elements_Textarea as TextArea;
use tao_helpers_form_elements_Textbox as TextBox;
use common_exception_MissingParameter;

/**
 * QtiCreator Controller provide actions to edit a QTI item
 *
 * @author CRP Henri Tudor - TAO Team - {@link http://www.tao.lu}
 * @package taoQTI
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class QtiCreator extends tao_actions_CommonModule
{
    use OntologyAwareTrait;
    use HttpJsonResponseTrait;

    private const TEXT_WIDGETS = [
        TextBox::WIDGET_ID,
        TextArea::WIDGET_ID,
        HtmlArea::WIDGET_ID,
    ];
    /**
     * @return EventManager
     */
    protected function getEventManager()
    {
        return $this->getServiceLocator()->get(EventManager::SERVICE_ID);
    }

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
        if (!\tao_helpers_Request::isAjax()) {
            throw new common_exception_BadRequest('wrong request mode');
        }
        try {
            $this->validateCsrf();
        } catch (\common_exception_Unauthorized $e) {
            $this->response = $this->getPsrResponse()->withStatus(403, __('Unable to process your request'));
            return;
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

        if ($item !== null) {
            $service->setItemModel($item, new \core_kernel_classes_Resource(ItemModel::MODEL_URI));
            $this->getEventManager()->trigger(new ItemCreatedEvent($item->getUri()));
            $response = [
                'success' => true,
                'message' => __('Successfully created item "%s"', $item->getLabel()),
                'label'   => $item->getLabel(),
                'uri'     => $item->getUri()
            ];
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
        if ($this->hasRequestParameter('exclude')) {
            $exclude = $this->getRequestParameter('exclude');
        }
        // get the config media Sources
        $sources = array_keys(MediaService::singleton()->getBrowsableSources());
        $mediaSources = [];
        if ($exclude !== 'local') {
            $mediaSources[] = ['root' => 'local', 'path' => '/'];
        }
        foreach ($sources as $source) {
            if ($source !== $exclude) {
                $mediaSources[] = ['root' => $source, 'path' => 'taomedia://' . $source . '/'];
            }
        }

        $this->returnJson($mediaSources);
    }

    public function getItemData()
    {

        $returnValue = [
            'itemData' => null
        ];

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
        $returnValue = ['success' => false];
        $request = $this->getPsrRequest();
        $queryParams = $request->getQueryParams();
        if (isset($queryParams['uri'])) {
            $xml = $request->getBody()->getContents();
            $rdfItem = $this->getResource(urldecode($queryParams['uri']));
            /** @var Service $itemService */
            $itemService = $this->getServiceLocator()->get(Service::class);

            if ($itemService->hasItemModel($rdfItem, [ItemModel::MODEL_URI])) {
                try {
                    $this->validateXmlInput($xml);
                    Authoring::checkEmptyMedia($xml);

                    $item = $this->getXmlToItemParser()->parseAndSanitize($xml);
                    $this->getItemIdentifierValidator()->validate($item);

                    $returnValue['success'] = $itemService->saveDataItemToRdfItem($item, $rdfItem);

                    $this->getEventManager()->trigger(new ResourceUpdated($rdfItem));
                    $this->getUpdatedItemEventDispatcher()->dispatch($item, $rdfItem);
                } catch (QtiModelException $e) {
                    $this->logError($e->getMessage());
                    $returnValue = [
                        'success' => false,
                        'type' => 'Error',
                        'message' => $e->getUserMessage()
                    ];
                } catch (common_exception_Error $e) {
                    $this->logError(sprintf('Item XML is not valid: %s', $e->getMessage()));
                    $returnValue = [
                        'success' => false,
                        'type' => 'Error',
                        'message' => 'Item XML is not valid'
                    ];
                }
            }
        }

        $this->returnJson($returnValue);
    }

    public function getFile()
    {

        if (
            $this->hasRequestParameter('uri')
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
            $mediaSource = $asset->getMediaSource();
            $stream = $mediaSource->getFileStream($asset->getMediaIdentifier());
            $info = $mediaSource->getFileInfo($asset->getMediaIdentifier());
            tao_helpers_Http::returnStream($stream, $info['mime']);
        } else {
            throw new common_exception_Error('invalid item preview file path');
        }
    }

    /**
     * Get the configuration of the Item Creator
     * @param core_kernel_classes_Resource $item the selected item
     * @return CreatorConfig the configration
     */
    protected function getCreatorConfig(core_kernel_classes_Resource $item)
    {

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
        $url = tao_helpers_Uri::url('getFile', 'QtiCreator', 'taoQtiItem', [
            'uri' => $item->getUri(),
            'lang' => $lang,
            'relPath' => ''
        ]);
        $config->setProperty('baseUrl', $url);

        //map the multi column config to the plugin
        //TODO migrate the config
        if ($config->getProperty('multi-column') == true) {
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

    private function getUpdatedItemEventDispatcher(): UpdatedItemEventDispatcher
    {
        return $this->getServiceLocator()->get(UpdatedItemEventDispatcher::class);
    }

    private function getXmlToItemParser(): XmlToItemParser
    {
        return $this->getServiceLocator()->get(XmlToItemParser::class);
    }

    private function getItemIdentifierValidator(): ItemIdentifierValidator
    {
        return $this->getServiceLocator()->get(ItemIdentifierValidator::class);
    }

    /**
     * Check if given string is a valid xml. Throw common_exception_Error if not.
     *
     * @param string $xml
     * @throws common_exception_Error
     */
    private function validateXmlInput(string $xml)
    {
        if (trim($xml) === '') {
            throw new common_exception_Error('Empty string given');
        }
        \tao_helpers_Xml::getSimpleXml($xml);
    }

    /**
     * Download sample template for tabular import
     *
     * @param string 
     * @throws common_exception_Error
     */
    public function downloadCsv()
    {
        if (!$this->hasRequestParameter('uri')) {
            throw new common_exception_MissingParameter('uri', __METHOD__);
        }

        $metaDataArray = $this->getMetadataArray();

        $headers = $this->getHeaderList();

        $final_header = array_merge($headers, $metaDataArray);

        $correct_response = array(
            "item with correct answer",
            'Select the correct response (no restriction on number of selectable choices). The value in "correct_answer" should be choice identifiers (listed in the column header) and not the actual text content of the choices. In this example, "choice_2" is the correct answer and gives the score 1',
            '',
            'en-US',
            '',
            '',
            'text for choice_1',
            'text for choice_2',
            'text for choice_3',
            'text for choice_4',
            '',
            '',
            '',
            '',
            'choice_2'
        );
        $map_response = array(
            "item with partial score",
            'Select the correct response (the choices are shuffled, at least 1 choice must be selected and maximum of 2 allowed, this item uses partial scoring)',
            '1',
            'en-US',
            '1',
            '2',
            'A',
            'B',
            'C',
            'D',
            '3',
            '0',
            '-2',
            '-1',
            ''
        );
        $combination_response = array(
            "item with both correct answer and partial score",
            'Select the correct response (1 single choice allowed, the correct answer is "X" and "Y", this item uses partial scoring)',
            '',
            'en-US',
            '',
            '1',
            'W',
            'X',
            'Y',
            'Z',
            '-1',
            '1',
            '1',
            '0',
            'choice_2,choice_4'
        );

        $final_csv_array = array(
            $final_header,
            $correct_response,
            $map_response,
            $combination_response
        );
        header("Content-type: text/csv");
        header("Content-Disposition: attachment; filename=result_file.csv");
        $output = fopen("php://output", "w");
        foreach ($final_csv_array as $row) {
            fputcsv($output, $row);
        }
        fclose($output);
    }

    /**
     * Get metadata list
     * @return array
     */
    private function getMetadataArray(): array
    {
        $metaDataArray      = array();
        $class              = new core_kernel_classes_Class($this->getRequestParameter('uri'));
        $returnValue[]      = $this->getClass(tao_helpers_Uri::decode($this->getRequestParameter('uri')));
        $aliasProperty      = $class->getProperty(GenerisRdf::PROPERTY_ALIAS);
        $classProperties    = $class->getProperties(true);
        foreach ($classProperties as $property) {
            $aliasName = (string)$property->getOnePropertyValue($aliasProperty);
            if (!$property->getWidget()) {
                continue;
            }
            $widgetUri = $property->getWidget()->getUri();
            if ($aliasName && $this->isTextWidget($widgetUri)) {
                $metaDataArray[] = "metadata_" . $property->getLabel() . "_" . $aliasName;
            }
        }
        return $metaDataArray;
    }

    /**
     * Get Header list
     * @return array
     */
    private function getHeaderList(): array
    {
        $template_definition = CsvTemplateRepository::DEFAULT_DEFINITION;
        foreach ($template_definition['columns'] as $key => $val) {
            if (strpos($key, "_score") !== false) {
                for ($i = 1; $i <= 4; $i++) {
                    $headers[] = "choice_" . $i . "_score";
                }
                continue;
            }
            if (strpos($key, "choice_") !== false) {
                for ($i = 1; $i <= 4; $i++) {
                    $headers[] = "choice_" . $i;
                }
                continue;
            }
            if (strpos($key, "metadata") !== false) {
                continue;
            }
            $headers[] = $key;
        }
        return $headers;
    }

    /**
     * Check whether it is a text widget
     * @return bool
     */
    private function isTextWidget($widgetUri): bool
    {
        return ($widgetUri)
            ? in_array($widgetUri, self::TEXT_WIDGETS, true)
            : false;
    }
}
