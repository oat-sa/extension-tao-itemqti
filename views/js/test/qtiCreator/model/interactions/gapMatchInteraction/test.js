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
    'taoQtiItem/qtiCreator/component/itemAuthoring',
    'json!taoQtiItem/test/samples/json/gapmatch-text-sam.json',
    'lib/jquery.mockjax/jquery.mockjax'
], function ($, itemAuthoringFactory, gapMatchJson) {
    'use strict';

    function getInstance(fixture, config = {}) {
        return itemAuthoringFactory(fixture, config)
            .on('error ready', function () {
                this.destroy();
            });
    }

    // Prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = window.console; // was null
    $.mockjaxSettings.logging = 4; //  == debug
    $.mockjaxSettings.responseTime = 1;

    // Mock the item data query
    $.mockjax({
        url: /mockItemEndpoint/,
        response: function() {
            this.responseText = {
                success: true,
                itemIdentifier: 'item-1',
                itemData: gapMatchJson
            };
        }
    });

    QUnit.module('API');

    QUnit.test('module', assert => {
        const fixture = '#fixture-api';
        assert.expect(3);
        assert.equal(typeof itemAuthoringFactory, 'function', 'The module exposes a function');
        assert.equal(typeof getInstance(fixture), 'object', 'The factory produces an object');
        assert.notStrictEqual(getInstance(fixture), getInstance(fixture), 'The factory provides a different object on each call');
    });

    QUnit.cases.init([
        {title: 'getItemCreator'},
        {title: 'getAreaBroker'}
    ]).test('component API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.test('visual', assert => {
        const ready = assert.async();
        const $container = $('#visual-test');
        const config = {
            properties: {
                uri: 'http://item#rdf-123',
                label: 'Item',
                baseUrl: 'http://foo/bar',
                itemDataUrl: '//mockItemEndpoint'
            }
        };

        assert.expect(2);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = itemAuthoringFactory($container, config)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                ready();
            });
    });
});
