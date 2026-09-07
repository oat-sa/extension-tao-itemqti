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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/panel/itemComments'
], function ($, creatorMock, itemCommentsPlugin) {
    'use strict';

    QUnit.module('API');

    QUnit.test('factory', function (assert) {
        const itemCreator = creatorMock();
        assert.expect(3);
        assert.equal(typeof itemCommentsPlugin, 'function', 'module exposes a function');
        assert.equal(typeof itemCommentsPlugin(itemCreator), 'object', 'factory creates an object');
        assert.notDeepEqual(
            itemCommentsPlugin(itemCreator),
            itemCommentsPlugin(itemCreator),
            'factory creates a new object'
        );
    });

    QUnit.test('plugin methods', function (assert) {
        const itemCreator = creatorMock();
        const plugin = itemCommentsPlugin(itemCreator);
        assert.expect(5);
        assert.equal(typeof plugin.init, 'function', 'has init');
        assert.equal(typeof plugin.render, 'function', 'has render');
        assert.equal(typeof plugin.destroy, 'function', 'has destroy');
        assert.equal(plugin.getName(), 'itemComments', 'plugin name');
        assert.equal(typeof plugin.getAreaBroker, 'function', 'has getAreaBroker');
    });
});
