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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */
define([], function () {
    'use strict';

    const loggers = {};

    function createLogger() {
        const called = {
            fatal: 0,
            error: 0,
            warn: 0,
            info: 0,
            debug: 0,
            trace: 0
        };
        const logger = {
            reset() {
                Object.keys(called).forEach(key => called[key] = 0);
                return this;
            },
            wasCalled(type) {
                return !!called[type];
            }
        };

        Object.keys(called).forEach(key => {
            logger[key] = () => {
                called[key]++;
                return logger;
            };
        });
        return logger;
    }

    return function loggerFactory(name) {
        if (!loggers[name]) {
            loggers[name] = createLogger();
        }
        return loggers[name];
    };
});
