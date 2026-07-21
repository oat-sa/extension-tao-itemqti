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

define('taoQtiItem/qtiCommonRenderer/helpers/separatorLayout', [], function() {
    'use strict';

    const STACKED_SEPARATOR_CLASS = 'separator-between-columns-stacked';

    function getColumns(row) {
        return Array.from(row.querySelectorAll(':scope > [class^="col-"]'));
    }

    function clearSeparatorLineExtent(column) {
        if (!column || !column.style) {
            return;
        }

        column.style.removeProperty('--separator-row-offset-start');
        column.style.removeProperty('--separator-row-offset-end');
    }

    function updateSeparatorLayout(target) {
        const element = target && target.jquery ? target[0] : target;
        const rows = element ? Array.from(element.querySelectorAll('.grid-row')) : [];

        rows.forEach(row => {
            const columns = getColumns(row);

            if (columns.length < 2) {
                return;
            }

            const firstRect = columns[0].getBoundingClientRect();
            const lastRect = columns[columns.length - 1].getBoundingClientRect();
            const stacked = columns.some((column, index) => {
                if (index === 0) {
                    return false;
                }

                const columnRect = column.getBoundingClientRect();

                return columnRect.top >= firstRect.bottom || columnRect.left <= firstRect.left;
            });

            row.classList.toggle(STACKED_SEPARATOR_CLASS, stacked);

            columns.forEach((column, index) => {
                if (index === 0 || stacked) {
                    clearSeparatorLineExtent(column);
                    return;
                }

                const columnRect = column.getBoundingClientRect();
                column.style.setProperty('--separator-row-offset-start', `${columnRect.left - firstRect.left}px`);
                column.style.setProperty('--separator-row-offset-end', `${Math.max(lastRect.right - columnRect.right, 0)}px`);
            });
        });
    }

    return {
        STACKED_SEPARATOR_CLASS,
        clearSeparatorLineExtent,
        setupSeparatorLayout() {
            return function() {};
        },
        updateSeparatorLayout
    };
});

