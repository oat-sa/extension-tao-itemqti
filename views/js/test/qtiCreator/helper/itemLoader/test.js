/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */

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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 */

define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/itemIdentifier',
    'taoQtiItem/qtiCreator/helper/languages',
    'core/dataProvider/request'
], function ($, _, itemLoader, itemIdentifier, languages, request) {
    'use strict';

    QUnit.module('qtiCreator/helper/itemLoader - identifier strategy', hooks => {
        let originalDefaultIdentifier;
        let originalUniqueNumericIdentifier;
        let originalGetList;
        let originalRequest;

        hooks.beforeEach(() => {
            originalDefaultIdentifier = itemIdentifier.defaultIdentifier;
            originalUniqueNumericIdentifier = itemIdentifier.uniqueNumericIdentifier;
            originalGetList = languages.getList;
            originalRequest = request;
        });

        hooks.afterEach(() => {
            itemIdentifier.defaultIdentifier = originalDefaultIdentifier;
            itemIdentifier.uniqueNumericIdentifier = originalUniqueNumericIdentifier;
            languages.getList = originalGetList;
            request = originalRequest;
        });

        QUnit.test(
            'uses defaultIdentifier when config.identifierGenerationStrategy is a valid URI with # fragment',
            assert => {
                assert.expect(5);
                const done = assert.async();

                // deterministic stubs
                const config = {
                    uri: 'fakeUri',
                    itemDataUrl: 'fakeUrl',
                    label: 'My label',
                    identifierGenerationStrategy: 'http://example.org/strategy#ITEM_ABC'
                };

                languages.getList = function () {
                    return Promise.resolve([{ code: 'en-US', label: 'English', orientation: 'ltr' }]);
                };

                request = function (url, data) {
                    assert.strictEqual(url, config.itemDataUrl, 'request called with config.itemDataUrl');
                    assert.deepEqual(data, { uri: config.uri }, 'request called with config.uri');
                    return Promise.resolve({ itemData: { identifier: 'ignored' } });
                };

                itemIdentifier.defaultIdentifier = function (identifierStrategy, qtiIdentifier) {
                    assert.ok(true, 'defaultIdentifier called');
                    assert.ok(!!qtiIdentifier, 'qtiIdentifier is passed');
                    assert.strictEqual(
                        identifierStrategy,
                        'http://example.org/strategy#ITEM_ABC',
                        'strategy passed through'
                    );
                    return 'ITEM_ABC';
                };

                itemIdentifier.uniqueNumericIdentifier = function () {
                    assert.ok(false, 'uniqueNumericIdentifier should not be used for valid strategy');
                    return 'SHOULD_NOT_HAPPEN';
                };

                itemLoader.loadItem(config, item => {
                    assert.strictEqual(
                        item.attr('identifier'),
                        'ITEM_ABC',
                        'Item id is set from defaultIdentifier result'
                    );
                    assert.strictEqual(item.attr('title'), 'My label', 'Item title is set from config.label');
                    done();
                });
            }
        );

        QUnit.test('falls back to uniqueNumericIdentifier when strategy is invalid (no # fragment)', assert => {
            assert.expect(4);
            const done = assert.async();

            itemIdentifier.defaultIdentifier = function () {
                assert.ok(false, 'defaultIdentifier should not be called for invalid strategy');
                return 'SHOULD_NOT_HAPPEN';
            };
            itemIdentifier.uniqueNumericIdentifier = function () {
                assert.ok(true, 'uniqueNumericIdentifier called');
                return '123456789';
            };

            itemLoader.loadItem(
                {
                    uri: 'fakeUri',
                    itemDataUrl: 'fakeUrl',
                    label: 'My label',
                    identifierGenerationStrategy: 'http://example.org/strategy/ITEM_ABC'
                },
                item => {
                    assert.strictEqual(
                        item.attr('identifier'),
                        '123456789',
                        'Item id is set from uniqueNumericIdentifier result'
                    );
                    assert.strictEqual(item.attr('title'), 'My label', 'Item title is set from config.label');
                    done();
                }
            );
        });

        QUnit.test('falls back to uniqueNumericIdentifier when strategy is missing/undefined', assert => {
            assert.expect(4);
            const done = assert.async();

            itemIdentifier.defaultIdentifier = function () {
                assert.ok(false, 'defaultIdentifier should not be called when strategy is missing');
                return 'SHOULD_NOT_HAPPEN';
            };
            itemIdentifier.uniqueNumericIdentifier = function () {
                assert.ok(true, 'uniqueNumericIdentifier called');
                return '987654321';
            };

            itemLoader.loadItem(
                {
                    uri: 'fakeUri',
                    itemDataUrl: 'fakeUrl',
                    label: 'My label'
                },
                item => {
                    assert.strictEqual(
                        item.attr('identifier'),
                        '987654321',
                        'Item id is set from uniqueNumericIdentifier result'
                    );
                    assert.strictEqual(item.attr('title'), 'My label', 'Item title is set from config.label');
                    done();
                }
            );
        });
    });
});
