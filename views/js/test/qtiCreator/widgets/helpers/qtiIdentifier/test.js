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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define([], function () {
    'use strict';

    const MODULE_ID = 'taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier';

    function loadWithConfig(moduleConfig, callback) {
        require.undef(MODULE_ID);
        require.config({
            config: {
                [MODULE_ID]: moduleConfig
            }
        });
        require([MODULE_ID], callback);
    }

    QUnit.module('qtiIdentifier maxQtiIdLength', {
        afterEach: function () {
            require.undef(MODULE_ID);
        }
    });

    QUnit.cases
        .init([
            { title: 'positive integer', config: { maxQtiIdLength: 64 }, expected: 64 },
            { title: 'missing', config: {}, expected: 32 },
            { title: 'null', config: { maxQtiIdLength: null }, expected: 32 },
            { title: 'zero', config: { maxQtiIdLength: 0 }, expected: 32 },
            { title: 'negative', config: { maxQtiIdLength: -1 }, expected: 32 },
            { title: 'non-numeric', config: { maxQtiIdLength: 'abc' }, expected: 32 },
            { title: 'infinite', config: { maxQtiIdLength: Infinity }, expected: 32 },
            { title: 'fractional', config: { maxQtiIdLength: 32.5 }, expected: 32 }
        ])
        .test('resolves maxQtiIdLength', function (data, assert) {
            const done = assert.async();

            loadWithConfig(data.config, function (qtiIdentifier) {
                assert.equal(
                    qtiIdentifier.maxQtiIdLength,
                    data.expected,
                    `maxQtiIdLength is ${data.expected} when config is ${data.title}`
                );
                done();
            });
        });
});
