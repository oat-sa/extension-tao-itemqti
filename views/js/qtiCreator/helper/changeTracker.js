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
 * Copyright (c) 2019-2023 Open Assessment Technologies SA ;
 */
/**
 * Track the change within the itemCreator
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'context',
    'lib/uuid',
    'core/eventifier',
    'ui/dialog',
    'taoQtiItem/qtiCreator/helper/saveChanges'
], function ($, _, __, context, uuid, eventifier, dialog, saveChanges) {
    'use strict';

    /**
     * The messages asking to save
     */
    const messages = {
        preview: __('The item needs to be saved before it can be previewed'),
        leave: __('The item has unsaved changes, are you sure you want to leave ?'),
        exit: __('The item has unsaved changes, would you like to save it ?')
    };

    const DISABLE_FIGURE_WIDGET = context.featureFlags && context.featureFlags.FEATURE_FLAG_DISABLE_FIGURE_WIDGET;

    /**
     *
     * @param {HTMLElement} container
     * @param {itemCreator} itemCreator
     * @param {String} [wrapperSelector]
     * @returns {changeTracker}
     * @fires stylechange when the item's style changed
     */
    function changeTrackerFactory(container, itemCreator, wrapperSelector = 'body') {
        let changeTracker;

        // internal namespace for global registered events
        const eventNS = `.ct-${uuid(8, 16)}`;

        // keep the value of the item before changes
        let originalItem;

        // does the item styles have changed
        let styleChanges = false;

        // are we in the middle of the confirm process ?
        let asking = false;

        // take care of the change in item style
        const onStyleChange = (e, detail) => {
            if (!detail || !detail.initializing) {
                styleChanges = true;
                /**
                 * Change in item style
                 * @event stylechange
                 */
                changeTracker.trigger('stylechange');
            }
        };

        /**
         * @typedef {Object} changeTracker
         */
        changeTracker = eventifier({
            /**
             * Initialized the changed state
             * @returns {changeTracker}
             */
            init() {
                originalItem = this.getSerializedItem();
                styleChanges = false;

                return this;
            },

            /**
             * Installs the change tracker, registers listeners
             * @returns {changeTracker}
             */
            install() {
                this.init();
                asking = false;

                // track style changes
                $(window.document)
                    .one('customcssloaded.styleeditor', () => this.init())
                    .on('stylechange.qti-creator', onStyleChange);

                // add a browser popup to prevent leaving the browser
                $(window)
                    .on(`beforeunload${eventNS}`, () => {
                        if (!asking && this.hasChanged()) {
                            return messages.leave;
                        }
                    })
                    // since we don't know how to prevent history based events, we just stop the handling
                    .on('popstate', () => this.uninstall());

                // every click outside the authoring (except feedback message)
                $(wrapperSelector).on(`click${eventNS}`, e => {
                    if (
                        e.target.isConnected && // check if the target is still in the DOM, if not there is no need to check further since parent will be null
                        !$.contains(container, e.target) &&
                        !$(e.target).parents('#feedback-box').length &&
                        !$(e.target).parents('.outcome-container').length &&
                        (DISABLE_FIGURE_WIDGET || !$(e.target).parents('.media-alignment').length) &&
                        !$(e.target).hasClass('icon-close') &&
                        this.hasChanged()
                    ) {
                        e.stopImmediatePropagation();
                        e.preventDefault();

                        this.confirmBefore('exit')
                            .then(() => {
                                // @todo improve this:
                                // When clicking outside, and accepting the confirm dialog (one way or another),
                                // the tracker is disabled, and changes won't be detected anymore. So it could be
                                // an issue if the click was not triggering any move.
                                this.uninstall();
                                e.target.click();
                            })
                            //do nothing but prevent uncaught error
                            .catch(() => {});
                    }
                });

                itemCreator
                    .on(`ready${eventNS} saved${eventNS}`, () => this.init())
                    .before(`exit${eventNS}`, () => this.confirmBefore('exit').then(() => this.uninstall()))
                    .before(`preview${eventNS}`, () => this.confirmBefore('preview'));

                return this;
            },

            /**
             * Uninstalls the change tracker, unregisters listeners
             * @returns {changeTracker}
             */
            uninstall() {
                // remove all global handlers
                $(window.document).off(eventNS).off('stylechange.qti-creator', onStyleChange);
                $(window).off(eventNS);
                $(wrapperSelector).off(eventNS);
                itemCreator.off(eventNS);

                return this;
            },

            /**
             * Displays a confirmation dialog,
             * The "ok" button will save and resolve.
             * The "cancel" button will reject.
             *
             * @param {String} message - the confirm message to display
             * @returns {Promise} resolves once saved
             */
            confirmBefore(message) {
                // if a key is given load the related message
                message = messages[message] || message;

                return new Promise((resolve, reject) => {
                    if (asking) {
                        return reject();
                    }

                    if (!this.hasChanged()) {
                        return resolve();
                    }

                    asking = true;

                    const confirmDlg = dialog({
                        message: message,
                        buttons: [
                            {
                                id: 'dontsave',
                                type: 'regular',
                                label: __("Don't save"),
                                close: true
                            },
                            {
                                id: 'cancel',
                                type: 'regular',
                                label: __('Cancel'),
                                close: true
                            },
                            {
                                id: 'save',
                                type: 'info',
                                label: __('Save'),
                                close: true
                            }
                        ],
                        autoRender: true,
                        autoDestroy: true,
                        onSaveBtn: () => saveChanges(itemCreator).then(resolve).catch(reject),
                        onDontsaveBtn: resolve,
                        onCancelBtn: () => {
                            confirmDlg.hide();
                            reject({ cancel: true });
                        }
                    }).on('closed.modal', () => (asking = false));
                });
            },

            /**
             * Does the item have changed?
             * @returns {Boolean}
             */
            hasChanged() {
                if (styleChanges) {
                    return true;
                }
                const currentItem = this.getSerializedItem();
                return originalItem !== currentItem || (null === currentItem && null === originalItem);
            },

            /**
             * Get a string representation of the current item, used for comparison
             * @returns {String} the item
             */
            getSerializedItem() {
                let serialized = '';
                try {
                    // create a string from the item content
                    serialized = JSON.stringify(itemCreator.getItem().toArray());

                    // sometimes the creator strip spaces between tags, so we do the same
                    serialized = serialized.replace(/ {2,}/g, ' ');
                } catch (err) {
                    serialized = null;
                }
                return serialized;
            }
        });

        return changeTracker.install();
    }

    return changeTrackerFactory;
});
