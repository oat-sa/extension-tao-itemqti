
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
 * This plugin adds a "back" button that does a History.go(-1)
 * (like your browser's back button).
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
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({

        name : 'back',

        /**
         * Initialize the plugin (called during itemCreator's init)
         * @fires {itemCreator#exit}
         */
        init : function init(){
            var itemCreator = this.getHost();

            itemCreator.on('exit', function(){
                window.history.back();
            });

            this.$element = $(buttonTpl({
                icon: 'left',
                title: __('Back to Manage Items'),
                text : __('Manage Items'),
                cssClass: 'back-action'
            })).on('click', function backHandler(e){
                e.preventDefault();
                itemCreator.trigger('exit');
            });
            this.hide();
        },

        /**
         * Called during the itemCreator's render phase
         */
        render : function render(){

            //attach the element to the menu area
            var $container = this.getAreaBroker().getMenuLeftArea();
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
