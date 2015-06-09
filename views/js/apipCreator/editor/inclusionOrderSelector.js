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
    
    var _inclusionOrders = {
        textGraphicsDefaultOrder : 'Spoken, Text & Graphic - default',
        textGraphicsOnDemandOrder : 'Spoken, Text & Graphic - on demand',
        aslDefaultOrder : 'American Sign Language - default',
        aslOnDemandOrder : 'American Sign Language - on demand',
        signedEnglishDefaultOrder : 'Signed English - default',
        signedEnglishOnDemandOrder : 'Signed English - on demand'
    };

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
        
        var tplData = {inclusionOrders:{}};
        _.forIn(_inclusionOrders, function (v, k){
            tplData.inclusionOrders[k] = {label : v};
        });
        
        $container.append(selectorTpl(tplData));

        if(selectedInclusionOrder){
            $container.find('inclusion-order-container select').val(selectedInclusionOrder).change();
        }
        
        addEvents($container);
    }

    return {
        render : render
    };
});