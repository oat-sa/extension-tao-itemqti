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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

/**
 * Item Comments panel plugin.
 * Thin host: mounts shared taoItems comments store + panel under Style | Properties | Comments.
 * Mode switching lives in qtiCreator/helper/panel (setItemSidebarMode).
 *
 * Note: core/plugin only delegates lifecycle methods (init/render/destroy/…).
 * Helpers must be closures or instance properties set during init — not provider methods.
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'taoItems/services/itemComments',
    'taoItems/comments/itemCommentsStore',
    'taoItems/comments/commentsPanel',
    'css!taoQtiItemCss/item-comments.css'
], function ($, _, __, pluginFactory, itemCommentsApi, itemCommentsStoreFactory, commentsPanelFactory) {
    'use strict';

    const TAB_COMMENTS = 'comments';
    const NS = '.itemCommentsPlugin';

    return pluginFactory({
        name: 'itemComments',

        /**
         * @returns {void}
         */
        init() {
            const itemCreator = this.getHost();
            const config = itemCreator.getConfig() || {};
            const properties = config.properties || {};
            const itemUri = properties.uri || '';
            const plugin = this;

            const store = itemCommentsStoreFactory({
                resourceUri: itemUri,
                resourceType: itemCommentsApi.RESOURCE_TYPE.ITEM
            });
            const $modeTabs = $('#item-editor-item-mode-tabs');
            const $commentsTab = $modeTabs.find('[data-tab="comments"]');
            const $commentsHost = $('#sidebar-right-item-comments .item-comments-content-panel');

            const panel = commentsPanelFactory({
                renderTo: $commentsHost,
                store: store
            });

            function updateCountLabel() {
                const label = $commentsTab.data('label') || __('Comments');
                $commentsTab.find('.tab-label').text(label);
                $commentsTab.attr('title', label).attr('aria-label', label);
            }

            store.on(
                [
                    `loaded${NS}`,
                    `countchange${NS}`,
                    `submitted${NS}`,
                    `updated${NS}`,
                    `resolved${NS}`,
                    `deleted${NS}`
                ].join(' '),
                () => {
                    updateCountLabel();
                }
            );

            $(document).on(`itemsidebarmodechange.qti-creator${NS}`, (e, mode) => {
                if (mode === TAB_COMMENTS) {
                    panel.refresh();
                }
            });

            plugin.store = store;
            plugin.panel = panel;
            plugin.updateCountLabel = updateCountLabel;

            if (itemUri) {
                store.load().catch(_.noop);
            }
        },

        /**
         * @returns {void}
         */
        render() {
            if (typeof this.updateCountLabel === 'function') {
                this.updateCountLabel();
            }
            if (this.panel && typeof this.panel.render === 'function') {
                this.panel.render();
            }
        },

        /**
         * @returns {void}
         */
        destroy() {
            $(document).off(NS);
            if (this.store) {
                this.store.off(NS);
            }
            if (this.panel) {
                this.panel.destroy();
            }
        }
    });
});
