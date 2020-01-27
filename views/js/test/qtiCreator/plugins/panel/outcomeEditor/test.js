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

/**
 * @author Anshul sharma <ansul@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/panel/outcomeEditor'
], function($, creatorMock, outcomeEditorPlugin) {
    'use strict';

    QUnit.module('API');

    QUnit.test('factory', function(assert) {
        var itemCreator = creatorMock();

        assert.expect(3);

        assert.equal(typeof outcomeEditorPlugin, 'function', 'The module exposes a function');
        assert.equal(typeof outcomeEditorPlugin(itemCreator), 'object', 'The factory creates an object');
        assert.notDeepEqual(outcomeEditorPlugin(itemCreator), outcomeEditorPlugin(itemCreator), 'The factory creates an new object');
    });

    QUnit.test('plugin', function(assert) {
        var itemCreator = creatorMock();
        var plugin;

        assert.expect(11);

        plugin = outcomeEditorPlugin(itemCreator);

        assert.equal(typeof plugin.init, 'function', 'The plugin has an init method');
        assert.equal(typeof plugin.render, 'function', 'The plugin has a render method');
        assert.equal(typeof plugin.destroy, 'function', 'The plugin has a destroy method');
        assert.equal(typeof plugin.enable, 'function', 'The plugin has an enable method');
        assert.equal(typeof plugin.disable, 'function', 'The plugin has a disable method');
        assert.equal(typeof plugin.show, 'function', 'The plugin has a show method');
        assert.equal(typeof plugin.hide, 'function', 'The plugin has an hide method');
        assert.equal(typeof plugin.getHost, 'function', 'The plugin has a getHost method');
        assert.equal(typeof plugin.getName, 'function', 'The plugin has a getName method');
        assert.equal(typeof plugin.getConfig, 'function', 'The plugin has a getConfig method');
        assert.equal(typeof plugin.getAreaBroker, 'function', 'The plugin has a getAreaBroker method');
    });
});
