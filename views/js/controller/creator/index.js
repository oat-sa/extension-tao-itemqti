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


/**
 * creator/index controller
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'module',
    'core/logger',
    'core/promise',
    'ui/feedback',
    'layout/loading-bar',
    'taoQtiItem/qtiCreator/itemCreator',
    'taoQtiItem/qtiCreator/editor/areaBroker',
    'taoQtiItem/qtiCreator/plugins/loader'
], function($, _, module, loggerFactory, Promise, feedback, loadingBar, itemCreatorFactory, areaBrokerFactory, pluginLoader){
    'use strict';

    /**
     * Set up the areaBroker mapping from the actual DOM
     * @returns {areaBroker} already mapped
     */
    var loadAreaBroker = function loadAreaBroker(){
        var $container = $('#item-editor-scope');
        return areaBrokerFactory($container, {
            'menu':                 $('.menu', $container),
            'menuLeft':             $('.menu-left', $container),
            'menuRight':            $('.menu-right', $container),
            'contentCreatorPanel':  $('#item-editor-panel', $container),
            'editorBar':            $('#item-editor-panel .item-editor-bar', $container),
            'title':                $('#item-editor-panel .item-editor-bar h1', $container),
            'toolbar':              $('#item-editor-panel .item-editor-bar #toolbar-top', $container),
            'interactionPanel':     $('#item-editor-interaction-bar', $container),
            'propertyPanel':        $('#item-editor-item-widget-bar', $container),
            'itemPanel':            $('#item-editor-scroll-inner', $container),
            'itemPropertyPanel':    $('#sidebar-right-item-properties', $container),
            'itemStylePanel':       $('#item-style-editor-bar', $container),
            'modalContainer':       $('#modal-container', $container),
            'elementPropertyPanel': $('#item-editor-body-element-property-bar .panel', $container)
        });
    };

    /**
     * The creator's controller
     */
    var indexController = {

        /**
         * The entrypoint
         */
        start : function start(){

            //TODO move module config away from controllers
            var config = module.config();

            var logger = loggerFactory('controller/creator');

            /**
             * Report errors
             * @param {Error} err - the error to report
             */
            var reportError = function reportError(err){
                loadingBar.stop();

                logger.error(err);

                if(err instanceof Error){
                    feedback().error(err.message);
                }
            };

            loadingBar.start();

            //load plugins dynamically
            if (config) {
                if(config.plugins){
                    _.forEach(config.plugins, function (plugin) {
                        if(plugin && plugin.module){
                            pluginLoader.add(plugin);
                        }
                    });
                }
                if(config.contextPlugins){
                    _.forEach(config.contextPlugins, function (plugin) {
                        if(plugin && plugin.module){
                            if(plugin.exclude){
                                pluginLoader.remove(plugin.module);
                            } else {
                                pluginLoader.add(plugin);
                            }
                        }
                    });
                }
            }

            //load the plugins
            pluginLoader.load().then(function(){

                //build a new item creator
                itemCreatorFactory(config, loadAreaBroker(), pluginLoader.getPlugins())
                    .on('error', reportError)
                    .on('success', function(message){
                        feedback().success(message);
                    })
                    .on('init', function(){
                        this.render();
                    })
                    .on('ready', function(){
                        loadingBar.stop();
                    })
                    .init();
            })
            .catch(reportError);
        }
    };

    return indexController;
});

