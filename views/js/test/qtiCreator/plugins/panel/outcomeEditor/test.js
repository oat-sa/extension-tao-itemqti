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
 * Copyright (c) 2020 Open Assessment Technologies SA ;
 */

/**
 * @author Anshul sharma <ansul@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/test/qtiCreator/plugins/creatorMock',
    'taoQtiItem/qtiCreator/plugins/panel/outcomeEditor',
    'taoQtiItem/qtiItem/core/Loader',
    'json!taoQtiItem/test/samples/json/airports.json'
], function($, creatorMock, outcomeEditorPlugin, Loader, item_airport) {
    'use strict';

    QUnit.module('API');

    QUnit.test('factory', function(assert) {
        const itemCreator = creatorMock();

        assert.expect(3);

        assert.equal(typeof outcomeEditorPlugin, 'function', 'The module exposes a function');
        assert.equal(typeof outcomeEditorPlugin(itemCreator), 'object', 'The factory creates an object');
        assert.notDeepEqual(outcomeEditorPlugin(itemCreator), outcomeEditorPlugin(itemCreator), 'The factory creates an new object');
    });

    QUnit.test('plugin', function(assert) {
        const itemCreator = creatorMock();
        let plugin;

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

    QUnit.test('render outcome editor panel', assert => {
        var ready = assert.async();
        const $container = $('#qunit-fixture');

        const loader = new Loader().setClassesLocation('assessmentItem');

        loader.loadItemData(item_airport, function(loadedItem){
            const itemCreator = creatorMock($container, {}, loadedItem);
            const pluginInstance = outcomeEditorPlugin(itemCreator, itemCreator.getAreaBroker());
            const itemContainer = itemCreator.getAreaBroker().getContainer();

            pluginInstance.init();

            assert.expect(1);

            itemContainer.on('initResponseForm.outcome-editor', () => {
                assert.ok($container.children().length, 'component is rendered');
                pluginInstance.destroy();
                ready();
            });

            itemContainer.trigger('initResponseForm.outcome-editor');
        });
    });

    QUnit.test('External scored attribute', assert => {
        var ready = assert.async();
        const $container = $('#qunit-fixture');

        const loader = new Loader().setClassesLocation('assessmentItem');

        loader.loadItemData(item_airport, function(loadedItem){
            const itemCreator = creatorMock($container, {}, loadedItem);
            const pluginInstance = outcomeEditorPlugin(itemCreator, itemCreator.getAreaBroker());
            const itemContainer = itemCreator.getAreaBroker().getContainer();

            pluginInstance.init();

            assert.expect(3);

            itemContainer.on('initResponseForm.outcome-editor', () => {
                const $panel = $container.find('.panel');

                itemContainer.on('click.outcome-editor', '.adder', () => {
                    const $outcomes = $panel.find('.outcomes');
                    assert.equal($outcomes.children().length, 2, 'component can add new outcome variables');

                    itemContainer.on('click.outcome-editor', '[data-role="edit"]', () => {
                        const $outcome = $outcomes.children().last();
                        const $externalScored = $outcome.find('.externalscored');
                        assert.ok($externalScored, 'externalScored attribute is present');
                        assert.equal($externalScored.find("select[name='externalScored']").children().length, 3, 'externalScored attribute has 3 options');
                        ready();
                    });

                    $outcomes.children().last().find('[data-role="edit"]').trigger('click.outcome-editor');
                });

                itemContainer.find('.adder').trigger('click.outcome-editor');
            });

            itemContainer.trigger('initResponseForm.outcome-editor');
        });
    });

    QUnit.test('Long Interpretation attribute', assert => {
        var ready = assert.async();
        const $container = $('#qunit-fixture');

        const loader = new Loader().setClassesLocation('assessmentItem');

        loader.loadItemData(item_airport, function(loadedItem){
            const itemCreator = creatorMock($container, {}, loadedItem);
            const pluginInstance = outcomeEditorPlugin(itemCreator, itemCreator.getAreaBroker());
            const itemContainer = itemCreator.getAreaBroker().getContainer();

            pluginInstance.init();
            assert.expect(2);

            itemContainer.on('initResponseForm.outcome-editor', () => {
                const $panel = $container.find('.panel');

                itemContainer.on('click.outcome-editor', '.adder', () => {
                    const $outcomes = $panel.find('.outcomes');

                    itemContainer.on('click.outcome-editor', '[data-role="edit"]', () => {
                        const $outcome = $outcomes.children().last();
                        const $longinterpretation = $($outcome.find('.longinterpretation')[0]);
                        const $longinterpretationInput = $longinterpretation.find("input[name='longInterpretation']");
                        const testUri = 'http://taocloud.org';

                        assert.ok($longinterpretation, 'Long interpretation attribute is present');
                        $longinterpretationInput.value = testUri;
                        assert.equal($longinterpretationInput.value, testUri, 'Can set value set');
                        ready();
                    });

                    $outcomes.children().last().find('[data-role="edit"]').trigger('click.outcome-editor');
                });

                itemContainer.find('.adder').trigger('click.outcome-editor');
            });

            itemContainer.trigger('initResponseForm.outcome-editor');
        });
    });
});
