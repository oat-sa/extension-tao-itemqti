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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoItems/runner/api/itemRunner',
    'taoQtiItem/runner/provider/qti',
    'taoQtiItem/portableElementRegistry/icRegistry',
    'json!taoQtiItem/test/samples/json/space-shuttle.json'
], function ($, _, itemRunner, qtiRuntimeProvider, icRegistry, itemData) {
    'use strict';

    var runner;
    var containerId = 'item-container';

    QUnit.module('Provider API');

    QUnit.test('module', function (assert) {
        assert.ok(typeof qtiRuntimeProvider !== 'undefined', 'The module exports something');
        assert.ok(typeof qtiRuntimeProvider === 'object', 'The module exports an object');
        assert.ok(
            typeof qtiRuntimeProvider.init === 'function' || typeof qtiRuntimeProvider.render === 'function',
            'The provider expose an init or a render method'
        );
    });

    QUnit.module('Register the provider', {
        afterEach: function (assert) {
            itemRunner.providers = null;
        }
    });

    QUnit.test('register the qti provider', function (assert) {
        assert.expect(4);

        assert.ok(typeof itemRunner.providers === 'undefined', 'the runner has no providers');

        itemRunner.register('qti', qtiRuntimeProvider);

        assert.ok(typeof itemRunner.providers === 'object', 'the runner has now providers');
        assert.ok(typeof itemRunner.providers.qti === 'object', 'the runner has now the qti providers');
        assert.equal(itemRunner.providers.qti, qtiRuntimeProvider, 'the runner has now the qti providers');
    });

    QUnit.module('Provider init', {
        afterEach: function (assert) {
            itemRunner.providers = null;
        }
    });

    QUnit.test('Item data loading', function (assert) {
        var ready = assert.async();
        assert.expect(2);

        itemRunner.register('qti', qtiRuntimeProvider);

        itemRunner('qti', itemData)
            .on('init', function () {
                assert.ok(typeof this._item === 'object', 'The item data is loaded and mapped to an object');
                assert.ok(typeof this._item.bdy === 'object', 'The item contains a body object');

                ready();
            })
            .init();
    });

    QUnit.test('Loading wrong data', function (assert) {
        var ready = assert.async();
        assert.expect(2);

        itemRunner.register('qti', qtiRuntimeProvider);

        itemRunner('qti', { foo: true })
            .on('error', function (message) {
                assert.ok(true, 'The provider triggers an error event');
                assert.ok(typeof message === 'string', 'The error is a string');

                ready();
            })
            .init();
    });

    QUnit.module('Provider render', {
        afterEach: function (assert) {
            //Reset the provides
            runner.clear();
            itemRunner.providers = null;
        }
    });

    QUnit.test('Item rendering', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(3);

        assert.ok(container instanceof HTMLElement, 'the item container exists');
        assert.equal(container.children.length, 0, 'the container has no children');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('render', function () {
                assert.equal(container.children.length, 1, 'the container has children');

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.test('Issue in rendering', function (assert) {
        var ready = assert.async();
        var count = 0;
        var container = document.getElementById(containerId);

        assert.expect(4);

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('init', function () {
                this._item.renderer = null;
                this.render(container);
            })
            .on('error', function (message) {
                assert.ok(true, 'The provider triggers an error event');
                assert.ok(typeof message === 'string', 'The error is a string');
                if (count > 0) {
                    ready();
                }
                count++;
            })
            .init();
    });

    QUnit.module('Provider clear', {
        afterEach: function (assert) {
            itemRunner.providers = null;
        }
    });

    QUnit.test('Clear a rendered item', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(6);

        assert.ok(container instanceof HTMLElement, 'the item container exists');
        assert.equal(container.children.length, 0, 'the container has no children');

        itemRunner.register('qti', qtiRuntimeProvider);

        itemRunner('qti', itemData)
            .on('render', function () {
                assert.equal(typeof this._item, 'object', 'the item instance is attached to the runner');
                assert.equal(container.children.length, 1, 'the container has children');

                this.clear();
            })
            .on('clear', function () {
                assert.equal(container.children.length, 0, 'the container children are removed');
                assert.equal(this._item, null, 'the item instance is also cleared');

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.test('Clear a rendered item asynchronosuly', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(6);

        assert.ok(container instanceof HTMLElement, 'the item container exists');
        assert.equal(container.children.length, 0, 'the container has no children');

        itemRunner.register('qti', qtiRuntimeProvider);

        itemRunner('qti', itemData)
            .on('render', function () {
                assert.equal(typeof this._item, 'object', 'the item instance is attached to the runner');
                assert.equal(container.children.length, 1, 'the container has children');

                // Mock the getInteractions() method to return interaction with async clear step
                this._item.getInteractions = function () {
                    return [
                        {
                            clear: function () {
                                return new Promise(function (resolve) {
                                    setTimeout(resolve, 10);
                                });
                            }
                        }
                    ];
                };

                this.clear();
            })
            .on('clear', function () {
                assert.equal(container.children.length, 0, 'the container children are removed');
                assert.equal(this._item, null, 'the item instance is also cleared');

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.module('Provider state', {
        afterEach: function (assert) {
            //Reset the provides
            runner.clear();
            itemRunner.providers = null;
        }
    });

    QUnit.test('default state structure', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(4);

        assert.ok(container instanceof HTMLElement, 'the item container exists');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('render', function () {
                var state = this.getState();

                assert.ok(typeof state === 'object', 'the state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'the state contains the interaction response identifier');
                assert.ok(typeof state.RESPONSE.response === 'object', 'the state contains the interaction response');

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.test('get state after changes', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(12);

        assert.ok(container instanceof HTMLElement, 'the item container exists');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('error', function (e) {
                assert.ok(false, 'Unexpected error : ' + e.message);
            })
            .on('render', function () {
                //Default state
                var state = this.getState();

                assert.ok(typeof state === 'object', 'the state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'the state contains the interaction response identifier');
                assert.equal(state.RESPONSE.response.base, null, 'the default state contains a null base');

                //Change something
                $('[data-identifier="Discovery"]', $(container)).click();

                state = this.getState();

                assert.ok(typeof state === 'object', 'the state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'the state contains the interaction response identifier');
                assert.ok(typeof state.RESPONSE.response.base === 'object', 'the contains a base object');
                assert.equal(state.RESPONSE.response.base.identifier, 'Discovery', 'the contains the selected choice');

                //Change something else
                $('[data-identifier="Atlantis"]', $(container)).click();

                state = this.getState();

                assert.ok(typeof state === 'object', 'the state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'the state contains the interaction response identifier');
                assert.ok(typeof state.RESPONSE.response.base === 'object', 'the contains a base object');
                assert.equal(state.RESPONSE.response.base.identifier, 'Atlantis', 'the contains the selected choice');

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.test('set state', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(3);

        assert.ok(container instanceof HTMLElement, 'the item container exists');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('render', function () {
                assert.ok(
                    !$('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is not checked'
                );

                this.setState({ RESPONSE: { response: { base: { identifier: 'Atlantis' } } } });

                assert.ok(
                    $('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is checked'
                );

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.test('set multiple  states', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(8);

        assert.ok(container instanceof HTMLElement, 'the item container exists');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('render', function () {
                assert.ok(
                    !$('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is not checked'
                );

                this.setState({ RESPONSE: { response: { base: { identifier: 'Atlantis' } } } });

                assert.ok(
                    $('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is checked'
                );

                //Change something
                $('[data-identifier="Discovery"]', $(container)).click();

                assert.ok(
                    !$('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is not checked'
                );
                assert.ok(
                    $('[data-identifier="Discovery"] input', $(container)).prop('checked'),
                    'The choice is checked'
                );

                this.setState({ RESPONSE: { response: { base: { identifier: 'Challenger' } } } });

                assert.ok(
                    !$('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is not checked'
                );
                assert.ok(
                    !$('[data-identifier="Discovery"] input', $(container)).prop('checked'),
                    'The choice is not checked'
                );
                assert.ok(
                    $('[data-identifier="Challenger"] input', $(container)).prop('checked'),
                    'The choice is checked'
                );

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.test('listen state changes', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(10);

        assert.ok(container instanceof HTMLElement, 'the item container exists');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('statechange', function (state) {
                assert.ok(
                    $('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is checked'
                );

                assert.ok(typeof state === 'object', 'the state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'the state contains the interaction response identifier');
                assert.ok(typeof state.RESPONSE.response.base === 'object', 'the contains a base object');
                assert.equal(state.RESPONSE.response.base.identifier, 'Atlantis', 'the contains the selected choice');

                ready();
            })
            .on('render', function () {
                var state = this.getState();

                assert.ok(typeof state === 'object', 'the state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'the state contains the interaction response identifier');
                assert.equal(state.RESPONSE.response.base, null, 'the default state contains a null base');

                assert.ok(
                    !$('[data-identifier="Atlantis"] input', $(container)).prop('checked'),
                    'The choice is not checked'
                );

                $('[data-identifier="Atlantis"]', $(container)).click();
            })
            .init()
            .render(container);
    });

    QUnit.module('Provider responses', {
        afterEach: function (assert) {
            runner.clear();
            itemRunner.providers = null;
        }
    });

    QUnit.test('no responses set', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(4);

        assert.ok(container instanceof HTMLElement, 'the item container exists');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('render', function () {
                var responses = this.getResponses();

                assert.ok(typeof responses === 'object', 'the response is an object');
                assert.ok(
                    typeof responses.RESPONSE === 'object',
                    'the response contains the interaction response identifier'
                );
                assert.equal(responses.RESPONSE.base, null, 'the response contains a null base property');

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.test('get responses after changes', function (assert) {
        var ready = assert.async();
        var container = document.getElementById(containerId);

        assert.expect(7);

        assert.ok(container instanceof HTMLElement, 'the item container exists');

        itemRunner.register('qti', qtiRuntimeProvider);

        runner = itemRunner('qti', itemData)
            .on('render', function () {
                var responses = this.getResponses();

                assert.ok(typeof responses === 'object', 'the response is an object');
                assert.ok(
                    typeof responses.RESPONSE === 'object',
                    'the response contains the interaction response identifier'
                );
                assert.equal(responses.RESPONSE.base, null, 'the response contains a null base property');

                //The user set response
                $('[data-identifier="Atlantis"]', $(container)).click();

                responses = this.getResponses();

                assert.ok(typeof responses === 'object', 'the response is an object');
                assert.ok(
                    typeof responses.RESPONSE === 'object',
                    'the response contains the interaction response identifier'
                );
                assert.equal(responses.RESPONSE.base.identifier, 'Atlantis', 'the response contains the set value');

                ready();
            })
            .init()
            .render(container);
    });

    QUnit.module('Provider PIC', {
        beforeEach: function (assert) {
            icRegistry.resetProviders();
        },
        afterEach: function (assert) {
            runner.clear();
            itemRunner.providers = null;
            icRegistry.resetProviders();
        }
    });
});
