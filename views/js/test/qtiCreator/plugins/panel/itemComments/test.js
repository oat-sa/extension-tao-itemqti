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
    'context',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/panel/itemComments'
], function ($, context, creatorMock, itemCommentsPlugin) {
    'use strict';

    const FEATURE_FLAG = 'FEATURE_FLAG_ITEM_COMMENTS_ENABLED';

    function setCommentsFlag(enabled) {
        context.featureFlags = context.featureFlags || {};
        context.featureFlags[FEATURE_FLAG] = enabled;
    }

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

    QUnit.module('FEATURE_FLAG_ITEM_COMMENTS_ENABLED', {
        beforeEach: function () {
            this.originalFeatureFlags = context.featureFlags;
            context.featureFlags = Object.assign({}, context.featureFlags || {});
        },
        afterEach: function () {
            context.featureFlags = this.originalFeatureFlags;
        }
    });

    QUnit.test('init removes comments UI when flag is disabled', function (assert) {
        assert.expect(4);
        setCommentsFlag(false);

        const $fixture = $('#qunit-fixture');
        const itemCreator = creatorMock($fixture, {});
        const plugin = itemCommentsPlugin(itemCreator);

        plugin.init();

        assert.equal(
            $fixture.find('#item-editor-item-mode-tabs [data-tab="comments"]').length,
            0,
            'comments tab removed'
        );
        assert.equal(
            $fixture.find('#item-editor-item-comments-bar').length,
            0,
            'comments panel removed'
        );
        assert.equal(plugin.store, undefined, 'store not created');
        assert.equal(plugin.panel, undefined, 'panel not created');
    });

    QUnit.test('init removes comments UI when flag is missing', function (assert) {
        assert.expect(3);
        delete context.featureFlags[FEATURE_FLAG];

        const $fixture = $('#qunit-fixture');
        const plugin = itemCommentsPlugin(creatorMock($fixture, {}));

        plugin.init();

        assert.equal(
            $fixture.find('#item-editor-item-mode-tabs [data-tab="comments"]').length,
            0,
            'comments tab removed'
        );
        assert.equal(
            $fixture.find('#item-editor-item-comments-bar').length,
            0,
            'comments panel removed'
        );
        assert.equal(plugin.panel, undefined, 'panel not created');
    });

    QUnit.test('init mounts comments UI when flag is enabled', function (assert) {
        assert.expect(4);
        setCommentsFlag(true);

        const $fixture = $('#qunit-fixture');
        const plugin = itemCommentsPlugin(creatorMock($fixture, {}));

        plugin.init();

        assert.equal(
            $fixture.find('#item-editor-item-mode-tabs [data-tab="comments"]').length,
            1,
            'comments tab kept'
        );
        assert.ok(plugin.store, 'store created');
        assert.ok(plugin.panel, 'panel created');
        assert.equal(
            $fixture.find('#sidebar-right-item-comments .item-comments-panel').length,
            1,
            'comments panel rendered into host'
        );

        plugin.destroy();
    });
});
