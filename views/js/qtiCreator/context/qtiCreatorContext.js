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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * This object provide a shared context for the Qti Creator elements (widgets, renderer, etc.)
 * It differs from the itemCreator in the sense that it should not be bound to the context of *items* creation,
 * but should be usable in a broader context of QTI authoring
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'core/eventifier',
    'core/promise',
    'taoQtiItem/qtiCreator/context/loader'
], function(_, eventifier, Promise, pluginLoader) {
    'use strict';

    /**
     * @returns {qtiCreatorContext}
     */
    return function qtiCreatorContextFactory() {

        const plugins = {};

        /**
         * Run a method in all plugins
         *
         * @param {String} method - the method to run
         * @returns {Promise} once that resolve when all plugins are done
         */
        const pluginRun = method => {
            const execStack = [];

            _.forEach(plugins, plugin => {
                if(_.isFunction(plugin[method])){
                    execStack.push(plugin[method]());
                }
            });

            return Promise.all(execStack);
        };

        /**
         * @typedef {Object} qtiCreatorContext
         */
        const qtiCreatorContext = {
            /**
             * @fires qtiCreatorContext#init
             * @returns {Promise}
             */
            init() {
                return pluginLoader
                    .load()
                    .then(() => {
                        const pluginFactories = pluginLoader.getPlugins();

                        // instantiate the plugins first
                        _.forEach(pluginFactories, pluginFactory => {
                            const plugin = pluginFactory(this);
                            plugins[plugin.getName()] = plugin;
                        });

                        // then initialise them
                        return pluginRun('init')
                            .then(() => {
                                /**
                                 * @event qtiCreatorContext#init the initialization is done
                                 */
                                this.trigger('init');
                            });
                    })
                    .catch(err => {
                        this.trigger('error', err);
                    });
            },

            /**
             * @fires qtiCreatorContext#destroy
             * @returns {Promise}
             */
            destroy() {
                return pluginRun('destroy')
                    .then(() => {
                        /**
                         * @event qtiCreatorContext#destroy the destroy process is done
                         */
                        this.trigger('destroy');
                    })
                    .catch(function(err) {
                        this.trigger('error', err);
                    });
            }
        };

        return eventifier(qtiCreatorContext);
    };

});
