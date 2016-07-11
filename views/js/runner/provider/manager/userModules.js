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
    'module'
], function (_, module) {
    'use strict';

    var userModules = [],
        config = module.config();

    if (config && config.userModules && _.isArray(config.userModules)) {
        userModules = config.userModules;
    }

    return {
        load: function load() {
            return new Promise(function(resolve) {
                require(userModules, function () {
                    _.forEach(arguments, function (dependency) {
                        if (dependency && _.isFunction(dependency.exec)) {
                            dependency.exec();
                        }
                    });
                    resolve();
                });
            });
        },

        /**
         * allows overriding of requireJS's module. Used to maintain backwards compatibility and for unit testing
         * @param {Array} newUserModules - should contain modules path to load as strings
         */
        setUserModules: function setUserModules(newUserModules) {
            userModules = newUserModules;
        }
    };
});
