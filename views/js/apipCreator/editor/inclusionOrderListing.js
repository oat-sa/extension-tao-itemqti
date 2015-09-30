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
                order : (i + 1)//startubg from 1
            };
        });

        $container.empty().append(listTpl({
            elements : _elements
        }));
        
        var $sortable = $container.children('.order-list');
        $sortable.sortable({
            axis : 'y',
            handle : '.content',
            change : function(e, ui){

                var $helper = $(ui.helper);
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

                $container.trigger('change' + _ns, [aeOrder, qtiOrder]);
            }
        }).disableSelection();

        //@todo listen to newly created ae

    }

    return {
        render : render
    };
});