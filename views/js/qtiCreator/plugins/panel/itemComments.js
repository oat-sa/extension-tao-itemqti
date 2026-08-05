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
                                body: comment.body,
                                edited: !!comment.edited,
                                editable: !!comment.editable,
                                resolved: !!comment.resolved
                            })
                        );
                    });
                }

                $input.val(store.getDraft());
                $submit.prop('disabled', !store.hasDirtyDraft() || store.isSubmitting());
                updateCountLabel();
            }

            function closeMoreMenus($keep) {
                $list.find('.item-comment-more').each(function () {
                    const $more = $(this);
                    if ($keep && $more.is($keep)) {
                        return;
                    }
                    $more.find('.item-comment-more-menu').prop('hidden', true);
                    $more.find('.item-comment-more-toggle').attr('aria-expanded', 'false');
                });
            }

            function closeEditForms($keep) {
                $list.find('[data-role="edit-form"]').each(function () {
                    const $form = $(this);
                    if ($keep && $form.is($keep)) {
                        return;
                    }
                    const $article = $form.closest('.item-comment');
                    $form.prop('hidden', true);
                    $article.find('[data-role="body"]').prop('hidden', false);
                    $article.find('[data-role="actions"]').prop('hidden', false);
                });
            }

            store
                .on('loaded countchange submitted updated resolved deleted', () => {
                    renderComments();
                    updateCountLabel();
                })
                .on('draftchange', draft => {
                    $submit.prop('disabled', !/\S/.test(draft || ''));
                })
                .on('submitFailed', () => {
                    showError(__('The comment was not saved.'));
                })
                .on('updateFailed', () => {
                    showError(__('The comment was not updated.'));
                })
                .on('resolveFailed', () => {
                    showError(__('The comment was not resolved.'));
                })
                .on('deleteFailed', () => {
                    showError(__('The comment was not deleted.'));
                })
                .on('error', () => {
                    showError(__('Unable to load comments.'));
                })
                .on('submitted', () => {
                    clearError();
                    scrollToNewest();
                })
                .on('updated resolved deleted', () => {
                    clearError();
                });

            $input.on(`input${NS}`, () => {
                store.setDraft($input.val());
            });

            $form.on(`submit${NS}`, e => {
                e.preventDefault();
                if ($submit.prop('disabled')) {
                    return;
                }
                store
                    .submit()
                    .then(() => {
                        $input.val('');
                    })
                    .catch(_.noop);
            });

            $list.on(`click${NS}`, '.item-comment-more-toggle', e => {
                e.preventDefault();
                e.stopPropagation();
                const $toggle = $(e.currentTarget);
                const $more = $toggle.closest('.item-comment-more');
                const $menu = $more.find('.item-comment-more-menu');
                const willOpen = $menu.prop('hidden');
                closeMoreMenus(willOpen ? $more : null);
                $menu.prop('hidden', !willOpen);
                $toggle.attr('aria-expanded', willOpen ? 'true' : 'false');
            });

            $list.on(`click${NS}`, '.item-comment-edit', e => {
                e.preventDefault();
                const $button = $(e.currentTarget);
                const $article = $button.closest('.item-comment');
                const $editForm = $article.find('[data-role="edit-form"]');
                closeMoreMenus();
                closeEditForms($editForm);
                $article.find('[data-role="body"]').prop('hidden', true);
                $article.find('[data-role="actions"]').prop('hidden', true);
                $editForm.prop('hidden', false);
                $editForm.find('.item-comment-edit-input').trigger('focus');
            });

            $list.on(`click${NS}`, '.item-comment-cancel', e => {
                e.preventDefault();
                closeEditForms();
            });

            $list.on(`click${NS}`, '.item-comment-save', e => {
                e.preventDefault();
                const $button = $(e.currentTarget);
                const commentId = $button.data('comment-id');
                const $article = $button.closest('.item-comment');
                const body = $article.find('.item-comment-edit-input').val();
                $button.prop('disabled', true);
                store
                    .update(commentId, body)
                    .catch(_.noop)
                    .then(() => {
                        $button.prop('disabled', false);
                    });
            });

            $list.on(`click${NS}`, '.item-comment-resolve-link', e => {
                e.preventDefault();
                closeMoreMenus();
                const $link = $(e.currentTarget);
                if ($link.attr('aria-disabled') === 'true') {
                    return;
                }
                const commentId = $link.data('comment-id');
                const resolved = $link.data('action') === 'resolve';
                $link.attr('aria-disabled', 'true');
                store
                    .resolve(commentId, resolved)
                    .catch(_.noop)
                    .then(() => {
                        $link.attr('aria-disabled', 'false');
                    });
            });

            $list.on(`click${NS}`, '.item-comment-delete', e => {
                e.preventDefault();
                closeMoreMenus();
                const commentId = $(e.currentTarget).data('comment-id');
                store.delete(commentId).catch(_.noop);
            });

            $(document).on(`click${NS}`, () => {
                closeMoreMenus();
            });

            $(document).on(`keydown${NS}`, e => {
                if (e.key === 'Escape') {
                    closeMoreMenus();
                    closeEditForms();
                }
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
            plugin.$list = $list;
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
            if (this.$list) {
                this.$list.off(NS);
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
