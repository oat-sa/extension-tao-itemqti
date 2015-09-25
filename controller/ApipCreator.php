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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\controller;

use core_kernel_classes_Resource;
use oat\taoQtiItem\model\CreatorConfig;
use oat\taoQtiItem\model\apip\ApipService;
use oat\taoQtiItem\helpers\Apip;
use oat\taoQtiItem\model\ItemModel;
use tao_actions_CommonModule;
use tao_helpers_Uri;
use taoItems_models_classes_ItemsService;
use DOMDocument;
use oat\taoQtiItem\helpers\Authoring;

/**
 * APIPCreator Controller provide actions to edit a APIP item
 *
 * @package taoQtiItem
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class ApipCreator extends tao_actions_CommonModule
{

    public function index()
    {

        $itemUri = tao_helpers_Uri::decode($this->getRequestParameter('id'));
        if (is_null($itemUri) || empty($itemUri)) {
            throw new \tao_models_classes_MissingRequestParameterException("id");
        } else {
            //set authoring config :
            $config = new CreatorConfig();

            //uri:
            $config->setProperty('uri', $itemUri);

            //get label:
            $rdfItem = new core_kernel_classes_Resource($itemUri);
            $config->setProperty('label', $rdfItem->getLabel());

            //set the current data lang in the item content to keep the integrity
            //@todo : allow preview in a language other than the one in the session
            $lang = \common_session_SessionManager::getSession()->getDataLanguage();
            $config->setProperty('lang', $lang);

            //base url:
            $url = tao_helpers_Uri::url('getFile', 'QtiCreator', 'taoQtiItem',
                    array(
                    'uri' => $itemUri,
                    'lang' => $lang
                    )
            );
            $config->setProperty('baseUrl', $url.'&relPath=');

            //set apip item xml content:
            $config->setProperty('xml', $this->getApipItemXml($rdfItem, $lang));

            $conf = $config->toArray();
            $this->setData('config', $conf);
            $this->setView('ApipCreator/index.tpl');
        }
    }

    public function save()
    {

        $returnValue = array('success' => false);
        $itemUri     = tao_helpers_Uri::decode($this->getRequestParameter('id'));
        $lang        = tao_helpers_Uri::decode($this->getRequestParameter('lang'));
        if (empty($itemUri)) {
            throw new \tao_models_classes_MissingRequestParameterException("id");
        } else if (empty($lang)) {
            throw new \tao_models_classes_MissingRequestParameterException("lang");
        } else {
            $rdfItem = new \core_kernel_classes_Resource($itemUri);
            $xml     = file_get_contents('php://input');
            if ($this->storeApipItemXml($rdfItem, $lang, $xml) && $this->setQtiItemContent($rdfItem, $lang, $xml)) {
                $returnValue['success'] = true;
                $returnValue['xml']     = $xml;
            }
        }
        $this->returnJson($returnValue);
    }
    
    /**
     * Get the XML string for an complete QTI APIP item
     *
     * @param core_kernel_classes_Resource $rdfItem
     * @param string $lang
     * @return string
     */
    protected function getApipItemXml(core_kernel_classes_Resource $rdfItem, $lang)
    {

        $apipService = ApipService::singleton();
        $itemDoc     = $apipService->getMergedApipItemContent($rdfItem, $lang);
        return $itemDoc->saveXML();
    }
    
    /**
     * Store the complete QTI item XML
     * 
     * @param core_kernel_classes_Resource $rdfItem
     * @param string $lang
     * @param string $xml
     */
    protected function setQtiItemContent(core_kernel_classes_Resource $rdfItem, $lang, $xml)
    {
        $itemService = taoItems_models_classes_ItemsService::singleton();
        if($itemService->hasItemModel($rdfItem, array(ItemModel::MODEL_URI))){
            $itemDoc = new DOMDocument('1.0', 'UTF-8');
            $itemDoc->loadXML($xml);
            $itemDoc = Apip::extractQtiModel($itemDoc);

            $xml = Authoring::sanitizeQtiXml($itemDoc->saveXML());
            Authoring::validateQtiXml($xml);

            return $itemService->setItemContent($rdfItem, $xml);
        }
        
        return false;
    }
    
    /**
     * Store the complete QTI APIP item XML
     * 
     * @param core_kernel_classes_Resource $rdfItem
     * @param string $lang
     * @param string $xml
     */
    protected function storeApipItemXml(core_kernel_classes_Resource $rdfItem, $lang, $xml)
    {

        $itemDoc     = new DOMDocument('1.0', 'UTF-8');
        $itemDoc->loadXML($xml);
        $itemService = taoItems_models_classes_ItemsService::singleton();
        if ($itemService->hasItemModel($rdfItem, array(ItemModel::MODEL_URI))) {
            if (Apip::isValid($itemDoc)) {
                $apipService = ApipService::singleton();
                $apipService->storeApipAccessibilityContent($rdfItem, $itemDoc);
                return true;
            }
        }

        return false;
    }
}