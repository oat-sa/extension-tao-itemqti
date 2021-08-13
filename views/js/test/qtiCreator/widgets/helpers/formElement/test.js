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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiItem/core/Element'
], function ($, formElement, Element) {
    'use strict';

    const elementFactory = function (interactionType) {
        const element = new Element();
        element.qtiClass = interactionType;
        element.is = function (interaction) {
            return interaction === 'interaction' || interaction === interactionType;
        };
        element.isA = function (interaction) {
            return interaction === 'interaction';
        }
        element.getResponseDeclaration = function () {
            return {
                attr: function () {

                },
                getCorrect: function () {

                },
                setCorrect: function () {

                }
            }
        };

        return element;
    };

    QUnit.module('formElement');

    QUnit.test('module', function (assert) {
        assert.expect(2);

        assert.ok(typeof formElement === 'object', 'The module expose an object');
        assert.ok(typeof formElement.getMinMaxAttributeCallbacks === 'function', 'The module exposes getMinMaxAttributeCallbacks function');
    });

    QUnit.module('getMinMaxAttributeCallbacks');

    QUnit.test('min attribute with orderInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['minChoices'] === 'function', '"minChoices" is a function');

        const element = elementFactory('orderInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 3, 'Correct value should be used in set attribute callback');
        };

        callbacks.minChoices(element, '3', 'minChoices');
    });

    QUnit.test('max attribute with orderInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['maxChoices'] === 'function', '"maxChoices" is a function');

        const element = elementFactory('orderInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 2, 'Correct value should be used in set attribute callback');
        };

        callbacks.maxChoices(element, '2', 'maxChoices');
    });

    QUnit.test('min attribute with orderInteraction and empty value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('orderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.minChoices(element, undefined, 'minChoices');
    });

    QUnit.test('max attribute with orderInteraction and empty value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('orderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.maxChoices(element, undefined, 'maxChoices');
    });

    QUnit.test('min attribute with orderInteraction and zero value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('orderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.minChoices(element, 0, 'minChoices');
    });

    QUnit.test('max attribute with orderInteraction and zero value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('orderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.maxChoices(element, 0, 'maxChoices');
    });


    QUnit.test('min attribute with graphicOrderInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['minChoices'] === 'function', '"minChoices" is a function');

        const element = elementFactory('graphicOrderInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 3, 'Correct value should be used in set attribute callback');
        };

        callbacks.minChoices(element, '3', 'minChoices');
    });

    QUnit.test('max attribute with graphicOrderInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['maxChoices'] === 'function', '"maxChoices" is a function');

        const element = elementFactory('graphicOrderInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 2, 'Correct value should be used in set attribute callback');
        };

        callbacks.maxChoices(element, '2', 'maxChoices');
    });

    QUnit.test('min attribute with graphicOrderInteraction and empty value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('graphicOrderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.minChoices(element, undefined, 'minChoices');
    });

    QUnit.test('max attribute with graphicOrderInteraction and empty value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('graphicOrderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.maxChoices(element, undefined, 'maxChoices');
    });

    QUnit.test('min attribute with graphicOrderInteraction and zero value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('graphicOrderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.minChoices(element, 0, 'minChoices');
    });

    QUnit.test('max attribute with graphicOrderInteraction and zero value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('graphicOrderInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.maxChoices(element, 0, 'maxChoices');
    });


    QUnit.test('min attribute with choiceInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['minChoices'] === 'function', '"minChoices" is a function');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 3, 'Correct value should be used in set attribute callback');
        };

        callbacks.minChoices(element, '3', 'minChoices');
    });

    QUnit.test('max attribute with choiceInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['maxChoices'] === 'function', '"maxChoices" is a function');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 2, 'Correct value should be used in set attribute callback');
        };

        callbacks.maxChoices(element, '2', 'maxChoices');
    });

    QUnit.test('min attribute with choiceInteraction and empty value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.minChoices(element, undefined, 'minChoices');
    });

    QUnit.test('min attribute with choiceInteraction, allowNull and empty value', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices', { allowNull: true });

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Correct value should be used in set attribute callback');
        };

        callbacks.minChoices(element, 0, 'minChoices');
    });

    QUnit.test('max attribute with choiceInteraction and empty value', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Correct value should be used in set attribute callback');
        };

        callbacks.maxChoices(element, undefined, 'maxChoices');
    });

    QUnit.test('min attribute with choiceInteraction and zero value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'minChoices', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.minChoices(element, 0, 'minChoices');
    });

    QUnit.test('max attribute with choiceInteraction and zero value', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Correct value should be used in set attribute callback');
        };

        callbacks.maxChoices(element, 0, 'maxChoices');
    });


    QUnit.module('getLowerUpperAttributeCallbacks');

    QUnit.test('lower attribute with hotspotInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['lowerBound'] === 'function', '"lowerBound" is a function');

        const element = elementFactory('hotspotInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'lowerBound', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 3, 'Correct value should be used in set attribute callback');
        };

        callbacks.lowerBound(element, '3', 'lowerBound');
    });

    QUnit.test('upperBound attribute with hotspotInteraction and not empty value', function (assert) {
        assert.expect(4);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound');

        assert.ok(typeof callbacks === 'object', 'Callback object has been returned');
        assert.ok(typeof callbacks['upperBound'] === 'function', '"upperBound" is a function');

        const element = elementFactory('hotspotInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'upperBound', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 2, 'Correct value should be used in set attribute callback');
        };

        callbacks.upperBound(element, '2', 'upperBound');
    });

    QUnit.test('lowerBound attribute with hotspotInteraction and empty value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound');

        const element = elementFactory('hotspotInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'lowerBound', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.lowerBound(element, undefined, 'lowerBound');
    });

    QUnit.test('lowerBound attribute with hotspotInteraction, allowNull and empty value', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound', { allowNull: true });

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'lowerBound', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Correct value should be used in set attribute callback');
        };

        callbacks.lowerBound(element, 0, 'lowerBound');
    });

    QUnit.test('upperBound attribute with hotspotInteraction, disabled and empty value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound');

        const element = elementFactory('hotspotInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'upperBound', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.upperBound.call({ disabled: true }, element, undefined, 'upperBound');
    });

    QUnit.test('upperBound attribute with hotspotInteraction and empty value', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound');

        const element = elementFactory('hotspotInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'upperBound', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Correct value should be used in set attribute callback');
        };

        callbacks.upperBound(element, undefined, 'upperBound');
    });

    QUnit.test('lowerBound attribute with hotspotInteraction and zero value', function (assert) {
        assert.expect(1);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound');

        const element = elementFactory('hotspotInteraction');
        element.removeAttr = function (actualName) {
            assert.ok(actualName === 'lowerBound', 'Correct name should be used in remove attribute callback');
        };
        element.attr = function () {
            throw new Error('Attribute should not be set');
        };

        callbacks.lowerBound(element, 0, 'lowerBound');
    });

    QUnit.test('upperBound attribute with hotspotInteraction and zero value', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getLowerUpperAttributeCallbacks('lowerBound', 'upperBound');

        const element = elementFactory('hotspotInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'upperBound', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Correct value should be used in set attribute callback');
        };

        callbacks.upperBound(element, 0, 'upperBound');
    });
});
