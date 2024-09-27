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
 * creator/index controller
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'module',
    'core/logger',
    'ui/feedback',
    'layout/loading-bar',
    'taoQtiItem/qtiCreator/itemCreator',
    'taoQtiItem/qtiCreator/editor/areaBroker',
    'taoQtiItem/qtiCreator/plugins/loader',
    'tpl!taoQtiItem/qtiCreator/tpl/layout/interactionsPanel',
    'tpl!taoQtiItem/qtiCreator/tpl/layout/itemPanel',
    'tpl!taoQtiItem/qtiCreator/tpl/layout/propertiesPanel'
], function (
    $,
    _,
    module,
    loggerFactory,
    feedback,
    loadingBar,
    itemCreatorFactory,
    areaBrokerFactory,
    pluginLoader,
    interactionsPanelTpl,
    itemPanelTpl,
    propertiesPanelTpl
) {
    'use strict';

    /**
     * Set up the areaBroker mapping from the actual DOM
     * @returns {areaBroker} already mapped
     */
    function loadAreaBroker(config) {
        const $container = $('#item-editor-scope');
        const $wrapper = $('#item-editor-wrapper', $container);
        const panels = [itemPanelTpl, propertiesPanelTpl];
        if (!config || !config.properties || !config.properties.translation) {
            panels.unshift(interactionsPanelTpl);
        }
        panels.forEach(panel => $wrapper.append(panel()));
        return areaBrokerFactory($container, {
            menu: $('.menu', $container),
            menuLeft: $('.menu-left', $container),
            menuRight: $('.menu-right', $container),
            contentCreatorPanel: $('#item-editor-panel', $container),
            editorBar: $('#item-editor-panel .item-editor-bar', $container),
            editorWrapper: $('#item-editor-wrapper', $container),
            title: $('#item-editor-panel .item-editor-bar h1', $container),
            toolbar: $('#item-editor-panel .item-editor-bar #toolbar-top', $container),
            interactionPanel: $('#item-editor-interaction-bar', $container),
            propertyPanel: $('#item-editor-item-widget-bar', $container),
            itemPanel: $('#item-editor-scroll-inner', $container),
            itemPropertyPanel: $('#sidebar-right-item-properties', $container),
            itemStylePanel: $('#item-style-editor-bar', $container),
            modalContainer: $('#modal-container', $container),
            elementPropertyPanel: $('#item-editor-body-element-property-bar .panel', $container)
        });
    }

    /**
     * The creator's controller
     */
    const indexController = {
        /**
         * The entrypoint
         */
        start() {
            //TODO move module config away from controllers
            const config = module.config();
            const logger = loggerFactory('controller/creator');

            /**
             * Report errors
             * @param {Error} err - the error to report
             */
            function reportError(err) {
                loadingBar.stop();

                logger.error(err);

                if (err instanceof Error) {
                    feedback().error(err.message);
                }
            }

            loadingBar.start();

            //load plugins dynamically
            if (config) {
                if (config.plugins) {
                    config.properties.allowCustomTemplate = config.plugins.some(
                        ({ name }) => name === 'xmlResponseProcessing'
                    );

                    _.forEach(config.plugins, plugin => {
                        if (plugin && plugin.module) {
                            pluginLoader.add(plugin);
                        }
                    });
                }

                if (config.contextPlugins) {
                    _.forEach(config.contextPlugins, plugin => {
                        if (plugin && plugin.module) {
                            if (plugin.exclude) {
                                pluginLoader.remove(plugin.module);
                            } else {
                                pluginLoader.add(plugin);
                            }
                        }
                    });
                }
            }

            //load the plugins
            pluginLoader
                .load()
                .then(() => {
                    //build a new item creator
                    itemCreatorFactory(config, loadAreaBroker(config), pluginLoader.getPlugins())
                        .on('error', reportError)
                        .on('success', message => feedback().success(message))
                        .on('init', function onInit() {
                            this.render();
                        })
                        .on('ready', () => loadingBar.stop())
                        .init();
                })
                .catch(reportError);
        }
    };

    return indexController;
});
