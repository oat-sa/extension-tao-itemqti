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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash'
], function($, _) {
    'use strict';

    var helper = {
        buildInlineContainer : function(widget){
            var $wrap,
                textNode,
                float = '';

            if(widget.element.hasClass('lft')){
                float = ' lft';
            }else if(widget.element.hasClass('rgt')){
                float = ' rgt';
            }

            $wrap = $('<span>', {
                'data-serial' : widget.element.serial,
                'class' : 'widget-box widget-inline widget-'+widget.element.qtiClass+float,
                'data-qti-class' : widget.element.qtiClass,
                'contenteditable' : 'false'
            });
            widget.$container = widget.$original.wrap($wrap).parent();
        },
        buildBlockContainer : function(widget){

            //absolutely need a div here (not span), otherwise mathjax will break
            var $wrap = $('<div>', {
                'data-serial' : widget.element.serial,
                'class' : 'widget-box widget-block widget-'+widget.element.qtiClass,
                'data-qti-class' : widget.element.qtiClass
            });
            widget.$container = widget.$original.wrap($wrap).parent();
        },
        createToolbar : function(widget, toolbarTpl){
            var $tlb;

            if(_.isFunction(toolbarTpl)){

                $tlb = $(toolbarTpl({
                    serial : widget.serial,
                    state : 'active'
                }));

                widget.$container.append($tlb);

                $tlb.find('[data-role="delete"]').on('click.widget-box', function(e){
                    e.stopPropagation();//to prevent direct deleting;
                    widget.changeState('deleting');
                });

            }else{
                throw new Error('the toolbarTpl must be a handlebars function');
            }
        }
    };

    return helper;
});
