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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'module',
    'core/promise'
], function (_, module, Promise) {
    'use strict';

    return {
        /**
         * Load user modules defined in the module config
         * @param {Array} [userModules] - manually specify user modules to load instead of getting them from the module config
         * @returns {Promise}
         */
        load: function load(userModules) {
            var config = module.config();

            if (! userModules || ! _.isArray(userModules)) {
                if (config && config.userModules && _.isArray(config.userModules)) {
                    userModules = config.userModules;
                } else {
                    userModules = [];
                }
            }
            return new Promise(function(resolve, reject) {
                require(
                    userModules,
                    function () {
                        _.forEach(arguments, function (dependency) {
                            if (dependency && _.isFunction(dependency.exec)) {
                                dependency.exec();
                            }
                        });
                        resolve();
                    },
                    function (err) {
                        reject(err.message);
                    }
                );
            });
        }
    };
});
