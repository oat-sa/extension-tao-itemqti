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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin displays add the preview button and launch it.
 * It also provides a mechanism that ask to save
 * the item before the preview (if the item has changed - should).
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'module',
    'jquery',
    'i18n',
    'core/plugin',
    'ui/hider',
    'taoItems/previewer/factory',
    'tpl!taoQtiItem/qtiCreator/plugins/button'
], function (module, $, __, pluginFactory, hider, previewerFactory, buttonTpl) {
    'use strict';

    /**
     * We assume the ClientLibConfigRegistry is filled up with something like this:
     * 'taoQtiItem/qtiCreator/plugins/menu/preview' => [
     *     'provider' => 'qtiItem',
     * ],
     *
     * Or, with something like this for allowing multiple buttons in case of several providers are available:
     * 'taoQtiItem/qtiCreator/plugins/menu/preview' => [
     *     'provider' => 'qtiItem',
     *     'providers' => [
     *         ['id' => 'qtiItem', 'label' => 'Preview'],
     *         ['id' => 'xxxx', 'label' => 'xxxx'],
     *         ...
     *     ],
     * ],
     */

    /**
     * Handler for preview
     * @param {Object} e - Preview event fired
     * @param {string} uri - Item uri
     * @param {Object} plugin - Context of preview
     * @param {string} provider - The identifier of the preview provider to use
     */
    function previewHandler(e, uri, plugin, provider) {
        if (!$(e.currentTarget).hasClass('disabled')) {
            const itemCreator = plugin.getHost();
            $(document).trigger('open-preview.qti-item');
            e.preventDefault();
            plugin.disable();
            itemCreator.trigger('preview', uri, provider);
            plugin.enable();
        }
    }

    /**
     * Handler for disable preview if its empty
     * @param {Object} plugin - Context of preview
     */
    function enablePreviewIfNotEmpty(plugin) {
        if (!plugin.getHost().isEmpty()) {
            plugin.enable();
        }
    }

    /**
     * Handler for disable preview
     * @param {Object} plugin - Context of preview
     */
    function disablePreviewIfEmpty(plugin) {
        if (plugin.getHost().isEmpty()) {
            plugin.disable();
        }
    }
    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({
        name: 'preview',

        /**
         * Initialize the plugin (called during itemCreator's init)
         * @fires {itemCreator#preview}
         */
        init() {
            const itemCreator = this.getHost();
            const config = module.config();

            const itemCreatorConfig = itemCreator.getConfig();
            const {
                translation,
                originResourceUri: originalItemUri,
                uri: translatedItemUri
            } = itemCreatorConfig.properties;
            /**
             * Preview an item
             * @event itemCreator#preview
             * @param {String} uri - the uri of this item to preview
             */
            itemCreator.on('preview', function (uri, provider) {
                const type = provider || config.provider || 'qtiItem';

                if (!this.isEmpty()) {
                    previewerFactory(
                        type,
                        uri,
                        {},
                        {
                            readOnly: false,
                            fullPage: true,
                            pluginsOptions: config.pluginsOptions
                        }
                    );
                }
            });

            itemCreator.on('saved', () => enablePreviewIfNotEmpty(this));

            const createButton = ({ id, label, title, uri } = {}) => {
                // configured labels will need to to be registered elsewhere for the translations
                const translate = text => text && __(text);

                //if uri has not been specified explicitly, that means we can take one from config
                uri = uri || this.getHost().getConfig().properties.uri;

                return $(
                    buttonTpl({
                        icon: 'preview',
                        title: translate(title) || __('Preview the item'),
                        text: translate(label) || __('Preview'),
                        cssClass: 'preview-trigger',
                        testId: 'preview-the-item'
                    })
                ).on('click', e => previewHandler(e, uri, this, id));
            };

            /* creates the preview buttons 
            in some cases there are more preview buttons than one, that can happen if there are different preview providers
            or different items to be previewed (when we are editing item translation in creator)*/
            if (translation) {
                this.elements = [
                    createButton({
                        uri: originalItemUri,
                        label: 'Preview original',
                        title: 'Preview original item'
                    }),
                    createButton({
                        uri: translatedItemUri,
                        label: 'Preview translation',
                        title: 'Preview item translation'
                    })
                ];
            } else {
                //if configured with multiple preview providers, will show button for each
                this.elements = config.providers ? config.providers.map(createButton) : [createButton()];
            }

            this.getAreaBroker()
                .getItemPanelArea()
                .on('item.deleted', () => disablePreviewIfEmpty(this));
        },

        /**
         * Initialize the plugin (called during itemCreator's render)
         */
        render() {
            //attach the element to the menu area
            const $container = this.getAreaBroker().getMenuArea();
            if (this.getHost().isEmpty()) {
                this.disable();
            }
            this.elements.forEach($element => $container.append($element));
        },

        /**
         * Called during the itemCreator's destroy phase
         */
        destroy() {
            this.elements.forEach($element => $element.remove());
        },

        /**
         * Enable the button
         */
        enable() {
            this.elements.forEach($element => $element.removeProp('disabled').removeClass('disabled'));
        },

        /**
         * Disable the button
         */
        disable() {
            this.elements.forEach($element => $element.prop('disabled', true).addClass('disabled'));
        },

        /**
         * Show the button
         */
        show() {
            this.elements.forEach($element => hider.show($element));
        },

        /**
         * Hide the button
         */
        hide() {
            this.elements.forEach($element => hider.hide($element));
        }
    });
});
