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
], function (_, $, selectorTpl){
    
    var _ns = '.inclusion-order-selector';
    
    var _inclusionOrders = [
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

    function addEvents($container){
        $container.find('.inclusion-order-container select').off(_ns).on('change', function(){
            
            var $select = $(this);
            var newValue = $select.val();
            var previousValue = $select.data('previous-value');
            
            if(previousValue){
                $container.trigger('inclusionorderdeactivated', [previousValue]);
            }
            $select.data('previous-value', newValue);
            $container.trigger('inclusionorderactivated', [newValue]);
        });
    }

    function render($container, selectedInclusionOrder){
        
        var tplData = {inclusionOrders:[]};
        _.forIn(_inclusionOrders, function (order){
            tplData.inclusionOrders.push({
                type : order.type,
                label : order.label
            });
        });
        console.log(tplData);
        $container.append(selectorTpl(tplData));

        if(selectedInclusionOrder){
            $container.find('inclusion-order-container select').val(selectedInclusionOrder).change();
        }
        
        addEvents($container);
    }
    
    function getAvailableInclusionOrders(){
        return _.clone(_inclusionOrders);
    }
    
    function getValue() {
        return $('.inclusion-order-container select').val();
    }
    
    return {
        render : render,
        getValue : getValue,
        getAvailableInclusionOrders : getAvailableInclusionOrders
    };
});