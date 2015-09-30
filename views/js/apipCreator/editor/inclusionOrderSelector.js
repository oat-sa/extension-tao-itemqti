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
    'tpl!taoQtiItem/apipCreator/tpl/inclusionOrderSelector/selector'
], function (_, $, selectorTpl) {
    'use strict';

    var _ns = '.inclusion-order-selector';

    var _inclusionOrders = [
        {
            type : 'textOnlyDefaultOrder',
            label : 'Spoken, Text Only - default',
            accessElementInfo : {
                type : 'spoken',
                options: {}
            }
        },
        {
            type : 'textOnlyOnDemandOrder',
            label : 'Spoken, Text Only - on demand',
            accessElementInfo : {
                type : 'spoken',
                options: {}
            }
        },
        {
            type : 'graphicsOnlyOnDemandOrder',
            label : 'Spoken, Graphics Only',
            accessElementInfo : {
                type : 'spoken',
                options: {}
            }
        },
        {
            type : 'textGraphicsDefaultOrder',
            label : 'Spoken, Text & Graphic - default',
            accessElementInfo : {
                type : 'spoken',
                options: {}
            }
        },
        {
            type : 'textGraphicsOnDemandOrder',
            label : 'Spoken, Text & Graphic - on demand',
            accessElementInfo : {
                type : 'spoken',
                options: {}
            }
        },
        {
            type : 'nonVisualDefaultOrder',
            label : 'Spoken, Non-Visual',
            accessElementInfo : {
                type : 'spoken',
                options: {}
            }
        },
        {
            type : 'brailleDefaultOrder',
            label : 'Braille user',
            accessElementInfo : {
                type : 'brailleText',
                options: {}
            }
        },
        {
            type : 'aslDefaultOrder',
            label : 'American Sign Language - default',
            accessElementInfo : {
                type : 'signing',
                options: {type: 'signFileASL'}
            }
        },
        {
            type : 'aslOnDemandOrder',
            label : 'American Sign Language - on demand',
            accessElementInfo : {
                type : 'signing',
                options: {type: 'signFileASL'}
            }
        },
        {
            type : 'signedEnglishDefaultOrder',
            label : 'Signed English - default',
            accessElementInfo : {
                type : 'signing',
                options: {type: 'signFileSignedEnglish'}
            }
        },
        {
            type : 'signedEnglishOnDemandOrder',
            label : 'Signed English - on demand',
            accessElementInfo : {
                type : 'signing',
                options: {type: 'signFileSignedEnglish'}
            }
        }
    ];

    /**
     * Add events listener to the inclusion order selector
     * 
     * @fires activated.inclusion-order-selector
     * @fires deactivated.inclusion-order-selector
     * @param {JQuery} $container
     * @returns {undefined}
     */
    function _addEvents($container){
        
        $container.find('.inclusion-order-container select').off(_ns).on('change', function(){
            
            var $select = $(this);
            var newValue = $select.val();
            var previousValue = $select.data('previous-value');
            
            if(previousValue){
                $container.trigger('deactivated'+_ns, [previousValue]);
            }
            $select.data('previous-value', newValue);
            
            $container.trigger('activated'+_ns, [newValue]);
        });
    }
    
    /**
     * Render the inclusion order selection widget into the given container
     * Then initalize the events for use interaction
     * 
     * @param {JQuery} $container
     * @param {string} selectedInclusionOrder
     * @returns {undefined}
     */
    function render($container, selectedInclusionOrder){
        
        var tplData = {inclusionOrders:[]};
        _.forIn(_inclusionOrders, function (order){
            tplData.inclusionOrders.push({
                type : order.type,
                label : order.label
            });
        });
        
        $container.append(selectorTpl(tplData));
        if(selectedInclusionOrder){
            $container.find('.inclusion-order-container select').val(selectedInclusionOrder).change();
        }
        
        _addEvents($container);
    }
    
    /**
     * Get the array of all available inclusion orders in the apip authoring
     * 
     * @returns {array}
     */
    function getAvailableInclusionOrders(){
        return _.clone(_inclusionOrders);
    }
    
    /**
     * Get a inclusion order data model by its name/id
     * 
     * @param {string} inclusionOrderName
     * @returns {unresolved}
     */
    function getInclusionOrder(inclusionOrderName){
        var inclusionOrderData = _.find(_inclusionOrders, {type : inclusionOrderName});
        if(inclusionOrderData){
            return inclusionOrderData;
        }else{
            throw 'unknown type of inclusionOrder';
        }
    }
    
    /**
     * Get the value of the inclusionOrder
     * 
     * @todo replace this method with a non-global jquery selector..
     * @returns {JQuery}
     */
    function getValue() {
        return $('.inclusion-order-container select').val();
    }
    
    return {
        render : render,
        getValue : getValue,
        getAvailableInclusionOrders : getAvailableInclusionOrders,
        getInclusionOrder : getInclusionOrder
    };
});