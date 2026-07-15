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
 */

define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/states/Question',
    'taoQtiItem/qtiCreator/model/interactions/MatchInteraction',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/match'
], function($, _, QuestionState, MatchInteraction, formTpl) {
    'use strict';

    QUnit.module('qtiCreator/widgets/interactions/matchInteraction/states/Question');

    function createInteraction(attributes) {
        const attrs = _.assign({}, attributes);

        return {
            attr(name, value) {
                if (arguments.length === 1) {
                    return attrs[name];
                }
                attrs[name] = value;
                return this;
            },
            removeAttr(name) {
                delete attrs[name];
                return this;
            }
        };
    }

    function createWidget(attributes) {
        const interaction = createInteraction(attributes);
        const $container = $('<div><div class="qti-interaction"></div></div>');
        const $form = $('<form />');
        const $fixture = $('#qunit-fixture');

        $container.find('.qti-interaction').addClass(attributes.class || '');
        $fixture.append($container, $form);

        return {
            element: interaction,
            $container,
            $form,
            on() {}
        };
    }

    function getInteractionClasses(widget) {
        return widget.$container.find('.qti-interaction').attr('class');
    }

    function initForm(widget) {
        const state = new QuestionState(widget);

        state.initForm();
    }

    QUnit.test('newly created match interaction defaults to tabular mode', function(assert) {
        assert.expect(1);

        const interaction = new MatchInteraction();

        assert.strictEqual(interaction.attr('class'), 'qti-match-tabular', 'default class is tabular');
    });

    QUnit.test('initForm normalizes imported match with no mode class to non-tabular top', function(assert) {
        assert.expect(5);

        const widget = createWidget({ class: 'custom-class' });

        initForm(widget);

        assert.strictEqual(
            widget.element.attr('class'),
            'custom-class qti-match-non-tabular qti-choices-top',
            'model class is normalized to non-tabular top and preserves unrelated classes'
        );
        assert.strictEqual(
            getInteractionClasses(widget),
            'custom-class qti-match-non-tabular qti-choices-top',
            'rendered interaction classes match normalized model classes'
        );
        assert.strictEqual(widget.$form.find('.position-panel').is(':visible'), true, 'position panel is visible');
        assert.strictEqual(widget.$form.find('.match-non-tabular-info').is(':visible'), true, 'non-tabular info is visible');
        assert.strictEqual(
            widget.$form.find('input[name="position"][value="top"]').prop('checked'),
            true,
            'top position is checked'
        );
    });

    QUnit.test('switching from tabular with stale position defaults non-tabular position to top', function(assert) {
        assert.expect(6);

        const widget = createWidget({ class: 'preserved qti-match-tabular qti-choices-right' });

        initForm(widget);

        assert.strictEqual(widget.element.attr('class'), 'preserved qti-match-tabular', 'stale position is stripped on init');
        assert.strictEqual(getInteractionClasses(widget), 'preserved qti-match-tabular', 'rendered classes strip stale position on init');
        assert.strictEqual(widget.$form.find('.position-panel').is(':visible'), false, 'position panel is hidden in tabular mode');

        widget.$form.find('input[name="displayMode"][value="qti-match-non-tabular"]')
            .prop('checked', true)
            .trigger('change');

        assert.strictEqual(
            widget.element.attr('class'),
            'preserved qti-match-non-tabular qti-choices-top',
            'non-tabular switch defaults to top instead of restoring stale right position'
        );
        assert.strictEqual(
            getInteractionClasses(widget),
            'preserved qti-match-non-tabular qti-choices-top',
            'rendered classes match non-tabular top after switch'
        );
        assert.strictEqual(
            widget.$form.find('input[name="position"][value="top"]').prop('checked'),
            true,
            'top position is checked after switch'
        );
    });

    QUnit.test('switching back to tabular strips position and hides non-tabular controls', function(assert) {
        assert.expect(4);

        const widget = createWidget({ class: 'preserved qti-match-non-tabular qti-choices-right' });

        initForm(widget);
        widget.$form.find('input[name="displayMode"][value="qti-match-tabular"]')
            .prop('checked', true)
            .trigger('change');

        assert.strictEqual(widget.element.attr('class'), 'preserved qti-match-tabular', 'tabular mode strips position');
        assert.strictEqual(getInteractionClasses(widget), 'preserved qti-match-tabular', 'rendered classes strip position in tabular mode');
        assert.strictEqual(widget.$form.find('.position-panel').is(':visible'), false, 'position panel is hidden');
        assert.strictEqual(widget.$form.find('.match-non-tabular-info').is(':visible'), false, 'non-tabular info is hidden');
    });

    QUnit.test('match form exposes display mode and conditional position controls', function(assert) {
        assert.expect(8);

        const html = formTpl({
            shuffle: true,
            nonTabular: true,
            position: 'left',
            enabledFeatures: {
                shuffleChoices: true
            }
        });
        const $dom = $('<div />').html(html);

        assert.strictEqual($dom.find('input[name="displayMode"]').length, 2, 'display mode radio group exists');
        assert.strictEqual($dom.find('input[name="position"]').length, 4, 'position radio group exists');
        assert.strictEqual(
            $dom.find('input[name="displayMode"][value="qti-match-non-tabular"]').is('[checked]'),
            true,
            'non-tabular mode is checked'
        );
        assert.strictEqual(
            $dom.find('input[name="position"][value="left"]').is('[checked]'),
            true,
            'selected position is checked'
        );
        assert.strictEqual($dom.find('.match-non-tabular-info').length, 1, 'non-tabular info message exists');
        assert.ok($dom.text().includes('Non-tabular uses choices and buckets'), 'display mode tooltip content exists');
        assert.strictEqual($dom.find('.min-max-panel').length, 1, 'min-max panel remains available');
        assert.strictEqual($dom.find('input[name="shuffle"]').length, 1, 'shuffle control remains available');
    });
});
