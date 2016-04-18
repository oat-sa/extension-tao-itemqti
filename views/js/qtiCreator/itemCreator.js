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
    'lodash',
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

], function(_, module, eventifier, Promise,
            ciRegistry, icRegistry, itemLoader,
            creatorRenderer, commonRenderer, xincludeRenderer,
            interactionPanel, propertiesPanel){

    'use strict';

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

    var loadItem = function loadItem(uri, label){
        return new Promise(function(resolve, reject){
            itemLoader.loadItem({uri : uri, label : label}, function(item){
                if(!item){
                    reject(new Error('Unable to load the item'));
                }

                //set reference to item object
                //$editorScope.data('item', item);

                //fires event itemloaded
                //$doc.trigger('itemloaded.qticreator', [item]);

                //set useful data :
                item.data('uri', uri);
                resolve(item);
            });
        });
    };

    var itemCreatorFactory = function itemCreatorFactory(config, areaBroker){

        //TODO check config

        var itemCreator = eventifier({



            init: function init(){
                var self = this;



                Promise.all([
                    register(ciRegistry, config.interactions),
                    register(icRegistry, config.infoControls),
                    loadItem(config.properties.uri, config.properties.label)
                ]).then(function(results){
                    var customInterations,
                        infoControls;

                    if(_.isArray(results) && results.length === 3){

                        //initialize the interaction panel
                        interactionPanel(areaBroker.getInteractionPanelArea(), results[0] || {});

                        infoControls      = results[1];
                        if(_.isObject(results[2])){
                            self.trigger('init', results[2]);
                            self.render(results[2]);
                        } else {
                            self.trigger('error', new Error('Unable to load the item ' + config.properties.label));
                        }
                    }
                }).catch(function(err){
                    self.trigger('error', err);
                });
            },


            render : function render(item){
                var self = this;

                if(!item || !_.isFunction(item.getUsedClasses)){
                    return this.trigger('error', new Error('We need an item to render.'));
                }

                //configure commonRenderer for the preview
                commonRenderer.setOption('baseUrl', config.properties.baseUrl);
                commonRenderer.setContext(areaBroker.getItemPanelArea());

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

                            widget = item.data('widget');
                            _.each(item.getComposingElements(), function(element){
                                if(element.qtiClass === 'include'){
                                    xincludeRenderer.render(element.data('widget'), config.properties.baseUrl);
                                }
                            });

                            propertiesPanel(areaBroker.getPropertyPanelArea(), widget, config.properties);

                            //editor.initGui(widget, configProperties);


                            //set reference to item widget object
                            //$editorScope.data('widget', item);

                            //fires event itemloaded
                            //$doc.trigger('widgetloaded.qticreator', [widget]);

                            //init event listeners:
                            //event.initElementToWidgetListeners();
                            //
                            self.trigger('render');
                        })
                        .catch(function(err){
                            self.trigger('error', err);
                        });

                    }, item.getUsedClasses());
            }
        });


        return itemCreator;
    };

    return itemCreatorFactory;
});
