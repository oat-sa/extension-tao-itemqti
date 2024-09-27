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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin adds an item viewer aside from the item being edited.
 */
define([
    'jquery',
    'i18n',
    'services/translation',
    'core/plugin',
    'ui/hider',
    'tpl!taoQtiItem/qtiCreator/tpl/layout/viewerPanel'
], function ($, __, translationService, pluginFactory, hider, viewerPanelTpl) {
    'use strict';

    const sideBySideAuthoringClass = 'side-by-side-authoring';

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({
        name: 'save',

        /**
         * Initialize the plugin (called during itemCreator's init)
         */
        init() {
            this.$element = $(viewerPanelTpl());
            this.hide();
        },

        /**
         * Called during the itemCreator's render phase
         */
        render() {
            const itemCreator = this.getHost();
            const config = itemCreator.getConfig();

            if (!config.properties || !config.properties.translation) {
                return;
            }

            this.getAreaBroker().getEditorWrapperArea().prepend(this.$element);

            const $title = this.$element.find('.item-viewer-bar h1');
            const $container = this.$element.find('.item-viewer-scroll-inner');
            const originResourceUri = config.properties.origin;

            translationService
                .getTranslatable(originResourceUri)
                .then(data => (data && data.resources[0]) || {})
                .then(translatable => {
                    $title.text(__('%s - Original', translatable.resourceLabel));
                })
                .catch(error => itemCreator.trigger('error', error));

            $container.html(config.properties.origin); // todo: replace with the actual content

            this.show();
        },

        /**
         * Called during the itemCreator's destroy phase
         */
        destroy() {
            this.$element.remove();
        },

        /**
         * Enable the button
         */
        enable() {
            this.$element.removeProp('disabled').removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable() {
            this.$element.prop('disabled', true).addClass('disabled');
        },

        /**
         * Show the button
         */
        show() {
            this.getAreaBroker().getContainer().addClass(sideBySideAuthoringClass);
            hider.show(this.$element);
        },

        /**
         * Hide the button
         */
        hide() {
            this.getAreaBroker().getContainer().removeClass(sideBySideAuthoringClass);
            hider.hide(this.$element);
        }
    });
});