define([
    'jquery',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/panel/layoutEditor',
    'taoQtiItem/qtiCommonRenderer/helpers/separatorLayout',
    'taoQtiItem/qtiItem/core/Loader',
    'json!taoQtiItem/test/samples/json/airports.json'
], function($, creatorMock, layoutEditorPlugin, separatorLayout, Loader, item_airport) {
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

    QUnit.test('updates separator orientation from rendered column positions', assert => {
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

            assert.expect(6);

            pluginInstance.init();

            $itemContainer.on('initDone.layout-editor', () => {
                const $checkbox = $container.find('input[name="separator-between-columns"]');
                const $row = $itemContainer.find('.qti-itemBody > .grid-row').first();
                const columns = $row.children('[class^="col-"]').toArray();

                columns[0].getBoundingClientRect = () => ({
                    left: 0,
                    top: 0,
                    right: 100,
                    bottom: 100
                });
                columns[1].getBoundingClientRect = () => ({
                    left: 120,
                    top: 0,
                    right: 220,
                    bottom: 100
                });

                $checkbox.click();

                assert.ok($checkbox.prop('checked'), 'separator checkbox is checked');
                assert.notOk($row.hasClass('separator-between-columns-stacked'), 'row keeps vertical separator when columns sit side by side');
                assert.equal(columns[1].style.getPropertyValue('--separator-row-offset-start'), '120px', 'stacked separator start offset follows row geometry');
                assert.equal(columns[1].style.getPropertyValue('--separator-row-offset-end'), '0px', 'stacked separator end offset follows row geometry');

                columns[1].getBoundingClientRect = () => ({
                    left: 0,
                    top: 120,
                    right: 100,
                    bottom: 220
                });

                $itemContainer.find('.qti-itemBody').trigger('item-writing-mode-changed');
                assert.ok($row.hasClass('separator-between-columns-stacked'), 'row switches to horizontal separator when columns stack');

                columns[1].getBoundingClientRect = () => ({
                    left: 120,
                    top: 0,
                    right: 220,
                    bottom: 100
                });

                $itemContainer.trigger('resize.layout-editor');
                assert.notOk($row.hasClass('separator-between-columns-stacked'), 'row returns to vertical separator when columns stop stacking');

                pluginInstance.destroy();
                ready();
            });

            $itemContainer.trigger('ready.qti-widget');
        });
    });

    QUnit.test('clears stacked separator state and CSS vars when unchecked', assert => {
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

            assert.expect(8);

            pluginInstance.init();

            $itemContainer.on('initDone.layout-editor', () => {
                const $checkbox = $container.find('input[name="separator-between-columns"]');
                const $row = $itemContainer.find('.qti-itemBody > .grid-row').first();
                const columns = $row.children('[class^="col-"]').toArray();

                $row.addClass('separator-between-columns-stacked');
                columns[1].style.setProperty('--separator-row-offset-start', '25px');
                columns[1].style.setProperty('--separator-row-offset-end', '35px');

                $checkbox.click();

                assert.ok($checkbox.prop('checked'), 'separator checkbox is checked');
                assert.ok($itemContainer.find('.qti-itemBody').hasClass('separator-between-columns'), 'separator class is present while checked');

                $checkbox.click();

                assert.notOk($checkbox.prop('checked'), 'separator checkbox is unchecked');
                assert.notOk($itemContainer.find('.qti-itemBody').hasClass('separator-between-columns'), 'separator class is removed from the DOM');
                assert.notOk(itemCreator.getItem().hasClass('separator-between-columns'), 'separator class is removed from the item model');
                assert.notOk($row.hasClass('separator-between-columns-stacked'), 'stacked row class is removed');
                assert.equal(columns[1].style.getPropertyValue('--separator-row-offset-start'), '', 'separator start offset is cleared');
                assert.equal(columns[1].style.getPropertyValue('--separator-row-offset-end'), '', 'separator end offset is cleared');

                pluginInstance.destroy();
                ready();
            });

            $itemContainer.trigger('ready.qti-widget');
        });
    });

    QUnit.test('does not wire separator updates when separator config is disabled', assert => {
        const ready = assert.async();
        const $container = $('#qunit-fixture');
        const originalUpdateSeparatorLayout = separatorLayout.updateSeparatorLayout;
        let updateCalls = 0;

        const loader = new Loader().setClassesLocation('assessmentItem');

        separatorLayout.updateSeparatorLayout = function() {
            updateCalls++;
            return originalUpdateSeparatorLayout.apply(this, arguments);
        };

        loader.loadItemData(item_airport, function(loadedItem) {
            const config = {
                properties: {
                    'separator-between-columns': false
                }
            };
            const itemCreator = creatorMock($container, config, loadedItem);
            const pluginInstance = layoutEditorPlugin(itemCreator, itemCreator.getAreaBroker());
            const $itemContainer = itemCreator.getAreaBroker().getContainer();

            assert.expect(4);

            pluginInstance.init();

            $itemContainer.on('initDone.layout-editor', () => {
                const $row = $itemContainer.find('.qti-itemBody > .grid-row').first();

                assert.equal($container.find('input[name="separator-between-columns"]').length, 0, 'separator checkbox is not rendered when disabled');

                $itemContainer.trigger('resize.layout-editor');
                $itemContainer.find('.qti-itemBody').trigger('item-writing-mode-changed');
                $(window).trigger('resize.layout-editor');

                assert.equal(updateCalls, 0, 'separator helper is never called');
                assert.notOk($itemContainer.find('.qti-itemBody').hasClass('separator-between-columns'), 'separator class is never added');
                assert.notOk($row.hasClass('separator-between-columns-stacked'), 'stacked row class is never added');

                pluginInstance.destroy();
                separatorLayout.updateSeparatorLayout = originalUpdateSeparatorLayout;
                ready();
            });

            $itemContainer.trigger('ready.qti-widget');
        });
    });
});
