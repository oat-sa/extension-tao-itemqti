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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/qtiCreator/editor/gridEditor/droppable',
    'taoQtiItem/lib/jqueryui_dragdrop'
], function($, _, QtiElements, droppable){
    "use strict";
    var _insertableDefaultsOptions = {
        helper : function(){
            return $(this).clone();
        }
    };

    var createInsertable = function createInsertable($el, $to, opts){

        var options = _.defaults(opts, _insertableDefaultsOptions);

        createDraggable($el, $to, {
            helper : options.helper,
            namespace : 'insertable'
        });
    };

    var createDraggable = function createDraggable($el, $to, opts){

        var options = _.defaults(opts, {
            distance : 1,
            helper : 'original'
        });

        $el.draggable({
            distance : parseInt(options.distance),
            helper : options.helper,
           // appendTo : $('#item-editor-panel'), // @TODO needs to be set to $to => very important ! to enable movable correct positioning
            // this will create the issue that elements dragged from the sidebar will be UNDER the sidebar
            // so far no solution found (before scroll-new scroll bar r.XXX)
            appendTo : $(document.body), // @TODO needs to be set to $to => very important ! to enable movable correct positioning
                                         // this will create the issue that elements dragged from the sidebar will be UNDER the sidebar
                                         // so far no solution found
            opacity : 1,
            scroll : false,
            cursor : 'crosshair',
            cursorAt : {left : -5, bottom : -5},
            create : function(){
                $(this).addClass('grid-draggable');
            },
            start : function(e, ui){

                var qtiClass = $(this).data('qti-class');

                $to.trigger('beforedragoverstart.gridEdit');

                if(typeof(options.start) === 'function'){
                    options.start.call(this, e, ui);
                }

                $(this).removeClass('grid-draggable-active');

                //define the type of draggable block/inline?
                if(QtiElements.isInline(qtiClass)){
                    droppable.createDroppableInlines(qtiClass, $to, options);
                }else if(QtiElements.isBlock(qtiClass)){
                    droppable.createDroppableBlocks(qtiClass, $to, options);
                }else{
                    throw 'undefined qti class';
                }

                $to.trigger('dragoverstart.gridEdit');
            },
            stop : function(e, ui){

                //restore dom:
                $('body').css('cursor', 'auto');

                //no longer needed
                ui.helper.remove();

                //fire "stop" events

                if(typeof(options.stop) === 'function'){
                    options.stop.call(this, e, ui);
                }

                $to.trigger('dragoverstop.gridEdit');
            }
        });

        $el.on('mousedown.gridDraggable.gridEdit', function(){
            $(this).addClass('grid-draggable-active');
        }).on('mouseup.gridDraggable.gridEdit', function(){
            $(this).removeClass('grid-draggable-active');
        });
    };

    var createMovable = function createMovable($el, $to){

        var $parent = $el.parent('[class^="col-"], [class*=" col-"]');
        createDraggable($el, $to, {
            distance : 5,
            initialPosition : $el.parent(),
            namespace : 'movable',
            start : function(e, ui){

                $el.hide();

                $parent.data({
                    'initial-position' : true,
                    'initial-class' : $parent.attr('class')
                }).attr('class', 'new-col');
            },
            helper : function(){

                return $(this).clone()
                    .addClass('grid-draggable-helper')
                    .css({
                    height : $(this).height(),
                    width : $(this).width()
                });
            },
            stop : function(e, ui){

                //restore initial position if given:
                if(!$el.data('grid-element-dropped')){
                    $parent.attr('class', $parent.data('initial-class'));
                }

                //re-init the dropped value:
                $el.data('grid-element-dropped', false);
//                $el.removeData('grid-element-dropped');

                //show it
                $el.show();

            },
            data : {
                widget : $el.data('widget')
            }
        });

    };

    var _destroyDraggables = function _destroyDraggables($el){
        $el.draggable('destroy');
        $el.removeClass('grid-draggable');
        $el.off('.gridDraggable');
    };

    return {
        createInsertable : function($el, $to, opts){
            createInsertable($el, $to, opts);
        },
        createMovable : function($el, $to, opts){
            createMovable($el, $to, opts);
        },
        destroy : _destroyDraggables
    };
});
