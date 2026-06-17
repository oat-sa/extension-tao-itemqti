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
    'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter'
], function ($, AssociateInteractionStateQuestion, formElement, sizeAdapter) {
    'use strict';

    var createInteraction = function createInteraction(attrs, qtiClass) {
        attrs = attrs || {};

        return {
            qtiClass: qtiClass || 'associateInteraction',
            attr: function attr(name, value) {
                if (arguments.length === 1) {
                    return attrs[name];
                }
                attrs[name] = value;
                return this;
            }
        };
    };

    var withStubbedFormBindings = function withStubbedFormBindings(callback) {
        var originalInitWidget = formElement.initWidget;
        var originalSetChangeCallbacks = formElement.setChangeCallbacks;
        var originalAdaptSize = sizeAdapter.adaptSize;
        var capturedCallbacks;

        formElement.initWidget = function initWidget() {};
        formElement.setChangeCallbacks = function setChangeCallbacks($form, interaction, callbacks) {
            capturedCallbacks = callbacks;
        };
        sizeAdapter.adaptSize = function adaptSize() {};

        try {
            callback(function getCapturedCallbacks() {
                return capturedCallbacks;
            });
        } finally {
            formElement.initWidget = originalInitWidget;
            formElement.setChangeCallbacks = originalSetChangeCallbacks;
            sizeAdapter.adaptSize = originalAdaptSize;
        }
    };

    var createState = function createState(interaction, interactionClass) {
        var $container = $('<div><div class="qti-interaction ' + interactionClass + '"></div></div>');

        return {
            widget: {
                $form: $('<form />'),
                $container: $container,
                element: interaction,
                on: function on() {}
            }
        };
    };

    QUnit.module('associateInteraction question state');

    QUnit.test('gets choices position from class names', function (assert) {
        assert.expect(10);

        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('foo qti-choices-top bar'),
            'top',
            'reads top position with the expected prefix'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('qti-choices-bottom custom'),
            'bottom',
            'reads bottom position with the expected prefix'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('custom qti-choices-left'),
            'left',
            'reads left position with the expected prefix'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('qti-choices-right'),
            'right',
            'reads right position with the expected prefix'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('foo qti-choices-center'),
            'top',
            'falls back when the prefixed value is unsupported'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('choices-left'),
            'top',
            'falls back when the expected prefix is missing'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('qti-direction-left'),
            'top',
            'falls back for unrelated position-like classes'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('qti-choices-'),
            'top',
            'falls back for an empty prefixed position'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass(''),
            'top',
            'falls back for empty strings'
        );
        assert.strictEqual(
            AssociateInteractionStateQuestion.getPositionFromClass('   '),
            'top',
            'falls back for whitespace-only strings'
        );
    });

    QUnit.test('normalizes choices position classes', function (assert) {
        assert.expect(4);

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('foo qti-choices-left bar', 'right'),
            'foo bar qti-choices-right',
            'replaces an existing choices position and preserves unrelated classes'
        );

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('qti-choices-top qti-choices-bottom custom', 'left'),
            'custom qti-choices-left',
            'collapses multiple choices positions to one class'
        );

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('custom', 'invalid'),
            'custom',
            'ignores unsupported positions'
        );

        assert.strictEqual(
            AssociateInteractionStateQuestion.normalizePositionClass('left custom', 'top'),
            'left custom qti-choices-top',
            'preserves unrelated position-like classes'
        );
    });

    QUnit.test('initializes form position from interaction class and syncs model and DOM classes', function (assert) {
        assert.expect(6);

        withStubbedFormBindings(function (getCapturedCallbacks) {
            var interaction = createInteraction({
                class: 'custom qti-choices-bottom',
                minAssociations: '0',
                maxAssociations: '1'
            });
            var state = createState(interaction, 'custom qti-choices-bottom');

            AssociateInteractionStateQuestion.prototype.initForm.call(state);

            assert.strictEqual(
                state.widget.$form.find('input[name="position"]:checked').val(),
                'bottom',
                'selects the parsed position in the form'
            );
            assert.strictEqual(
                interaction.attr('class'),
                'custom qti-choices-bottom',
                'keeps the normalized position class on the model during initialization'
            );
            assert.ok(
                state.widget.$container.find('.qti-interaction').hasClass('qti-choices-bottom'),
                'keeps the parsed position class on the rendered interaction during initialization'
            );
            assert.strictEqual(
                state.widget.$container.find('.qti-interaction').hasClass('qti-choices-top'),
                false,
                'does not add the default class when a supported class is present'
            );
            assert.strictEqual(typeof getCapturedCallbacks().position, 'function', 'registers a position callback');

            getCapturedCallbacks().position(interaction, 'right');

            assert.strictEqual(
                interaction.attr('class'),
                'custom qti-choices-right',
                'position callback replaces the persisted position class and preserves unrelated classes'
            );
        });
    });

    QUnit.test('position callback updates the rendered interaction class without duplicate position classes', function (assert) {
        assert.expect(5);

        withStubbedFormBindings(function (getCapturedCallbacks) {
            var interaction = createInteraction({
                class: 'foo qti-choices-left bar',
                minAssociations: '0',
                maxAssociations: '1'
            });
            var state = createState(interaction, 'foo qti-choices-left bar');
            var $interaction;

            AssociateInteractionStateQuestion.prototype.initForm.call(state);
            getCapturedCallbacks().position(interaction, 'top');
            $interaction = state.widget.$container.find('.qti-interaction');

            assert.strictEqual(interaction.attr('class'), 'foo bar qti-choices-top', 'updates persisted class');
            assert.ok($interaction.hasClass('foo'), 'preserves unrelated rendered class before the position');
            assert.ok($interaction.hasClass('bar'), 'preserves unrelated rendered class after the position');
            assert.ok($interaction.hasClass('qti-choices-top'), 'adds the new rendered position class');
            assert.strictEqual(
                $interaction.is('.qti-choices-left, .qti-choices-bottom, .qti-choices-right'),
                false,
                'removes previous rendered position classes'
            );
        });
    });
});
