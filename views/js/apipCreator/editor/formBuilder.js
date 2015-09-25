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
    'jquery',
    'ui/contextualPopup',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElement',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo',
    'tpl!taoQtiItem/apipCreator/tpl/form/aeUsageInfo',
    'taoQtiItem/apipCreator/editor/inclusionOrderSelector'
], function (_, $, contextualPopup, accessElementTpl, accessElementInfoTpl, aeUsageInfoTpl, inclusionOrderSelector) {
    'use strict';

    var _ns = '.form-builder';

    /**
     * Build the form for a qtiElement apip feature editing
     * 
     * @param {JQuery} $anchor
     * @param {object} qtiElement
     * @param {string} inclusionOrderType
     * @returns {Object} the popup container
     */
    function build($anchor, qtiElement, inclusionOrderType) {
        var $form = _renderForm(qtiElement, inclusionOrderType),
            formPopup = _buildPopup($anchor, $form);
        $anchor.trigger('formready' + _ns, [formPopup, $anchor, $form]);
        return formPopup;
    }

    /**
     * Create the form to edit the access feature for an qtiElement in a specific inclusionOrder
     * @param {object} qtiElement
     * @param {string} inclusionOrderType
     * @returns {JQuery}
     */
    function _renderForm(qtiElement, inclusionOrderType) {

        var aeInfo = getRelatedAccessElementInfo(qtiElement, inclusionOrderType),
            aeModel = aeInfo.getImplementation(),
            formView = aeModel.getFormView(aeInfo),
            htmlForm = formView.render(),
            htmlUsageInfo, htmlAccessElementInfo, $form,
            inclusionOrders = getRelatedInclusionOrder(aeInfo);

        if (inclusionOrders.length > 1) {
            //render ae usage info
            inclusionOrders = _.filter(inclusionOrders, function (val, key) {
                return val.type !== inclusionOrderType;
            });
            htmlUsageInfo = aeUsageInfoTpl({
                usages : inclusionOrders
            });
        }

        htmlAccessElementInfo = accessElementInfoTpl({
            serial : aeInfo.serial,
            type : aeModel.typeId,
            usageInfo : htmlUsageInfo,
            form : htmlForm
        });

        $form = $(accessElementTpl({
            accessElementInfo : htmlAccessElementInfo
        }));

        //bind events :
        formView.initEvents($form);

        formView.initValidator($form);

        $form.data('form-instance', formView);

        return $form;
    }

    /**
     * Build the popup container for the $form and bind it to the $anchor
     * 
     * @param {jQuery} $anchor
     * @param {jQuery} $formContent
     * @returns {Object} the created popup
     */
    function _buildPopup($anchor, $formContent){
        return contextualPopup($anchor, $anchor.parents('#item-editor-scroll-inner'), {
            content : $formContent,
            controls : {
                done : true,
                cancel : true
            },
            style : {
                popupWidth : 750
            },
            callbacks : {
                beforeDone : function () {
                    var formView = $formContent.data('form-instance');
                    return formView.validator.validate();
                }
            }
        });
    }

    /**
     * Get the access element info associate to a qtiElement and in a specific inclusionOrder
     * If none has been found, create a new one
     * 
     * @todo might be worth throwing an event upon creation
     * @param {object} qtiElement
     * @param {string} inclusionOrderType
     * @returns {object} - the access element instance
     */
    function getRelatedAccessElementInfo(qtiElement, inclusionOrderType){

        var inclOrder = inclusionOrderSelector.getInclusionOrder(inclusionOrderType);
        var ae,
            aeInfo,
            aeInfoType = inclOrder.accessElementInfo.type,
            aeInfoOptions = inclOrder.accessElementInfo.options,
            inclusionOrder;

        if (aeInfoType) {
            ae = qtiElement.getAccessElementByInclusionOrder(inclusionOrderType);
            if (!ae) {
                //does not exist ? create one
                ae = qtiElement.createAccessElement();
                inclusionOrder = ae.apipItem.getAccessElementsByInclusionOrder(inclusionOrderType);
                ae.setInclusionOrder(inclusionOrderType, inclusionOrder.length);
            }
            aeInfo = ae.getAccessElementInfo(aeInfoType);
            if (!aeInfo) {
                //does not exist ? create one
                aeInfo = ae.createAccessElementInfo(aeInfoType, aeInfoOptions);
            } else {
                aeInfo = aeInfo[0];
            }
            console.log(aeInfo.pristine);
        } else {
            throw 'unknown type of inclusionOrderType';
        }
        return aeInfo;
    }

    /**
     * Get the inclusion orders associated to an access element info object
     * 
     * @param {object} aeInfo
     * @returns {Array}
     */
    function getRelatedInclusionOrder(aeInfo) {
        var ae = aeInfo.getAssociatedAccessElement(),
            inclusionOrders = ae.getInclusionOrders(),
            inclusionOrder,
            ret = [];

        _.each(inclusionOrders, function (orderType) {
            inclusionOrder = inclusionOrderSelector.getInclusionOrder(orderType);
            ret.push({
                type : inclusionOrder.type,
                label : inclusionOrder.label
            });
        });
        return ret;
    }

    return {
        build : build
    };
});