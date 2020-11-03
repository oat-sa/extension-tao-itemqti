
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
 * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin displays add the preview button and launch it.
 * It also provides a mechanism that ask to save
 * the item before the preview (if the item has changed - should).
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'i18n',
    'core/plugin',
    'ui/hider',
    'taoItems/previewer/factory',
    'tpl!taoQtiItem/qtiCreator/plugins/button',
], function($, __, pluginFactory, hider, previewerFactory, buttonTpl){
    'use strict';

    /**
     * Handler for preview
     * @param {Object} e - Preview event fired
     * @param {Object} plugin - Context of preview
     */
    function previewHandler(e, plugin) {
        const itemCreator = plugin.getHost();

        if (itemCreator.isEmpty() || !isSaved(plugin)) {
            return;
        }

        $(document).trigger('open-preview.qti-item');
        e.preventDefault();
        plugin.disable();
        itemCreator.trigger('preview', itemCreator.getItem().data('uri'));
        plugin.enable();
    }

    /**
     * Set the value of saved
     * @param {Boolean} value - Value of new saved status
     * @param {Object} plugin - Context of preview
     */
    function setSaved(value, plugin) {
        plugin.saved = value;
    }

    /**
     * Return if item is saved or not
     * @param {Object} plugin - Context of preview
     * @returns {Boolean} true/false
     */
    function isSaved(plugin) {
        return plugin.saved;
    }

    /**
     * Handler for disable preview if its empty
     * @param {Object} plugin - Context of preview
     */
    function enablePreviewIfNotEmpty(plugin) {
        setSaved(true, plugin);
        if (!plugin.getHost().isEmpty()) {
            plugin.enable();
        }
    }

    /**
     * Handler for disable preview
     * @param {Object} plugin - Context of preview
     */
    function disablePreviewIfEmpty(plugin) {
        if (plugin.getHost().isEmpty() || !isSaved(plugin)) {
            plugin.disable();
            setSaved(false, plugin);
        }
    }
    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({

        name : 'preview',
        saved : true,

        /**
         * Initialize the plugin (called during itemCreator's init)
         * @fires {itemCreator#preview}
         */
        init : function init(){
            var itemCreator = this.getHost();

            /**
             * Preview an item
             * @event itemCreator#preview
             * @param {String} uri - the uri of this item to preview
             */
            itemCreator.on('preview', function(uri) {
                var type = 'qtiItem';

                if (!this.isEmpty()) {
                    previewerFactory(type, uri, {}, {
                        readOnly: false,
                        fullPage: true
                    });
                }
            });

            itemCreator.on('saved', () => enablePreviewIfNotEmpty(this));

            //creates the preview button
            this.$element = $(buttonTpl({
                icon: 'preview',
                title: __('Preview the item'),
                text : __('Preview'),
                cssClass: 'preview-trigger'
            })).on('click', e => previewHandler(e, this));

            this.getAreaBroker()
                .getItemPanelArea()
                .on('dropped.gridEdit.insertable', () => setSaved(false, this))
                .on('item.deleted', () => disablePreviewIfEmpty(this));
        },

        /**
         * Initialize the plugin (called during itemCreator's render)
         */
        render : function render(){

            //attach the element to the menu area
            var $container = this.getAreaBroker().getMenuArea();
            if (this.getHost().isEmpty()) {
                this.disable();
            }
            $container.append(this.$element);
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
