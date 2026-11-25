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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiItem/core/Element',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/img',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/figure',
    'taoQtiItem/qtiCreator/model/Img'
], function ($, formElement, Element, imgFormTpl, figureFormTpl, Img) {
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

    [imgFormTpl, figureFormTpl].forEach(function (template, index) {
        QUnit.test(`${index ? 'Figure' : 'Image'} alternative text truncates with visible feedback`, function (assert) {
            const longText = 'é'.repeat(212);
            const $form = $('<div>').html(template({ alt: longText }));
            const $input = $form.find('input[name=alt]');
            const $feedback = $input.siblings('.alt-text-feedback');
            formElement.initWidget($form);
            assert.strictEqual($input.length, 1, 'Existing image input remains available for resource selection');
            assert.strictEqual($input.val(), 'é'.repeat(200), 'Oversized descriptions are truncated');
            assert.strictEqual($feedback.find('[data-role="alt-text-count"]').text(), '200', 'Truncated value is counted');
            assert.ok($feedback.hasClass('limit-reached'), 'Counter uses the red warning state');
            assert.notOk($feedback.find('[data-role="alt-text-limit"]').prop('hidden'), 'Limit message is shown');
            assert.strictEqual($feedback.find('[data-role="alt-text-limit"]').text(), 'Alternative text was truncated from 212 to 200 characters.');
            assert.ok($input[0].checkValidity(), 'The corrected value is valid');
            $input.val('é🌍<&').trigger('input');
            assert.strictEqual($feedback.find('[data-role="alt-text-count"]').text(), '4', 'Unicode input updates the count');
            assert.notOk($feedback.hasClass('limit-reached'), 'Warning clears below the threshold');
            assert.ok($feedback.find('[data-role="alt-text-limit"]').prop('hidden'), 'Message clears below the threshold');
            $input.val('x'.repeat(200)).trigger('change');
            assert.strictEqual($feedback.find('[data-role="alt-text-count"]').text(), '200', 'Resource-picker changes update the counter');
            assert.ok($feedback.hasClass('limit-reached'), 'Warning appears at the threshold');
            $input.val('').trigger('input');
            assert.strictEqual($feedback.find('[data-role="alt-text-count"]').text(), '0', 'Clearing resets the counter');
            assert.notOk($feedback.hasClass('limit-reached'));
            $form.remove();
        });
    });

    QUnit.test('alternative text counter truncates at 200 Unicode code points', function (assert) {
        const $form = $('<div><textarea data-alt-text></textarea>' +
            '<div class="alt-text-feedback"><span data-role="alt-text-limit" hidden>Character limit reached</span>' +
            '<span data-role="alt-text-count"></span></div></div>');
        const $input = $form.find('textarea');
        const $feedback = $form.find('.alt-text-feedback');
        formElement.initWidget($form);

        ['', 'é🌍<&"\'', 'x'.repeat(199), 'x'.repeat(200), 'x'.repeat(212), ''].forEach(function (value) {
            $input.val(value).trigger('input');
            const limited = Array.from(value).slice(0, 200).join('');
            const length = Array.from(limited).length;
            assert.strictEqual($feedback.find('[data-role="alt-text-count"]').text(), String(length));
            assert.strictEqual($feedback.hasClass('limit-reached'), length >= 200);
            assert.strictEqual($feedback.find('[data-role="alt-text-limit"]').prop('hidden'), length < 200);
            assert.strictEqual($input.val(), limited, 'Only the first 200 code points are kept');
            assert.ok($input[0].checkValidity(), 'Truncation leaves a valid value');
        });
        $form.remove();
    });

    QUnit.test('typing, picker metadata and IME keep image alternative text and model consistent', function (assert) {
        const image = new Img('bounded_image_input', { src: 'image.png', alt: '' });
        const $form = $('<div>').html(imgFormTpl({ alt: '' }));
        const $input = $form.find('input[name=alt]');
        formElement.initWidget($form);
        formElement.setChangeCallbacks($form, image, { alt: formElement.getAttributeChangeCallback(true) });
        $input.val('🌍'.repeat(201)).trigger('input');
        assert.strictEqual(image.attr('alt'), '🌍'.repeat(200), 'Paste updates the model without waiting for blur');
        image.attr('alt', 'é'.repeat(5000));
        $input.val(image.attr('alt')).trigger('change');
        assert.strictEqual(image.attr('alt'), 'é'.repeat(200), 'Picker-style model and field assignment is reconciled');
        assert.ok($form.find('[data-role="alt-text-limit"]').text().includes('5000'));
        $input.trigger('compositionstart').val(`${'x'.repeat(199)}🌍🌍`).trigger('input').trigger('keyup');
        assert.strictEqual($input.val(), `${'x'.repeat(199)}🌍🌍`, 'Composition is not interrupted');
        assert.strictEqual(image.attr('alt'), 'é'.repeat(200), 'Partial composition is not saved into the model');
        $input.trigger('compositionend');
        assert.strictEqual(image.attr('alt'), `${'x'.repeat(199)}🌍`, 'Completed composition is bounded safely');
        assert.strictEqual($input.val(), image.attr('alt'));
        $input.val('').trigger('input');
        assert.strictEqual(image.attr('alt'), '', 'Clearing remains supported');
        $form.remove();
    });

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

    QUnit.test('max attribute with choiceInteraction uses zero when input is disabled', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Disabled input should force maxChoices to 0');
        };

        callbacks.maxChoices.call({ disabled: true }, element, 2, 'maxChoices');
    });

    QUnit.test('max attribute with choiceInteraction uses zero when input has disabled class', function (assert) {
        assert.expect(2);
        const callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices');

        const element = elementFactory('choiceInteraction');
        element.removeAttr = function () {
            throw new Error('Attribute should not be removed');
        };
        element.attr = function (actualName, actualValue) {
            assert.ok(actualName === 'maxChoices', 'Correct name should be used in set attribute callback');
            assert.ok(actualValue === 0, 'Disabled class should force maxChoices to 0');
        };

        const disabledInput = $('<input class="disabled" />')[0];
        callbacks.maxChoices.call(disabledInput, element, 2, 'maxChoices');
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
