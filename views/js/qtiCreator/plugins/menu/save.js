
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
 * This plugin adds a save button to the menu.
 * Could be useful, or not (Save is so 90's, we want auto-saving with undo/redo capabilities)
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

        name : 'save',

        /**
         * Initialize the plugin (called during itemCreator's init)
         */
        init : function init(){
            const itemCreator = this.getHost();

            this.$element = $(buttonTpl({
                icon: 'save',
                title: __('Save the item'),
                text : __('Save'),
                cssClass: 'save-trigger'
            })).on('click', e => {
                e.preventDefault();
                this.disable();
                // trigger save event
                $('#item-editor-panel').trigger('beforesave.qti-creator');
                // defer execution of save function to give beforesave chance to be executed
                _.defer(function(){
                    itemCreator.trigger('save');
                });
            });

            this.hide();
            this.disable();

            itemCreator.on('ready saved error', () => {
                this.enable();
            });
        },

        /**
         * Called during the itemCreator's render phase
         */
        render : function render(){

            //attach the element to the menu area
            const $container = this.getAreaBroker().getMenuArea();
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
