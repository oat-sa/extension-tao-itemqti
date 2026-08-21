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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

/**
 * Item Comments panel plugin.
 * Binds the comments pane under the shared Style | Properties | Comments mode tabs.
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
    'taoItems/comments/itemCommentsStore',
    'tpl!taoQtiItem/qtiCreator/tpl/itemComments/panel',
    'tpl!taoQtiItem/qtiCreator/tpl/itemComments/comment',
    'css!taoQtiItemCss/item-comments.css'
], function ($, _, __, pluginFactory, itemCommentsStoreFactory, panelTpl, commentTpl) {
    'use strict';

    const TAB_COMMENTS = 'comments';
    const NS = '.itemCommentsPlugin';

    /**
     * Format ISO timestamp for display (en-GB style close to mockup).
     * @param {string} iso
     * @returns {string}
     */
    function formatDisplayTime(iso) {
        if (!iso) {
            return '';
        }
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) {
            return iso;
        }
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
            .format(date)
            .replace(',', '');
    }

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

            const store = itemCommentsStoreFactory({ itemUri });
            const $modeTabs = $('#item-editor-item-mode-tabs');
            const $commentsTab = $modeTabs.find('[data-tab="comments"]');
            const $commentsHost = $('#sidebar-right-item-comments .item-comments-content-panel');
            const $panel = $(panelTpl());
            const $list = $panel.find('.item-comments-list');
            const $empty = $panel.find('.item-comments-empty');
            const $error = $panel.find('.item-comments-error');
            const $form = $panel.find('.item-comments-entry');
            const $input = $panel.find('.item-comments-input');
            const $submit = $panel.find('.item-comments-submit');
            let isFormLocked = false;

            $commentsHost.empty().append($panel);

            /**
             * @param {string} message
             */
            function showError(message) {
                $error.text(message).prop('hidden', false);
            }

            function clearError() {
                $error.text('').prop('hidden', true);
            }

            function scrollToNewest() {
                const list = $list.get(0);
                if (list) {
                    list.scrollTop = list.scrollHeight;
                }
            }

            function updateCountLabel() {
                const label = $commentsTab.data('label') || __('Comments');
                $commentsTab.find('.tab-label').text(label);
                $commentsTab.attr('title', label).attr('aria-label', label);
            }

            /**
             * @param {string} draft
             * @returns {boolean}
             */
            function hasNonWhitespaceDraft(draft) {
                return /\S/.test(draft || '');
            }

            /**
             * @param {boolean} disabled
             */
            function setFormDisabled(disabled) {
                isFormLocked = disabled;
                $form.find(':input').prop('disabled', disabled);
            }

            function updateSubmitState() {
                if (isFormLocked) {
                    return;
                }

                $submit.prop('disabled', !hasNonWhitespaceDraft(store.getDraft()) || store.isSubmitting());
            }

            function renderComments() {
                const comments = store.getComments();
                $list.empty();

                if (!comments.length) {
                    $empty.prop('hidden', false);
                } else {
                    $empty.prop('hidden', true);
                    comments.forEach(comment => {
                        $list.append(
                            commentTpl({
                                id: comment.id,
                                authorLabel: comment.authorLabel,
                                createdAt: comment.createdAt,
                                displayTime: formatDisplayTime(comment.createdAt),
                                body: comment.body
                            })
                        );
                    });
                }

                $input.val(store.getDraft());
                updateSubmitState();
                updateCountLabel();
            }

            store
                .on('loaded countchange submitted', () => {
                    renderComments();
                    updateCountLabel();
                })
                .on('draftchange', draft => {
                    if (isFormLocked) {
                        return;
                    }

                    $submit.prop('disabled', !hasNonWhitespaceDraft(draft) || store.isSubmitting());
                })
                .on('submitFailed', () => {
                    showError(__('The comment was not saved.'));
                })
                .on('error', () => {
                    showError(__('Unable to load comments.'));
                })
                .on('submitted', () => {
                    clearError();
                    scrollToNewest();
                });

            $input.on(`input${NS}`, () => {
                store.setDraft($input.val());
            });

            $form.on(`submit${NS}`, e => {
                e.preventDefault();
                if ($submit.prop('disabled') || isFormLocked) {
                    return;
                }

                setFormDisabled(true);

                store
                    .submit()
                    .then(() => {
                        $input.val('');
                    })
                    .catch(_.noop)
                    .then(() => {
                        setFormDisabled(false);
                        updateSubmitState();
                    });
            });

            $(document).on(`itemsidebarmodechange.qti-creator${NS}`, (e, mode) => {
                if (mode === TAB_COMMENTS) {
                    renderComments();
                    scrollToNewest();
                    store.load().catch(_.noop);
                }
            });

            plugin.store = store;
            plugin.$form = $form;
            plugin.$input = $input;
            plugin.$panel = $panel;
            plugin.updateCountLabel = updateCountLabel;
            plugin.renderComments = renderComments;

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
        },

        /**
         * @returns {void}
         */
        destroy() {
            $(document).off(NS);
            if (this.$form) {
                this.$form.off(NS);
            }
            if (this.$input) {
                this.$input.off(NS);
            }
            if (this.store) {
                this.store.off('*');
            }
            if (this.$panel) {
                this.$panel.remove();
            }
        }
    });
});
