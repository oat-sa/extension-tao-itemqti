/*
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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/Widget'
], function ($, SliderQuestionState, SliderInteractionWidget) {
    'use strict';

    const defaults = {
        responseIdentifier: 'RESPONSE',
        lowerBound: 0,
        upperBound: 100,
        step: 1,
        stepLabel: false
    };

    function createInteraction(attrs) {
        const values = $.extend({}, defaults, attrs || {});

        return {
            attr(name, value) {
                if (typeof value !== 'undefined') {
                    values[name] = value;
                    return this;
                }

                return values[name];
            },
            getAttributes() {
                return values;
            },
            getContainer() {
                return this.$container;
            },
            getSerial() {
                return 'slider-interaction-serial';
            }
        };
    }

    function createWidget(attrs) {
        const $fixture = $('#qunit-fixture');
        const $itemBody = $('<div class="qti-itemBody" />').appendTo($fixture);
        const $container = $(
            '<div class="qti-interaction qti-slider-horizontal" data-serial="slider-interaction-serial">' +
                '<div class="qti-slider"></div>' +
                '<div class="qti-slider-values">' +
                    '<span class="slider-min"></span>' +
                    '<span class="slider-max"></span>' +
                '</div>' +
                '<div class="qti-slider-cur-value">' +
                    '<span class="qti-slider-cur-value"></span>' +
                '</div>' +
                '<input type="hidden" class="qti-slider-value" />' +
            '</div>'
        ).appendTo($itemBody);
        const interaction = createInteraction(attrs);
        const widget = {
            $form: $('<form />').appendTo($fixture),
            $itemBody,
            $container,
            element: interaction,
            renderCount: 0,
            rerenderSlider(interactionParam) {
                this.renderCount++;
                SliderInteractionWidget.rerenderSlider.call(this, interactionParam);
            },
            registerStates() {},
            createToolbar() {},
            createOkButton() {},
            listenToChoiceStates() {},
            listenToIncludeStates() {}
        };

        interaction.$container = $container;
        $container.find('.slider-min').text(interaction.attr('lowerBound'));
        $container.find('.slider-max').text(interaction.attr('upperBound'));
        $container.find('span.qti-slider-cur-value').text(interaction.attr('lowerBound'));
        $container.find('.qti-slider-value').val(interaction.attr('lowerBound'));

        return widget;
    }

    function initForm(attrs) {
        const widget = createWidget(attrs);
        const state = new SliderQuestionState(widget);

        state.initForm();

        return widget;
    }

    function panelText($panel) {
        return $panel.text().replace(/\s+/g, ' ').trim();
    }

    function getGeneratedSliderCounts(widget) {
        return {
            slider: widget.$container.children('.qti-slider').length,
            values: widget.$container.children('.qti-slider-values').length,
            currentValue: widget.$container.children('.qti-slider-cur-value').length,
            value: widget.$container.children('.qti-slider-value').length
        };
    }

    function assertSingleSlider(assert, widget) {
        const counts = getGeneratedSliderCounts(widget);

        assert.strictEqual(counts.slider, 1, 'has one slider element');
        assert.strictEqual(counts.values, 1, 'has one label group');
        assert.strictEqual(counts.currentValue, 1, 'has one current-value group');
        assert.strictEqual(counts.value, 1, 'has one hidden value input');
    }

    function assertSliderLabels(assert, widget, expectedMin, expectedMax) {
        assert.strictEqual(widget.$container.find('.slider-min').text(), String(expectedMin), 'min position label matches');
        assert.strictEqual(widget.$container.find('.slider-max').text(), String(expectedMax), 'max position label matches');
    }

    QUnit.module('qtiCreator/widgets/interactions/sliderInteraction/states/Question', {
        beforeEach() {
            const originalVal = $.fn.val;

            $.fn.noUiSlider = function (options) {
                if (options) {
                    this.data('noUiSliderOptions', options);
                }
                return this;
            };
            $.fn.val = function (value) {
                if (this.hasClass('qti-slider')) {
                    if (typeof value !== 'undefined') {
                        this.data('noUiSliderValue', value);
                        return this;
                    }

                    return this.data('noUiSliderValue');
                }

                return originalVal.apply(this, arguments);
            };
            this.originalVal = originalVal;
        },
        afterEach() {
            $.fn.val = this.originalVal;
        }
    });

    QUnit.test('renders panels in the expected order', assert => {
        assert.expect(4);

        const widget = initForm();
        const $panels = widget.$form.find('.panel');

        assert.ok(panelText($panels.eq(0)).includes('Lower Bound'), 'bounds panel is first');
        assert.ok(panelText($panels.eq(1)).includes('Step'), 'step panel is second');
        assert.ok(panelText($panels.eq(2)).includes('Orientation'), 'orientation panel is third');
        assert.ok(panelText($panels.eq(3)).includes('Reverse direction'), 'reverse panel is fourth');
    });

    QUnit.test('defaults to horizontal orientation and unchecked reverse', assert => {
        assert.expect(4);

        const widget = initForm();

        assert.strictEqual(
            widget.$form.find('input[name="orientation"][value="horizontal"]').prop('checked'),
            true,
            'horizontal is checked by default'
        );
        assert.strictEqual(
            widget.$form.find('input[name="orientation"][value="vertical"]').prop('checked'),
            false,
            'vertical is unchecked by default'
        );
        assert.strictEqual(
            widget.$form.find('input[name="reverse"]').prop('checked'),
            false,
            'reverse is unchecked by default'
        );
        assert.strictEqual(
            widget.$form.find('input[name="orientation"]').first().val(),
            'vertical',
            'vertical option is rendered above horizontal'
        );
    });

    QUnit.test('loads existing vertical orientation', assert => {
        assert.expect(2);

        const widget = initForm({ orientation: 'vertical' });

        assert.strictEqual(
            widget.$form.find('input[name="orientation"][value="vertical"]').prop('checked'),
            true,
            'vertical is checked'
        );
        assert.strictEqual(
            widget.$form.find('input[name="orientation"][value="horizontal"]').prop('checked'),
            false,
            'horizontal is unchecked'
        );
    });

    QUnit.test('loads existing reversed setting', assert => {
        assert.expect(1);

        const widget = initForm({ reverse: true });

        assert.strictEqual(widget.$form.find('input[name="reverse"]').prop('checked'), true, 'reverse is checked');
    });

    QUnit.test('changing orientation persists after form reinitialization', assert => {
        assert.expect(5);

        const widget = initForm();

        widget.$form
            .find('input[name="orientation"][value="vertical"]')
            .prop('checked', true)
            .trigger('change');

        assert.strictEqual(widget.element.attr('orientation'), 'vertical', 'orientation attribute is updated');
        assert.strictEqual(widget.renderCount, 1, 'slider is re-rendered after orientation changes');
        assert.strictEqual(widget.$container.find('.qti-slider').attr('disabled'), 'disabled', 'slider remains disabled');

        const state = new SliderQuestionState(widget);
        state.initForm();

        assert.strictEqual(
            widget.$form.find('input[name="orientation"][value="vertical"]').prop('checked'),
            true,
            'vertical remains selected after reinitialization'
        );
        assert.strictEqual(
            widget.$form.find('input[name="orientation"][value="horizontal"]').prop('checked'),
            false,
            'horizontal remains unselected after reinitialization'
        );
    });

    QUnit.test('invalid orientation falls back to horizontal', assert => {
        assert.expect(2);

        const widget = initForm();

        widget.$form
            .find('input[name="orientation"][value="vertical"]')
            .val('diagonal')
            .prop('checked', true)
            .trigger('change');

        assert.strictEqual(widget.element.attr('orientation'), 'horizontal', 'invalid orientation falls back');
        assert.strictEqual(widget.renderCount, 1, 'slider is re-rendered after invalid orientation changes');
    });

    QUnit.test('changing reverse persists after form reinitialization', assert => {
        assert.expect(4);

        const widget = initForm();

        widget.$form.find('input[name="reverse"]').prop('checked', true).trigger('change');

        assert.strictEqual(widget.element.attr('reverse'), true, 'reverse attribute is updated');
        assert.strictEqual(widget.renderCount, 1, 'slider is re-rendered after reverse changes');
        assert.strictEqual(widget.$container.find('.qti-slider').attr('disabled'), 'disabled', 'slider remains disabled');

        const state = new SliderQuestionState(widget);
        state.initForm();

        assert.strictEqual(
            widget.$form.find('input[name="reverse"]').prop('checked'),
            true,
            'reverse remains checked after reinitialization'
        );
    });

    QUnit.test('repeated orientation and reverse changes do not duplicate generated slider parts', assert => {
        assert.expect(10);

        const widget = initForm();

        widget.$form.find('input[name="orientation"][value="vertical"]').prop('checked', true).trigger('change');
        widget.$form.find('input[name="orientation"][value="horizontal"]').prop('checked', true).trigger('change');
        widget.$form.find('input[name="reverse"]').prop('checked', true).trigger('change');
        widget.$form.find('input[name="reverse"]').prop('checked', false).trigger('change');

        assert.strictEqual(widget.renderCount, 4, 'slider is re-rendered after each rendering option change');
        assertSingleSlider(assert, widget);
        assert.strictEqual(widget.$container.find('.qti-slider').attr('disabled'), 'disabled', 'slider remains disabled');
        assert.strictEqual(widget.$container.hasClass('qti-slider-horizontal'), true, 'horizontal class is present');
        assert.strictEqual(widget.$container.hasClass('qti-slider-vertical'), false, 'stale vertical class is removed');
        assertSliderLabels(assert, widget, 0, 100);
    });

    QUnit.test('item direction and writing-mode events re-render through the widget helper', assert => {
        assert.expect(8);

        const widget = createWidget();

        SliderInteractionWidget.initCreator.call(widget);

        widget.$itemBody.trigger('item-dir-changed');

        assert.strictEqual(widget.renderCount, 1, 'direction event re-renders the slider');
        assertSingleSlider(assert, widget);
        assert.strictEqual(widget.$container.find('.qti-slider').attr('disabled'), 'disabled', 'slider remains disabled');

        widget.$itemBody.addClass('writing-mode-vertical-rl').trigger('item-writing-mode-changed');

        assert.strictEqual(widget.renderCount, 2, 'writing-mode event re-renders the slider');
        assert.strictEqual(widget.$container.find('.qti-slider').attr('disabled'), 'disabled', 'slider remains disabled again');
    });

    QUnit.test('horizontal LTR and RTL positioning follows effective direction', assert => {
        assert.expect(6);

        const ltrWidget = createWidget({
            lowerBound: 10,
            upperBound: 90,
            orientation: 'horizontal',
            reverse: false
        });
        ltrWidget.$container.css('direction', 'ltr');
        ltrWidget.rerenderSlider(ltrWidget.element);

        assert.strictEqual(ltrWidget.$container.hasClass('qti-slider-horizontal'), true, 'LTR slider is horizontal');
        assertSliderLabels(assert, ltrWidget, 10, 90);

        const rtlWidget = createWidget({
            lowerBound: 10,
            upperBound: 90,
            orientation: 'horizontal',
            reverse: false
        });
        rtlWidget.$container.css('direction', 'rtl');
        rtlWidget.rerenderSlider(rtlWidget.element);

        assert.strictEqual(rtlWidget.$container.hasClass('qti-slider-horizontal'), true, 'RTL slider is horizontal');
        assertSliderLabels(assert, rtlWidget, 90, 10);
    });

    QUnit.test('vertical positioning follows reverse without changing bounds', assert => {
        assert.expect(8);

        const widget = createWidget({
            lowerBound: 5,
            upperBound: 25,
            orientation: 'vertical',
            reverse: false
        });
        widget.rerenderSlider(widget.element);

        assert.strictEqual(widget.$container.hasClass('qti-slider-vertical'), true, 'slider is vertical');
        assert.strictEqual(widget.$container.hasClass('qti-slider-horizontal'), false, 'stale horizontal class is removed');
        assertSliderLabels(assert, widget, 5, 25);

        widget.element.attr('reverse', true);
        widget.rerenderSlider(widget.element);

        assertSliderLabels(assert, widget, 25, 5);
        assert.strictEqual(widget.element.attr('lowerBound'), 5, 'lower bound attribute is unchanged');
        assert.strictEqual(widget.element.attr('upperBound'), 25, 'upper bound attribute is unchanged');
    });

    QUnit.test('existing numeric controls still render and lower bound callback updates the attribute', assert => {
        assert.expect(6);

        const widget = initForm();

        assert.strictEqual(widget.$form.find('input[name="lowerBound"]').length, 1, 'lower bound input renders');
        assert.strictEqual(widget.$form.find('input[name="upperBound"]').length, 1, 'upper bound input renders');
        assert.strictEqual(widget.$form.find('input[name="step"]').length, 1, 'step input renders');

        widget.$form.find('input[name="lowerBound"]').val('7').trigger('change');

        assert.strictEqual(widget.element.attr('lowerBound'), 7, 'lower bound attribute is updated');
        assert.strictEqual(widget.element.attr('step'), 1, 'step callback path still keeps step attribute valid');
        assert.strictEqual(widget.$container.find('.qti-slider').val(), 7, 'slider value is updated');
    });

    QUnit.test('lower and upper bound validation still clamps as before', assert => {
        assert.expect(6);

        const invalidLowerWidget = initForm({ lowerBound: 5, upperBound: 10, step: 2 });

        invalidLowerWidget.$form.find('input[name="lowerBound"]').val('-4').trigger('change');

        assert.strictEqual(invalidLowerWidget.element.attr('lowerBound'), 0, 'invalid lower bound clamps to zero');
        assertSliderLabels(assert, invalidLowerWidget, 0, 10);

        const upperBelowLowerWidget = initForm({ lowerBound: 10, upperBound: 20, step: 5 });

        upperBelowLowerWidget.$form.find('input[name="upperBound"]').val('7').trigger('change');

        assert.strictEqual(upperBelowLowerWidget.element.attr('upperBound'), 7, 'upper bound is updated');
        assert.strictEqual(upperBelowLowerWidget.element.attr('lowerBound'), 7, 'lower bound is clamped down to upper bound');
        assert.strictEqual(
            upperBelowLowerWidget.$form.find('input[name="lowerBound"]').val(),
            '7',
            'lower bound input is clamped'
        );
    });

    QUnit.test('step validation still clamps to slider length', assert => {
        assert.expect(2);

        const widget = initForm({ lowerBound: 0, upperBound: 10, step: 20 });

        widget.$form.find('input[name="upperBound"]').val('5').trigger('change');

        assert.strictEqual(widget.element.attr('step'), 5, 'step is clamped to the slider length');
        assert.strictEqual(widget.$form.find('input[name="step"]').val(), '5', 'step input is clamped');
    });

    QUnit.test('tooltip source strings are present', assert => {
        assert.expect(2);

        const widget = initForm();
        const formText = widget.$form.text();

        assert.ok(
            formText.includes('Displays the slider bar either horizontally or vertically'),
            'orientation tooltip source string is rendered'
        );
        assert.ok(
            formText.includes('Reverse the slider bar boundaries'),
            'reverse tooltip source string is rendered'
        );
    });
});
