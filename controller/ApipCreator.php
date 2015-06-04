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
use tao_actions_CommonModule;
use tao_helpers_Uri;

/**
 * APIPCreator Controller provide actions to edit a APIP item
 *
 * @package taoQtiItem
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class ApipCreator extends tao_actions_CommonModule
{

    public function index(){

        $itemUri = tao_helpers_Uri::decode($this->getRequestParameter('id'));
        if(is_null($itemUri) || empty($itemUri)){
            throw new \tao_models_classes_MissingRequestParameterException("id");
        }else{
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
            $url = tao_helpers_Uri::url(
                            'getFile', 'QtiCreator', 'taoQtiItem', array(
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

    protected function getApipItemXml($rdfItem, $lang){

        $itemDoc = ApipService::singleton()->getMergedApipItemContent($rdfItem, $lang);
        return $itemDoc->saveXML();
    }

}