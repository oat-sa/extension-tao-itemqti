/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'ui/contextualPopup',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElement',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo',
    'tpl!taoQtiItem/apipCreator/tpl/form/aeUsageInfo'
], function(_, contextualPopup, accessElementTpl, accessElementInfoTpl, aeUsageInfoTpl){

    'use strict';

    var _aeInfoMap = {
        textGraphicsDefaultOrder : 'spoken',
        textGraphicsOnDemandOrder : 'spoken',
        aslDefaultOrder : 'signing',
        aslOnDemandOrder : 'signing'
    };

    function build($anchor, qtiElement, inclusionOrderType){
        var $form = renderForm(qtiElement, inclusionOrderType);
        return buildPopup($anchor, $form);
    }

    function renderForm(qtiElement, inclusionOrderType){
        
        var aeInfo = getRelatedAccessElementInfo(qtiElement, inclusionOrderType);
        var aeModel = aeInfo.getImplementation();
        var formView = aeModel.getFormView(aeInfo);
        var htmlForm = formView.render();
        var htmlUsageInfo = '';
        
        var inclusionOrders = getRelatedInclusionOrder(aeInfo);
        if(inclusionOrders.length){
            //render ae usage info
            htmlUsageInfo = aeUsageInfoTpl({
                usages : inclusionOrders
            });
        }
        
        var accessElementInfo = accessElementInfoTpl({
            serial : aeInfo.serial,
            type : aeModel.typeId,
            usageInfo : htmlUsageInfo,
            form : htmlForm
        });
        
        var $form = $(accessElementTpl({
            accessElementInfo : accessElementInfo
        }));
        
        
        //bind events :
        formView.initEvents($form);
        
        return $form;
    }

    function buildPopup($anchor, formContent){
        return contextualPopup($anchor, $anchor.parents('#item-editor-scroll-inner'), {content : formContent});
    }

    function getRelatedAccessElementInfo(qtiElement, inclusionOrderType){
        var ae, aeInfo, aeInfoType = _aeInfoMap[inclusionOrderType];
        if(aeInfoType){
            ae = qtiElement.getAccessElementByInclusionOrder(inclusionOrderType);
            if(!ae){
                //does not exist ? create one
                ae = qtiElement.createAccessElement();
            }
            aeInfo = ae.getAccessElementInfo(aeInfoType);
            if(!aeInfo){
                //does not exist ? create one
                aeInfo = ae.createAccessElementInfo(aeInfoType);
            }
        }else{
            throw 'unknown type of inclusionOrderType';
        }
        return aeInfo;
    }

    function getRelatedInclusionOrder(aeInfo){
        var ae = aeInfo.getAssociatedAccessElement();
        var inclusionOrders = ae.getInclusionOrders();
        var ret = [];
        _.each(inclusionOrders, function(orderType){
            ret.push({
                type : orderType,
                name : orderType
            });
        });
        return ret;
    }

    function renderAccessElementInfoForm(aeInfo){
        
    }
    
    return {
        build : build
    };
});