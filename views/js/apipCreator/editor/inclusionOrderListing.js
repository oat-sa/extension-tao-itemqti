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
], function(_, $, listTpl){

    'use strict';

    var _ns = '.inclusion-order-listing';

    function render($container, elements){

        var _elements = _.map(elements, function(element, i){
            return {
                id : element.id,
                qti : element.qti,
                content : element.content,
                order : (i + 1)//starting from 1
            };
        });

        $container.empty().append(listTpl({
            elements : _elements
        }));

        var currentQti;
        var currentAe;
        var $sortable = $container.children('.order-list');
        $sortable.sortable({
            axis : 'y',
            handle : '.content',
            start : function(e, ui){
                var $helper = $(ui.helper);
                currentAe = $helper.data('id');
                currentQti = $helper.data('qti');
                $container.trigger('start' + _ns, [currentAe, currentQti]);
            },
            change : function(e, ui){
                var data = getSortingData(ui);
                $container.trigger('change' + _ns, [data.aeOrder, data.qtiOrder, currentAe, currentQti]);
            },
            stop : function(e, ui){
                var data = getSortingData(ui);
                $container.trigger('stop' + _ns, [data.aeOrder, data.qtiOrder, currentAe, currentQti]);

                //reset internal values
                currentQti = null;
                currentAe = null;

                //prevent click after the drag stops
                $(ui.item).children('.content').one('click', function(e){
                    e.stopImmediatePropagation();
                });
            }
        }).disableSelection();

        $sortable.on('click' + _ns, '.content', function(){
            var $orderElement = $(this).parent('.order-element');
            $container.trigger('selected' + _ns, [$orderElement.data('id'), $orderElement.data('qti')]);
        });

        function getSortingData(ui){

            var $helper = $(ui.helper);
            var ae = $helper.data('id');
            var qti = $helper.data('qti');
            var qtiOrder = [];
            var aeOrder = [];
            
            $sortable.children('.order-element').not('.ui-sortable-helper').each(function(i){
                
                var $li = $(this);
                var index = i+1;
                if($li.hasClass('ui-sortable-placeholder')){
                    $li = $helper;
                }
                $li.data('order', index);
                $li.find('.order').html(index);

                aeOrder.push($li.data('id'));
                qtiOrder.push($li.data('qti'));
                
            });

            return {
                ae : ae,
                qti : qti,
                aeOrder : aeOrder,
                qtiOrder : qtiOrder
            };
        }
    }

    return {
        render : render
    };
});