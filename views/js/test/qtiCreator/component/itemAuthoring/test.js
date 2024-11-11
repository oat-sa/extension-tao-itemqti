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
 * Copyright (c) 2019-2024 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/component/itemAuthoring',
    'json!taoQtiItem/test/samples/json/space-shuttle.json',
    'lib/jquery.mockjax/jquery.mockjax'
], function ($, _, itemAuthoringFactory, itemData) {
    'use strict';

    function getInstance(fixture, config = {}) {
        return itemAuthoringFactory(fixture, config).on('error ready', function () {
            this.destroy();
        });
    }

    // Prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // Mock the item data query
    $.mockjax([
        {
            url: /mockItemEndpoint/,
            status: 200,
            responseText: {
                itemIdentifier: 'item-1',
                itemData: {
                    identifier: 'item-1',
                    content: {
                        type: 'qti',
                        data: itemData
                    },
                    baseUrl: '',
                    state: {}
                }
            }
        },
        {
            url: 'undefined/tao/Languages/index',
            responseText: {
                success: true,
                data: [
                    {
                        uri: 'http://www.tao.lu/ontologies/tao.rdf#langar-arb',
                        code: 'ar-arb',
                        label: 'arabic',
                        orientation: 'rtl'
                    },
                    {
                        uri: 'http://www.tao.lu/ontologies/tao.rdf#langckb-ir',
                        code: 'ckb-ir',
                        label: 'kurdish (iran)',
                        orientation: 'rtl'
                    }
                ]
            },
            status: 200
        }
    ]);

    QUnit.module('API');

    QUnit.test('module', assert => {
        const fixture = '#fixture-api';
        assert.expect(3);
        assert.equal(typeof itemAuthoringFactory, 'function', 'The module exposes a function');
        assert.equal(typeof getInstance(fixture), 'object', 'The factory produces an object');
        assert.notStrictEqual(
            getInstance(fixture),
            getInstance(fixture),
            'The factory provides a different object on each call'
        );
    });

    QUnit.cases
        .init([
            { title: 'init' },
            { title: 'destroy' },
            { title: 'render' },
            { title: 'setSize' },
            { title: 'show' },
            { title: 'hide' },
            { title: 'enable' },
            { title: 'disable' },
            { title: 'is' },
            { title: 'setState' },
            { title: 'getContainer' },
            { title: 'getElement' },
            { title: 'getTemplate' },
            { title: 'setTemplate' },
            { title: 'getConfig' }
        ])
        .test('inherited API', (data, assert) => {
            const instance = getInstance('#fixture-api');
            assert.expect(1);
            assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        });

    QUnit.cases
        .init([{ title: 'on' }, { title: 'off' }, { title: 'trigger' }, { title: 'spread' }])
        .test('event API ', (data, assert) => {
            const instance = getInstance('#fixture-api');
            assert.expect(1);
            assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        });

    QUnit.cases
        .init([{ title: 'getItemCreator' }, { title: 'getAreaBroker' }])
        .test('component API ', (data, assert) => {
            const instance = getInstance('#fixture-api');
            assert.expect(1);
            assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        });

    QUnit.module('Life cycle');

    QUnit.cases
        .init([
            {
                title: 'Missing config'
            },
            {
                title: 'Empty config',
                config: {}
            },
            {
                title: 'Empty properties',
                config: {
                    properties: {}
                }
            },
            {
                title: 'Missing item uri',
                config: {
                    properties: {
                        label: 'Item',
                        baseUrl: 'http://foo/bar/'
                    }
                }
            },
            {
                title: 'Missing label',
                config: {
                    properties: {
                        uri: 'http://item#rdf-123',
                        baseUrl: 'http://foo/bar/'
                    }
                }
            },
            {
                title: 'Missing base url',
                config: {
                    properties: {
                        uri: 'http://item#rdf-123',
                        label: 'Item'
                    }
                }
            },
            {
                title: 'Missing itemData url',
                config: {
                    properties: {
                        uri: 'http://item#rdf-123',
                        label: 'Item',
                        baseUrl: 'http://foo/bar/'
                    }
                }
            }
        ])
        .test('error ', (data, assert) => {
            const ready = assert.async();
            const $container = $('#fixture-error');

            assert.expect(1);

            const instance = itemAuthoringFactory($container, data.config)
                .on('error', () => {
                    assert.ok(true, 'An error has been emitted');
                    instance.destroy();
                    ready();
                })
                .on('ready', () => {
                    assert.ok(false, 'It should raise an error');
                    instance.destroy();
                    ready();
                });
        });

    QUnit.test('init', assert => {
        const ready = assert.async();
        const $container = $('#fixture-init');
        const config = {
            properties: {
                uri: 'http://item#rdf-123',
                label: 'Item',
                baseUrl: 'http://foo/bar/',
                itemDataUrl: '//mockItemEndpoint'
            }
        };
        const instance = itemAuthoringFactory($container, config);

        assert.expect(3);

        instance
            .after('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', function () {
                assert.notEqual(this.getAreaBroker(), null, 'The area broker should be available');
                assert.notEqual(this.getItemCreator(), null, 'The item creator should be available');
                this.destroy();
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: JSON.stringify(err)
                });
                ready();
            });
    });

    QUnit.test('render', assert => {
        const ready = assert.async();
        const $container = $('#fixture-render');
        const config = {
            properties: {
                uri: 'http://item#rdf-123',
                label: 'Item',
                baseUrl: 'http://foo/bar/',
                itemDataUrl: '//mockItemEndpoint'
            }
        };

        assert.expect(13);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = itemAuthoringFactory($container, config)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.notEqual(instance.getAreaBroker(), null, 'The area broker should be available');
                assert.notEqual(instance.getItemCreator(), null, 'The item creator should be available');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal(
                    $container.children().is('#item-editor-scope'),
                    true,
                    'The container contains the expected element'
                );
                assert.equal(
                    $container.find('#item-editor-scope .action-bar').length,
                    1,
                    'The component contains an action bar'
                );
                assert.equal(
                    $container.find('#item-editor-scope #item-editor-wrapper').length,
                    1,
                    'The component contains the item editor wrapper'
                );
                assert.equal(
                    $container.find('#item-editor-scope #item-editor-wrapper .item-editor-sidebar-wrapper.left-bar')
                        .length,
                    1,
                    'The component contains the interactions panel'
                );
                assert.equal(
                    $container.find('#item-editor-scope #item-editor-wrapper #item-editor-panel').length,
                    1,
                    'The component contains the item editor panel'
                );
                assert.equal(
                    $container.find('#item-editor-scope #item-editor-wrapper .item-editor-sidebar-wrapper.right-bar')
                        .length,
                    1,
                    'The component contains the properties panel'
                );
                assert.equal(
                    $container.find('#item-editor-scope #mediaManager').length,
                    1,
                    'The component contains the media manager'
                );
                assert.equal(
                    $container.find('#item-editor-scope #modal-container').length,
                    1,
                    'The component contains the modal container'
                );

                instance.destroy();
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: JSON.stringify(err)
                });
                ready();
            });
    });

    QUnit.test('destroy', assert => {
        const ready = assert.async();
        const $container = $('#fixture-destroy');
        const config = {
            properties: {
                uri: 'http://item#rdf-123',
                label: 'Item',
                baseUrl: 'http://foo/bar/',
                itemDataUrl: '//mockItemEndpoint'
            }
        };

        assert.expect(4);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = itemAuthoringFactory($container, config)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.equal($container.children().length, 1, 'The container contains an element');

                instance.destroy();
            })
            .after('destroy', () => {
                assert.equal($container.children().length, 0, 'The container is now empty');
                ready();
            })
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: JSON.stringify(err)
                });
                ready();
            });
    });
});
