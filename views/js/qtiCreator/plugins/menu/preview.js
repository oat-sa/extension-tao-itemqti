
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'i18n',
    'helpers',
    'core/plugin',
    'ui/hider',
    'taoItems/preview/preview',
    'tpl!taoQtiItem/qtiCreator/plugins/button'
], function($, __, helpers, pluginFactory, hider, preview, buttonTpl){
    'use strict';

    return pluginFactory({
        name : 'preview',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){

            var item = this.getHost().getItem();

            this.$element = $(buttonTpl({
                icon: 'preview',
                title: __('Preview the item'),
                text : __('Preview'),
                cssClass: 'preview-trigger'
            })).on('click', function previewHandler(e){
                e.preventDefault();
                preview.init(helpers._url('index', 'QtiPreview', 'taoQtiItem', { uri : item.data('uri') }));
                preview.show();
            });
            this.hide();
        },

        render : function render(){

            //attach the element to the menu area
            var $container = this.getAreaBroker().getMenuArea();
            $container.append(this.$element);
            this.show();
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy (){
            this.$element.remove();
        },

        /**
         * Enable the button
         */
        enable : function enable (){
            this.$element.removeProp('disabled')
                         .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable : function disable (){
            this.$element.prop('disabled', true)
                         .addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show(){
            hider.show(this.$element);
        },

        /**
         * Hide the button
         */
        hide: function hide(){
            hider.hide(this.$element);
        }
    });
});
