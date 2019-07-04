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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'core/eventifier',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/context/qtiCreatorContext'
], function ($, _, eventifier, itemLoader, qtiCreatorContextFactory) {
    'use strict';

    const loadItem = (uri, label, itemDataUrl) => new Promise((resolve, reject) => {
        itemLoader.loadItem({uri: uri, label: label, itemDataUrl: itemDataUrl}, item => {
            if (!item) {
                return reject(new Error('Unable to load the item'));
            }
            item.data('uri', uri);
            resolve(item);
        });
    });

    function itemCreatorFactory(config, areaBroker, pluginFactories) {

        const qtiCreatorContext = qtiCreatorContextFactory();
        const plugins = {};
        const pluginRun = method => {
            const execStack = [];

            _.forEach(plugins, plugin => {
                if (_.isFunction(plugin[method])) {
                    execStack.push(plugin[method]());
                }
            });

            return Promise.all(execStack);
        };

        if (!_.isPlainObject(config)) {
            throw new TypeError('The item creator configuration is required');
        }
        if (!config.properties || _.isEmpty(config.properties.uri) || _.isEmpty(config.properties.label) || _.isEmpty(config.properties.baseUrl)) {
            throw new TypeError('The creator configuration must contains the required properties triples: uri, label and baseUrl');
        }
        if (!areaBroker) {
            throw new TypeError('Without an areaBroker there are no chance to see something you know');
        }

        const itemCreator = eventifier({
            init() {
                _.forEach(pluginFactories, pluginFactory => {
                    const plugin = pluginFactory(this, areaBroker);
                    plugins[plugin.getName()] = plugin;
                });

                loadItem(config.properties.uri, config.properties.label, config.properties.itemDataUrl)
                    .then(item => this.item = item)
                    .then(() => pluginRun('init'))
                    .then(() => {
                        this.trigger('init', this.getItem());
                        qtiCreatorContext
                            .spread(this, 'error')
                            .init();
                    })
                    .catch(err => this.trigger('error', err));
            },

            render() {
                config.qtiCreatorContext = qtiCreatorContext;

                pluginRun('render')
                    .then(() => this.trigger('render'))
                    .then(() => this.trigger('ready'))
                    .catch(err => this.trigger('error', err));

                return this;
            },

            destroy() {
                pluginRun('destroy')
                    .then(() => qtiCreatorContext.destroy())
                    .then(() => this.trigger('destroy'))
                    .catch(err => this.trigger('error', err));
                return this;
            },

            getItem() {
                return this.item;
            },

            getConfig() {
                return config;
            }
        });

        return itemCreator;
    }

    return itemCreatorFactory;
});
