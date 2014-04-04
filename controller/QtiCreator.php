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

use \core_kernel_classes_Resource;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\controller\QtiCreator;
use \tao_actions_CommonModule;
use \tao_helpers_Uri;

/**
 * QtiCreator Controller provide actions to edit a QTI item
 *
 * @author CRP Henri Tudor - TAO Team - {@link http://www.tao.lu}
 * @package taoQTI
 
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class QtiCreator extends tao_actions_CommonModule
{

    
    public function index(){

        if($this->hasRequestParameter('instance')){
            $itemUri = tao_helpers_Uri::decode($this->getRequestParameter('instance'));
            $this->setData('uri', $itemUri);
        }
        
        $this->setView('QtiCreator/index.tpl');
    }
    
    public function getItemData(){
        
        $returnValue = array(
            'itemData' => null
        );
        
        if($this->hasRequestParameter('uri')){
            $itemUri = tao_helpers_Uri::decode($this->getRequestParameter('uri'));
            $itemResource = new core_kernel_classes_Resource($itemUri);
            $item = Service::singleton()->getDataItemByRdfItem($itemResource);
            if(!is_null($item)){
                $returnValue['itemData'] = $item->toArray();
            }
        }
        
        echo json_encode($returnValue);
    }

}
