
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

/**
 * This plugin prints the item.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
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

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({

        name : 'print',

        /**
         * Initialize the plugin (called during itemCreator's init)
         */
        init : function init(){
            var self = this;

            var itemCreator = this.getHost();

            //spread the "no item prin" class an every element above the item panel
            //FIXME this is a weird way, especially because the css class stays after the print...
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
         * Called during the itemCreator's destroy phase
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
