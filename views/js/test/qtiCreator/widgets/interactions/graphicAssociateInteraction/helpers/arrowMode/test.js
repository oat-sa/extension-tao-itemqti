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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

define(['taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/helpers/arrowMode'], function (
    arrowModeHelper
) {
    'use strict';

    function createInteraction(initialSubtype) {
        const attributes = {};
        if (initialSubtype) {
            attributes['data-interaction-subtype'] = initialSubtype;
        }
        const responseDeclarationAttributes = {
            baseType: 'pair',
            cardinality: 'multiple'
        };

        const choices = {};
        const createChoice = function () {
            const choiceAttributes = {};
            return {
                attr: function (name, value) {
                    if (typeof value === 'undefined') {
                        return choiceAttributes[name];
                    }
                    choiceAttributes[name] = value;
                },
                removeAttr: function (name) {
                    delete choiceAttributes[name];
                }
            };
        };

        choices.a = createChoice();
        choices.b = createChoice();

        return {
            attr: function (name, value) {
                if (typeof value === 'undefined') {
                    return attributes[name];
                }
                attributes[name] = value;
            },
            removeAttr: function (name) {
                delete attributes[name];
            },
            getChoices: function () {
                return choices;
            },
            getResponseDeclaration: function () {
                return {
                    attr: function (name, value) {
                        if (typeof value === 'undefined') {
                            return responseDeclarationAttributes[name];
                        }
                        responseDeclarationAttributes[name] = value;
                    }
                };
            }
        };
    }

    QUnit.module('graphicAssociateInteraction arrow mode helper');

    QUnit.test('detects arrow mode when subtype is arrow', function (assert) {
        assert.expect(1);
        assert.ok(arrowModeHelper.isArrowMode(createInteraction('arrow')), 'arrow mode is detected');
    });

    QUnit.test('returns false when interaction does not expose attr function', function (assert) {
        assert.expect(2);
        assert.notOk(arrowModeHelper.isArrowMode({}), 'malformed interaction is handled');
        assert.notOk(arrowModeHelper.isArrowMode(null), 'null interaction is handled');
    });

    QUnit.test('sets and unsets subtype attribute', function (assert) {
        assert.expect(6);
        const interaction = createInteraction();

        assert.strictEqual(arrowModeHelper.setArrowMode(interaction, true), true, 'enabling returns true');
        assert.strictEqual(interaction.attr('data-interaction-subtype'), 'arrow', 'subtype is set to arrow');
        assert.strictEqual(interaction.getResponseDeclaration().attr('baseType'), 'directedPair', 'baseType is set to directedPair');
        assert.strictEqual(arrowModeHelper.setArrowMode(interaction, false), false, 'disabling returns false');
        assert.strictEqual(interaction.attr('data-interaction-subtype'), undefined, 'subtype is removed');
        assert.strictEqual(interaction.getResponseDeclaration().attr('baseType'), 'pair', 'baseType is reset to pair');
    });

    QUnit.test('sets choice direction attributes from booleans', function (assert) {
        assert.expect(2);
        const interaction = createInteraction();
        const choice = interaction.getChoices().a;

        arrowModeHelper.setChoiceDirection(choice, true, false);

        assert.strictEqual(choice.attr('data-start'), 'true', 'data-start is set');
        assert.strictEqual(choice.attr('data-end'), 'false', 'data-end is set');
    });

    QUnit.test('reads choice direction attributes with defaults', function (assert) {
        assert.expect(4);
        const interaction = createInteraction();
        const choice = interaction.getChoices().a;

        assert.deepEqual(
            arrowModeHelper.getChoiceDirection(choice),
            { start: true, end: true },
            'defaults are true when attributes are missing'
        );

        choice.attr('data-start', 'false');
        choice.attr('data-end', 'true');

        assert.strictEqual(arrowModeHelper.getChoiceDirection(choice).start, false, 'data-start false is handled');
        assert.strictEqual(arrowModeHelper.getChoiceDirection(choice).end, true, 'data-end true is handled');
        assert.ok(true, 'all checks done');
    });

    QUnit.test('toggle arrow mode applies and clears choice defaults', function (assert) {
        assert.expect(6);
        const interaction = createInteraction();
        const choiceA = interaction.getChoices().a;
        const choiceB = interaction.getChoices().b;

        arrowModeHelper.setArrowMode(interaction, true);
        assert.strictEqual(choiceA.attr('data-start'), 'true', 'choice A start default is set');
        assert.strictEqual(choiceA.attr('data-end'), 'true', 'choice A end default is set');
        assert.strictEqual(choiceB.attr('data-start'), 'true', 'choice B start default is set');
        assert.strictEqual(choiceB.attr('data-end'), 'true', 'choice B end default is set');

        arrowModeHelper.setArrowMode(interaction, false);
        assert.strictEqual(choiceA.attr('data-start'), undefined, 'choice attributes are cleared when disabling');
        assert.strictEqual(choiceB.attr('data-end'), undefined, 'all choices are cleared when disabling');
    });

    QUnit.test('exclusive direction toggle keeps only selected side enabled', function (assert) {
        assert.expect(4);
        const interaction = createInteraction();
        const choice = interaction.getChoices().a;

        arrowModeHelper.setChoiceDirection(choice, true, true);
        arrowModeHelper.setExclusiveChoiceDirection(choice, 'start', true);
        assert.deepEqual(
            arrowModeHelper.getChoiceDirection(choice),
            { start: true, end: false },
            'start selection disables end'
        );

        arrowModeHelper.setChoiceDirection(choice, true, true);
        arrowModeHelper.setExclusiveChoiceDirection(choice, 'end', true);
        assert.deepEqual(
            arrowModeHelper.getChoiceDirection(choice),
            { start: false, end: true },
            'end selection disables start'
        );

        arrowModeHelper.setExclusiveChoiceDirection(choice, 'start', false);
        assert.strictEqual(arrowModeHelper.getChoiceDirection(choice).end, true, 'disabling start keeps end untouched');

        arrowModeHelper.setExclusiveChoiceDirection(choice, 'end', false);
        assert.strictEqual(arrowModeHelper.getChoiceDirection(choice).start, false, 'disabling end keeps start untouched');
    });
});
