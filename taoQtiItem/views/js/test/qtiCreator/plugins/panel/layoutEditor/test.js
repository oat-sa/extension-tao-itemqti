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
 * Copyright (c) 2024 Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/panel/layoutEditor',
    'taoQtiItem/qtiItem/core/Loader',
    'json!taoQtiItem/test/samples/json/airports.json'
], function($, creatorMock, layoutEditorPlugin, Loader, item_airport) {
    'use strict';

    QUnit.module('API');

    QUnit.test('factory', function(assert) {
        const itemCreator = creatorMock();

        assert.expect(3);

        assert.equal(typeof layoutEditorPlugin, 'function', 'The module exposes a function');
        assert.equal(typeof layoutEditorPlugin(itemCreator), 'object', 'The factory creates an object');
        assert.notDeepEqual(layoutEditorPlugin(itemCreator), layoutEditorPlugin(itemCreator), 'The factory creates an new object');
    });

    QUnit.test('plugin', function(assert) {
        const itemCreator = creatorMock();
        let plugin;

        assert.expect(11);

        plugin = layoutEditorPlugin(itemCreator);

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

    QUnit.test('render layout editor panel', assert => {
        const ready = assert.async();
        const $container = $('#qunit-fixture');

        const loader = new Loader().setClassesLocation('assessmentItem');

        loader.loadItemData(item_airport, function(loadedItem) {
            const config = {
                properties: {
                    'scrollable-multi-column': true,
                    'separator-between-columns': true
                }
            };
            const itemCreator = creatorMock($container, config, loadedItem);
            const pluginInstance = layoutEditorPlugin(itemCreator, itemCreator.getAreaBroker());
            const itemContainer = itemCreator.getAreaBroker().getContainer();

            pluginInstance.init();

            assert.expect(3);

            itemContainer.on('ready.qti-widget', () => {
                assert.ok($container.children().length, 'component is rendered');
                assert.ok($container.find('input[name="scrollable-multi-column"]'), 'scrollable-multi-column control is rendered');
                assert.ok($container.find('input[name="separator-between-columns"]'), 'separator-between-columns control is rendered');

                pluginInstance.destroy();
                ready();
            });

            itemContainer.trigger('ready.qti-widget');
        });
    });

    QUnit.module('scrollable-multi-column');

    QUnit.test('turn dual-column-layout classes on and off', assert => {
        const ready = assert.async();
        const $container = $('#qunit-fixture');

        const loader = new Loader().setClassesLocation('assessmentItem');

        loader.loadItemData(item_airport, function(loadedItem) {
            const config = {
                properties: {
                    'scrollable-multi-column': true
                }
            };
            const itemCreator = creatorMock($container, config, loadedItem);
            const pluginInstance = layoutEditorPlugin(itemCreator, itemCreator.getAreaBroker());
            const $itemContainer = itemCreator.getAreaBroker().getContainer();

            assert.expect(7);

            pluginInstance.init();

            $itemContainer.on('initDone.layout-editor', () => {
                assert.ok($container.children().length, 'component is rendered');

                const $checkbox = $container.find('input[name="scrollable-multi-column"]');
                assert.notOk($checkbox.prop('checked'), 'dual-column-layout checkbox is unchecked');
                assert.equal($itemContainer.find('.grid-row.dual-column-layout').length, 0, 'dual-column-layout DOM classes are absent');

                $checkbox.click();

                assert.ok($checkbox.prop('checked'), 'dual-column-layout checkbox is checked');
                assert.equal($itemContainer.find('.grid-row.dual-column-layout').length, 2, 'dual-column-layout DOM classes are added');

                $checkbox.click();
                assert.notOk($checkbox.prop('checked'), 'dual-column-layout checkbox is unchecked');
                assert.equal($itemContainer.find('.grid-row.dual-column-layout').length, 0, 'dual-column-layout DOM classes are removed');

                pluginInstance.destroy();
                ready();
            });

            $itemContainer.trigger('ready.qti-widget');
        });
    });

    QUnit.module('separator-between-columns');

    QUnit.test('turn separator classes on and off', assert => {
        const ready = assert.async();
        const $container = $('#qunit-fixture');

        const loader = new Loader().setClassesLocation('assessmentItem');

        loader.loadItemData(item_airport, function(loadedItem) {
            const config = {
                properties: {
                    'separator-between-columns': true
                }
            };
            const itemCreator = creatorMock($container, config, loadedItem);
            const pluginInstance = layoutEditorPlugin(itemCreator, itemCreator.getAreaBroker());
            const $itemContainer = itemCreator.getAreaBroker().getContainer();

            assert.expect(10);

            pluginInstance.init();

            $itemContainer.on('initDone.layout-editor', () => {
                assert.ok($container.children().length, 'component is rendered');

                const $checkbox = $container.find('input[name="separator-between-columns"]');
                assert.notOk($checkbox.prop('checked'));
                assert.notOk($itemContainer.find('.qti-itemBody').hasClass('separator-between-columns'), 'separator-between-columns DOM class is absent');
                assert.notOk(itemCreator.getItem().hasClass('separator-between-columns'), 'separator-between-columns item class is absent');

                $checkbox.click();

                assert.ok($checkbox.prop('checked'));
                assert.ok($itemContainer.find('.qti-itemBody').hasClass('separator-between-columns'), 'separator-between-columns DOM class is added');
                assert.ok(itemCreator.getItem().hasClass('separator-between-columns'), 'separator-between-columns item class is added');

                $checkbox.click();
                assert.notOk($checkbox.prop('checked'));
                assert.notOk($itemContainer.find('.qti-itemBody').hasClass('separator-between-columns'), 'separator-between-columns DOM class is removed');
                assert.notOk(itemCreator.getItem().hasClass('separator-between-columns'), 'separator-between-columns item class is removed');

                pluginInstance.destroy();
                ready();
            });

            $itemContainer.trigger('ready.qti-widget');
        });
    });
});
