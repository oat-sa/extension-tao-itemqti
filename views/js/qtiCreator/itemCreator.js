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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 * The item creator factory let's you create (guess what...)
 *
 * The item creator is "unfinished" because all parts aren't yet independent and the loading is anarchic,
 * however the item creator does a 1st job of wrapping the item creator's bootstrap.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/eventifier',
    'core/promise',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/icRegistry',
    'taoQtiItem/qtiCreator/context/qtiCreatorContext',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/commonRenderer', //for read-only element : preview + xinclude
    'taoQtiItem/qtiCreator/helper/xincludeRenderer',
    'taoQtiItem/qtiCreator/editor/interactionsPanel',
    'taoQtiItem/qtiCreator/editor/propertiesPanel',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor'
], function (
    $,
    _,
    __,
    eventifier,
    Promise,
    ciRegistry,
    icRegistry,
    qtiCreatorContextFactory,
    itemLoader,
    creatorRenderer,
    commonRenderer,
    xincludeRenderer,
    interactionPanel,
    propertiesPanel,
    eventHelper,
    styleEditor
) {
    'use strict';

    /**
     * Load an item
     * @param {String} uri - the item URI
     * @param {String} label - the item label
     * @param {String} itemDataUrl - the data url
     * @param {Boolean} perInteractionRp - per interaction processing enabled
     * @param {String} identifierGenerationStrategy - per interaction processing enabled
     *
     * @returns {Promise} that resolve with the loaded item model
     */
    function loadItem(uri, label, itemDataUrl, perInteractionRp, identifierGenerationStrategy) {
        return new Promise((resolve, reject) => {
            itemLoader.loadItem(
                { uri: uri, label: label, itemDataUrl: itemDataUrl, perInteractionRp, identifierGenerationStrategy },
                item => {
                    if (!item) {
                        reject(new Error('Unable to load the item'));
                    }

                    //set useful data :
                    item.data('uri', uri);
                    resolve(item);
                }
            );
        });
    }

    /**
     * load custom interactions registered from the custom interaction registry
     *
     * @param {Array} interactionsIds
     * @returns {Promise} that resolve with the loaded item model
     */
    function loadCustomInteractions(interactionsIds) {
        return ciRegistry.loadCreators({
            include: interactionsIds
        });
    }

    /**
     * load info controls registered from the info control registry
     *
     * @returns {Promise} that resolve with the loaded item model
     */
    function loadInfoControls() {
        return icRegistry.loadCreators();
    }

    /**
     * Build a new Item Creator
     * @param {Object} config - the creator's configuration
     * @param {String} config.properties.uri - the URI of the item to load (properties structure is kept as legacy)
     * @param {String} config.properties.label - the label of the item to load (properties structure is kept as legacy)
     * @param {String} config.properties.baseUrl - the base URL used to resolve assets
     * @param {Boolean} config.properties.perInteractionRp - per interaction response processing enabled
     * @param {String[]} [config.interactions] - the list of additional interactions to load (PCI)
     * @param {String[]} [config.infoControls] - the list of info controls to load (PIC)
     * @param {areaBroker} areaBroker - a mapped areaBroker
     * @param {Function[]} pluginFactories - the plugin's factory, ready to be instantiated
     * @returns {itemCreator} an event emitter object, with the usual lifecycle
     * @throws {TypeError}
     */
    const itemCreatorFactory = function itemCreatorFactory(config, areaBroker, pluginFactories) {
        let itemCreator;
        const qtiCreatorContext = qtiCreatorContextFactory();
        const plugins = {};

        /**
         * Run a method in all plugins
         *
         * @param {String} method - the method to run
         * @returns {Promise} once that resolve when all plugins are done
         */
        function pluginRun(method) {
            const execStack = [];

            _.forEach(plugins, plugin => {
                if (_.isFunction(plugin[method])) {
                    execStack.push(plugin[method]());
                }
            });

            return Promise.all(execStack);
        }

        //validate parameters
        if (!_.isPlainObject(config)) {
            throw new TypeError('The item creator configuration is required');
        }
        if (
            !config.properties ||
            _.isEmpty(config.properties.uri) ||
            _.isEmpty(config.properties.label) ||
            _.isEmpty(config.properties.baseUrl)
        ) {
            throw new TypeError(
                'The creator configuration must contains the required properties triples: uri, label and baseUrl'
            );
        }
        if (!areaBroker) {
            throw new TypeError('Without an areaBroker there are no chance to see something you know');
        }

        //factor the new itemCreator
        itemCreator = eventifier({
            //lifecycle

            /**
             * Initialize the item creator:
             *  - set up the registries for portable elements
             *  - load the item
             *  - instantiate and initialize the plugins
             *
             * @returns {itemCreator} chains
             * @fires itemCreator#init - once initialized
             * @fires itemCreator#error - if something went wrong
             */
            init() {
                //instantiate the plugins first
                _.forEach(pluginFactories, pluginFactory => {
                    const plugin = pluginFactory(this, areaBroker);
                    plugins[plugin.getName()] = plugin;
                });

                // quick-fix: clear all ghost events listeners
                // prevent ghosting of item states and other properties
                $(document).off('.qti-widget');

                /**
                 * Save the item on "save" event
                 * @event itemCreator#save
                 * @param {Boolean} [silent] - true to not trigger the success feedback
                 * @fires itemCreator#saved once the save is done
                 * @fires itemCreator#error
                 */
                this.on('save', silent => {
                    const item = this.getItem();
                    const itemWidget = item.data('widget');
                    const invalidElements = item.data('invalid') || {};

                    if (_.size(invalidElements)) {
                        const reasons = [];
                        Object.keys(invalidElements).forEach(serial => {
                            Object.keys(invalidElements[serial]).forEach(key => {
                                reasons.push(invalidElements[serial][key].message);
                            });
                        });
                        this.trigger('error', new Error(`${__('Item cannot be saved.')} (${reasons.join(', ')}).`));
                        return;
                    }
                    //do the save
                    return this.beforeSaveProcess
                        .then(() => styleEditor.save())
                        .then(() => itemWidget.save())
                        .then(() => {
                            if (!silent) {
                                this.trigger('success', __('Your item has been saved'));
                            }
                            this.trigger('saved');
                        })
                        .catch(err => this.trigger('error', err));
                });

                this.on('exit', () => {
                    $('.item-editor-item', areaBroker.getItemPanelArea()).empty();
                    styleEditor.cleanCache();
                });

                const usedCustomInteractionIds = [];
                loadItem(
                    config.properties.uri,
                    config.properties.label,
                    config.properties.itemDataUrl,
                    config.properties.perInteractionRp,
                    config.properties.identifierGenerationStrategy
                )
                    .then(item => {
                        if (!_.isObject(item)) {
                            this.trigger('error', new Error(`Unable to load the item ${config.properties.label}`));
                            return;
                        }

                        _.forEach(item.getComposingElements(), element => {
                            if (element.is('customInteraction')) {
                                usedCustomInteractionIds.push(element.typeIdentifier);
                            }
                        });

                        this.item = item;
                        return true;
                    })
                    .then(() => {
                        const item = this.item;

                        // To migrate old test items to use per interaction response processing
                        // missing outcome declarations should be added
                        if (
                            item.responseProcessing.processingType === 'templateDriven' &&
                            config.properties.perInteractionRp
                        ) {
                            const responseIdentifiers = Object.keys(item.responses || {}).map(
                                responseKey => item.responses[responseKey].attributes.identifier
                            );

                            _.forEach(responseIdentifiers, responseIdentifier => {
                                const outcomeIdentifier = `SCORE_${responseIdentifier}`;

                                if (!item.getOutcomeDeclaration(outcomeIdentifier)) {
                                    item.createOutcomeDeclaration({
                                        cardinality: 'single',
                                        baseType: 'float'
                                    }).attr('identifier', outcomeIdentifier);
                                }
                            });
                        }
                    })
                    .then(() => {
                        //load custom elements
                        return Promise.all([loadCustomInteractions(usedCustomInteractionIds), loadInfoControls()]);
                    })
                    .then(() => {
                        //initialize all the plugins
                        return pluginRun('init').then(() => {
                            /**
                             * @event itemCreator#init the initialization is done
                             * @param {Object} item - the loaded item
                             */
                            this.trigger('init', this.item);
                        });
                    })
                    .then(() => {
                        // forward context error
                        qtiCreatorContext.on('error', err => this.trigger('error', err));
                        // handle before save processes
                        this.beforeSaveProcess = Promise.resolve();
                        qtiCreatorContext.on('registerBeforeSaveProcess', beforeSaveProcess => {
                            this.beforeSaveProcess = Promise.all([this.beforeSaveProcess, beforeSaveProcess]);
                        });
                        return qtiCreatorContext.init();
                    })
                    .catch(err => this.trigger('error', err));

                return this;
            },

            /**
             * Renders the creator
             * Because of the actual structure, it also intialize some components (panels, toolbars, etc.).
             *
             * @returns {itemCreator} chains
             * @fires itemCreator#render - once everything is in place
             * @fires itemCreator#ready - once the creator's components' are ready (not yet reliable)
             * @fires itemCreator#error - if something went wrong
             */
            render() {
                const item = this.getItem();

                if (!item || !_.isFunction(item.getUsedClasses)) {
                    return this.trigger('error', new Error('We need an item to render.'));
                }

                //configure commonRenderer for the preview and initial qti element rendering
                commonRenderer.setContext(areaBroker.getItemPanelArea());
                commonRenderer.get(true, config).setOption('baseUrl', config.properties.baseUrl);

                // the interactions panel may not be rendered, and therefore not available
                const $interactionPanel = areaBroker.getInteractionPanelArea();
                if ($interactionPanel.length > 0) {
                    interactionPanel($interactionPanel);
                }

                //the renderers' widgets do not handle async yet, so we rely on this event
                //TODO ready should be triggered once every renderer's widget is done (ie. promisify everything)
                $(document).on('ready.qti-widget', (e, elt) => {
                    if (elt.element.qtiClass === 'assessmentItem') {
                        this.trigger('ready');
                    }
                });

                // pass an context reference to the renderer
                config.qtiCreatorContext = qtiCreatorContext;

                // listen to save requests from the DOM components (like the style editor)
                areaBroker.getContentCreatorPanelArea().on('save.qti-creator', () => this.trigger('save'));

                creatorRenderer
                    .get(true, config, areaBroker)
                    .setOptions(config.properties)
                    .load(function onLoad() {
                        let widget;

                        //set renderer
                        item.setRenderer(this);

                        //render item (body only) into the "drop-area"
                        areaBroker.getItemPanelArea().append(item.render());

                        //"post-render it" to initialize the widget
                        Promise.all(item.postRender(_.clone(config.properties)))
                            .then(() => {
                                //set reference to item widget object
                                areaBroker.getContainer().data('widget', item);

                                widget = item.data('widget');
                                _.forEach(item.getComposingElements(), element => {
                                    if (element.qtiClass === 'include') {
                                        xincludeRenderer.render(element.data('widget'), config.properties.baseUrl);
                                    }
                                });

                                propertiesPanel(areaBroker.getPropertyPanelArea(), widget, config.properties);

                                //init event listeners:
                                eventHelper.initElementToWidgetListeners();

                                return pluginRun('render').then(() => itemCreator.trigger('render'));
                            })
                            .catch(err => itemCreator.trigger('error', err));
                    }, item.getUsedClasses());

                return this;
            },

            /**
             * Clean up everything and destroy the item creator
             *
             * @returns {itemCreator} chains
             */
            destroy() {
                $(document).off('.qti-widget');

                pluginRun('destroy')
                    .then(() => qtiCreatorContext.destroy())
                    .then(() => {
                        areaBroker.getContentCreatorPanelArea().off('.qti-creator');
                        this.trigger('destroy');
                    })
                    .catch(err => {
                        this.trigger('error', err);
                    });
                return this;
            },

            //accessors

            /**
             * Give an access to the loaded item
             * @returns {Object} the item
             */
            getItem() {
                return this.item;
            },

            /**
             * Return if item is empty or not
             * @returns {Boolean} true/false
             */
            isEmpty() {
                const item = this.item.bdy.bdy;
                return item === '' || item === '\n    ';
            },

            /**
             * Give an access to the config
             * @returns {Object} the config
             */
            getConfig() {
                return config;
            }
        });

        return itemCreator;
    };

    return itemCreatorFactory;
});
