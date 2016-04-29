
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
    'core/plugin',
    'ui/hider',
    'tpl!taoQtiItem/qtiCreator/plugins/button'
], function($, __, pluginFactory, hider, buttonTpl){
    'use strict';

    /**
     * Spread a css class to an element's parents and theirs siblings
     * @param {jQueryElement} $container - the target
     * @param {String} cssClass - the class to spread
     */
    var spreadClass = function spreadClass($container, cssClass) {
        $container.parents().each(function initHideOnPrint() {
            $(this).siblings().addClass(cssClass);
        });
    };

    return pluginFactory({
        name : 'print',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;

            var itemCreator = this.getHost();

            //spread the "no item prin" class an every element above the item panel
            spreadClass(this.getAreaBroker().getItemPanelArea(), 'item-no-print');

            this.$element = $(buttonTpl({
                icon: 'print',
                title: __('Print the item'),
                text : __('Print'),
                cssClass: 'print-trigger'
            })).on('click', function printHandler(e){
                e.preventDefault();
                window.print();
            });

            this.hide();
            this.disable();

            itemCreator.on('ready', function(){
                self.enable();
            });
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
