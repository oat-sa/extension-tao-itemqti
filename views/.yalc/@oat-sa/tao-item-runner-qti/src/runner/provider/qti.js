/*
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
 * Copyright (c) 2014-2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import $ from 'jquery';
import _ from 'lodash';
import __ from 'i18n';
import context from 'context';

import QtiLoader from 'taoQtiItem/qtiItem/core/Loader';
import Element from 'taoQtiItem/qtiItem/core/Element';
import ciRegistry from 'taoQtiItem/portableElementRegistry/ciRegistry';
import icRegistry from 'taoQtiItem/portableElementRegistry/icRegistry';
import sideLoadingProviderFactory from 'taoQtiItem/portableElementRegistry/provider/sideLoadingProviderFactory';
import rendererStrategies from 'taoQtiItem/runner/rendererStrategies';
import picManager from 'taoQtiItem/runner/provider/manager/picManager';
import userModules from 'taoQtiItem/runner/provider/manager/userModules';
import modalFeedbackHelper from 'taoQtiItem/qtiItem/helper/modalFeedback';
import 'taoItems/assets/manager';
import locale from 'util/locale';
import { getIsItemWritingModeVerticalRl } from 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting';
import { isSafari } from 'taoQtiItem/qtiCommonRenderer/helpers/userAgent';

var timeout = (context.timeout > 0 ? context.timeout + 1 : 30) * 1000;

/**
 * @exports taoQtiItem/runner/provider/qti
 */
