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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'module',
    'core/eventifier',
    'core/promise',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiCreator/editor/infoControlRegistry',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/commonRenderer', //for read-only element : preview + xinclude
    'taoQtiItem/qtiCreator/helper/xincludeRenderer',
    'taoQtiItem/qtiCreator/editor/interactionsPanel',
    'taoQtiItem/qtiCreator/editor/propertiesPanel',
    'taoQtiItem/qtiCreator/editor/editorSizer',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor'

], function($, _, __, module, eventifier, Promise,
            ciRegistry, icRegistry, itemLoader,
            creatorRenderer, commonRenderer, xincludeRenderer,
            interactionPanel, propertiesPanel, editorSizer,
            eventHelper, styleEditor){
    'use strict';


    /**
     * Register QTI portable elements
     * @param {Object} registry
     * @param {Array} elements - the elements to register
     * @returns {Promise}
     */
    var register = function register(registry, elements){
        if(!_.isArray(elements) || elements.length <= 0){
            return Promise.resolve();
        }
        return new Promise(function(resolve){
            if(registry && _.isFunction(registry.register)){
                registry.register(elements);
                return registry.loadAll(resolve);
            }
            return resolve();
        });
    };

    /**
     * Load an item
     * @param {String} uri - the item URI
     * @param {String} label - the item label
     * @returns {Promise} that resolve with the loaded item model
     */
    var loadItem = function loadItem(uri, label){
        return new Promise(function(resolve, reject){
            itemLoader.loadItem({uri : uri, label : label}, function(item){
                if(!item){
                    reject(new Error('Unable to load the item'));
                }

                //fires event itemloaded
                //
                //?? seems unused
                $(document).trigger('itemloaded.qticreator', [item]);

                //set useful data :
                item.data('uri', uri);
                resolve(item);
            });
        });
    };

    var itemCreatorFactory = function itemCreatorFactory(config, areaBroker, pluginFactories){

        var itemCreator;
        var plugins = {};

        /**
         * Run a method in all plugins
         *
         * @param {String} method - the method to run
         * @returns {Promise} once that resolve when all plugins are done
         */
        var pluginRun =  function pluginRun(method){
            var execStack = [];

            _.forEach(plugins, function (plugin){
                if(_.isFunction(plugin[method])){
                    execStack.push(plugin[method]());
                }
            });

            return Promise.all(execStack);
        };

        if(!_.isPlainObject(config)){
            throw new TypeError('The item creator configuration is required');
        }
        if(!config.properties || _.isEmpty(config.properties.uri) || _.isEmpty(config.properties.label) || _.isEmpty(config.properties.baseUrl)){
            throw new TypeError('The creator configuration must contains the required properties triples: uri, label and baseUrl');
        }
        if(!areaBroker){
            throw new TypeError('Without an areaBroker there are no chance to see something you know');
        }

        itemCreator = eventifier({

            init: function init(){
                var self = this;

                //instantiate the plugins first
                _.forEach(pluginFactories, function(pluginFactory, pluginName){
                    var plugin = pluginFactory(self, areaBroker);
                    plugins[plugin.getName()] = plugin;
                });


                //bind behavior events
                this.on('save', function(){
                    var item = this.getItem();
                    var itemWidget = item.data('widget');

                    Promise.all([
                        itemWidget.save(),
                        styleEditor.save()
                    ]).then(function(){
                        self.trigger('success', __('Your item has been saved'));
                        self.trigger('saved');
                    }).catch(function(err){
                        self.trigger('error', err);
                    });
                });

                //performs the loadings in parrallel
                Promise.all([
                    register(ciRegistry, config.interactions),
                    register(icRegistry, config.infoControls),
                    loadItem(config.properties.uri, config.properties.label)
                ]).then(function(results){

                    if(_.isArray(results) && results.length === 3){

                        self.customInterations = results[0] || {};
                        self.infoControls      = results[1] || {};
                        if(! _.isObject(results[2])){
                            self.trigger('error', new Error('Unable to load the item ' + config.properties.label));
                            return;
                        }

                        self.item = results[2];

                        //initialize all the plugins
                        return pluginRun('init').then(function(){
                            self.trigger('init', self.item);
                            self.render();
                        });

                    }
                }).catch(function(err){
                    self.trigger('error', err);
                });
            },


            render : function render(){
                var self = this;
                var item = this.getItem();

                if(!item || !_.isFunction(item.getUsedClasses)){
                    return this.trigger('error', new Error('We need an item to render.'));
                }

                //configure commonRenderer for the preview
                commonRenderer.setOption('baseUrl', config.properties.baseUrl);
                commonRenderer.setContext(areaBroker.getItemPanelArea());

                interactionPanel(areaBroker.getInteractionPanelArea(), self.customInterations);

                creatorRenderer
                    .get(true, config)
                    .setOptions(config.properties)
                    .load(function(){
                        var widget;

                        //set renderer
                        item.setRenderer(this);

                        //render item (body only) into the "drop-area"
                        areaBroker.getItemPanelArea().append(item.render());

                        //"post-render it" to initialize the widget
                        Promise
                         .all(item.postRender(_.clone(config.properties)))
                         .then(function(){

                            //set reference to item widget object
                            areaBroker.getContainer().data('widget', item);

                            widget = item.data('widget');
                            _.each(item.getComposingElements(), function(element){
                                if(element.qtiClass === 'include'){
                                    xincludeRenderer.render(element.data('widget'), config.properties.baseUrl);
                                }
                            });

                            propertiesPanel(areaBroker.getPropertyPanelArea(), widget, config.properties);


                            editorSizer();

                            //init event listeners:
                            eventHelper.initElementToWidgetListeners();

                            return pluginRun('render').then(function(){
                                self.trigger('render');
                            });
                        })
                        .catch(function(err){
                            self.trigger('error', err);
                        });

                    }, item.getUsedClasses());
            },

            destroy : function destroy(){

            },

            getItem : function getItem(){
                return this.item;
            },

            getConfig : function getConfig(){
                return config;
            }

        });


        return itemCreator;
    };

    return itemCreatorFactory;
});
