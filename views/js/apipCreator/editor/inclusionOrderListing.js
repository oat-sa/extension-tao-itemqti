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
    'tpl!taoQtiItem/apipCreator/tpl/inclusionOrderListing/list'
], function (_, $, listTpl) {
    'use strict';
    
    var _ns = '.inclusion-order-listing';
    
    function render($container, elements){
        
        var i = 0;
        var _elements = _.map(elements, function(element){
            i++;//starting from 0
            return {
                id : element.id,
                qti : element.qti,
                content : element.content,
                order : i
            };
        });
        
        $container.append(listTpl({
            elements:_elements
        }));
        console.log(_elements);
        var $sortable = $container.children('.order-list');
        $sortable.sortable({
            axis : 'y',
            handle : '.content',
            change : function(e, ui){
                
                var $helper = $(ui.helper);
                var i = 1;
                var qtiOrder = [];
                var aeOrder = [];
                
                $sortable.children('.order-element').not('.ui-sortable-helper').each(function(e){
                    
                    var $li = $(this);
                    if($li.hasClass('ui-sortable-placeholder')){
                        $li = $helper;
                    }
                    $li.data('order', i);
                    $li.find('.order').html(i);
                    
                    aeOrder.push($li.data('id'));
                    qtiOrder.push($li.data('qti'));
                    
                    i++;
                });
                
                $container.trigger('change'+_ns, [aeOrder, qtiOrder]);
            }
        }).disableSelection();
        
        //@todo listen to newly created ae
        
    }
    
    return {
        render : render
    };
});