var qtiItemRuntimeProvider = {
    init: function (itemData, done) {
        var self = this;

        var rendererOptions = _.merge(
            {
                assetManager: this.assetManager
            },
            _.pick(this.options, ['themes', 'preload', 'view'])
        );

        const Renderer = rendererStrategies(rendererOptions.view).getRenderer();

        this._renderer = new Renderer(rendererOptions);

        this._loader = new QtiLoader();

        this._loader.loadItemData(itemData, function (item) {
            if (!item) {
                return self.trigger('error', __('Unable to load item from the given data.'));
            }

            self._item = item;
            self._renderer.load(function () {
                self._item.setRenderer(this);

                done();
            }, this.getLoadedClasses());
        });
    },

    render: function (elt, done, options) {
        var self = this;

        options = _.defaults(options || {}, { state: {} });

        if (this._item) {
            try {
                //render item html
                elt.innerHTML = this._item.render({});

                //check rtl is set in body attributes of an item
                const bdyRTL = this._item.bdy && this._item.bdy.attr('dir') === 'rtl';

                // apply RTL layout according to item language
                const $item = $(elt).find('.qti-item');
                const $itemBody = $item.find('.qti-itemBody');
                const itemDir = $itemBody.attr('dir');
                if (!itemDir) {
                    if (bdyRTL) {
                        $itemBody.attr('dir', 'rtl');
                    } else {
                        const itemLang = $item.attr('lang');
                        $itemBody.attr('dir', locale.getLanguageDirection(itemLang));
                    }
                }
                if (isSafari()) {
                    $itemBody.attr('data-useragent-browser', 'safari');
                }
                if (getIsItemWritingModeVerticalRl()) {
                    document.body.classList.add('item-writing-mode-vertical-rl');
                }
            } catch (e) {
                self.trigger('error', __('Error in template rendering: %s', e.message));
            }
            try {
                if (options.portableElements) {
                    //if the option to directly load portable elements is provided, use only this one
                    if (options.portableElements.pci) {
                        ciRegistry.resetProviders();
                        ciRegistry.registerProvider(
                            'pciDeliveryProvider',
                            sideLoadingProviderFactory(options.portableElements.pci)
                        );
                    }
                    if (options.portableElements.pic) {
                        icRegistry.resetProviders();
                        icRegistry.registerProvider(
                            'picDeliveryProvider',
                            sideLoadingProviderFactory(options.portableElements.pic)
                        );
                    }
                }

                // Race between postRendering and timeout
                // postRendering waits for everything to be resolved or one reject
                Promise.race([
                    Promise.all(this._item.postRender(options)),
                    new Promise(function (resolve, reject) {
                        _.delay(
                            reject,
                            timeout,
                            new Error(
                                __(
                                    'It seems that there is an error during item loading. The error has been reported. The test will be paused.'
                                )
                            )
                        );
                    })
                ])
                    .then(function () {
                        $(elt)
                            .off('responseChange')
                            .on('responseChange', function () {
                                self.trigger('statechange', self.getState());
                                self.trigger('responsechange', self.getResponses());
                            })
                            .off('endattempt')
                            .on('endattempt', function (e, responseIdentifier) {
                                self.trigger('endattempt', responseIdentifier || e.originalEvent.detail);
                            })
                            .off('themechange')
                            .on('themechange', function (e, themeName) {
                                var themeLoader = self._renderer.getThemeLoader();
                                themeName = themeName || e.originalEvent.detail;
                                if (themeLoader) {
                                    themeLoader.change(themeName);
                                }
                            });

                        /**
                         * Lists the PIC provided by this item.
                         * @event qti#listpic
                         */
                        self.trigger('listpic', picManager.collection(self._item));

                        return userModules.load().then(done);
                    })
                    .catch(function (renderingError) {
                        done(); // in case of postRendering issue, we are also done
                        const errorMsg = renderingError instanceof Error ? renderingError.message : renderingError;
                        const error = new Error(__('Error in post rendering: %s', errorMsg));
                        error.unrecoverable = true;
                        self.trigger('error', error);
                    });
            } catch (err) {
                self.trigger('error', __('Error in post rendering: %s', err.message));
            }
        }
    },

    /**
     * Clean up stuffs
     */
    clear: function (elt, done) {
        var self = this;

        if (self._item) {
            Promise.all(
                Object.values(this._item.getComposingElements()).map(function (element) {
                    if (element && typeof element.clear === 'function') {
                        element.clear();
                    }
                })
            )
                .then(function () {
                    self._item.clear();

                    $(elt).off('responseChange').off('endattempt').off('themechange').off('feedback').empty();

                    if (self._renderer) {
                        self._renderer.unload();
                    }

                    document.body.classList.remove('item-writing-mode-vertical-rl');

                    self._item = null;
                })
                .then(done)
                .catch(function (err) {
                    self.trigger('error', __('Something went wrong while destroying an interaction: %s', err.message));
                });
        } else {
            done();
        }
    },

    /**
     * Get state implementation.
     * @returns {Object} that represents the state
     */
    getState: function getState() {
        var state = {};
        if (this._item) {
            //get the state from interactions
            _.forEach(this._item.getInteractions(), function (interaction) {
                state[interaction.attr('responseIdentifier')] = interaction.getState();
            });

            //get the state from infoControls
            _.forEach(this._item.getElements(), function (element) {
                if (Element.isA(element, 'infoControl') && element.attr('id')) {
                    state.pic = state.pic || {};
                    state.pic[element.attr('id')] = element.getState();
                }
            });
        }
        return state;
    },

    /**
     * Set state implementation.
     * @param {Object} state - the state
     */
    setState: function setState(state) {
        if (this._item && state) {
            //set interaction state
            _.forEach(this._item.getInteractions(), function (interaction) {
                var id = interaction.attr('responseIdentifier');
                if (id && state[id]) {
                    interaction.setState(state[id]);
                }
            });

            //set info control state
            if (state.pic) {
                _.forEach(this._item.getElements(), function (element) {
                    if (Element.isA(element, 'infoControl') && state.pic[element.attr('id')]) {
                        element.setState(state.pic[element.attr('id')]);
                    }
                });
            }
        }
    },

    getResponses: function () {
        var responses = {};
        if (this._item) {
            _.reduce(
                this._item.getInteractions(),
                function (res, interaction) {
                    responses[interaction.attr('responseIdentifier')] = interaction.getResponse();
                    return responses;
                },
                responses
            );
        }
        return responses;
    },

    renderFeedbacks: function (feedbacks, itemSession, done) {
        var self = this;

        var _renderer = self._item.getRenderer();
        var _loader = new QtiLoader(self._item);

        // loading feedbacks from response into the current item
        _loader.loadElements(feedbacks, function (item) {
            _renderer.load(function () {
                var renderingQueue = modalFeedbackHelper.getFeedbacks(item, itemSession);

                done(renderingQueue);
            }, this.getLoadedClasses());
        });
    }
};

export default qtiItemRuntimeProvider;
