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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/slider',
    'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/Helper'
], function(_, stateFactory, Question, formElement, formTpl, sliderInteractionHelper){
    'use strict';

    const initQuestionState = function () {};

    const exitQuestionState = function exitQuestionState() {
        const _widget = this.widget;
        const interaction = _widget.element;
        const responseDeclaration = interaction.getResponseDeclaration();
        const currentResponse = _.values(responseDeclaration.getCorrect());
        const responseManager = sliderInteractionHelper.responseManager(interaction, currentResponse);

        _widget.isValid('sliderInteraction', responseManager.isValid(), responseManager.getErrorMessage());
    };

    const SliderInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    SliderInteractionStateQuestion.prototype.initForm = function(){
        const _widget = this.widget;
        const $form = _widget.$form;
        const interaction = _widget.element;
        const rawOrientation = interaction.attr('orientation');
        const orientation = ['horizontal', 'vertical'].includes(rawOrientation)
            ? rawOrientation
            : 'horizontal';

        if (rawOrientation && orientation !== rawOrientation) {
            interaction.attr('orientation', orientation);
        }

        $form.html(formTpl({
            // tpl data for the interaction
            lowerBound : parseFloat(interaction.attr('lowerBound')),
            upperBound : parseFloat(interaction.attr('upperBound')),
            orientation : orientation,
            horizontal : orientation !== 'vertical',
            reverse : !!interaction.attr('reverse'),
            step : parseInt(interaction.attr('step')),
            stepLabel : !!interaction.attr('stepLabel')
        }));

        formElement.initWidget($form);

        //  init data change callbacks
        const callbacks = {};

        // -- lowerBound Callback
        callbacks.lowerBound = (interactionParam, attrValue) => {
            let lowerBound = parseInt(attrValue, 10);

            if (isNaN(lowerBound) || lowerBound < 0) {
                lowerBound = 0;
            }

            interaction.attr('lowerBound', lowerBound);

            let upperBound = interaction.attr('upperBound');
            const sliderLength = upperBound - lowerBound;
            let step = interaction.attr('step');
            const reverse = !!interaction.attr('reverse');
            const $container = _widget.$container;
            const direction = window.getComputedStyle($container[0]).getPropertyValue('direction') || 'ltr';
            const reversedLabels = ((!reverse && direction === 'rtl') || (reverse && direction !== 'rtl'));

            // if min is greater than max change upperBound to be like lowerBound
            if (lowerBound > upperBound) {
                upperBound = lowerBound;
                $form.find('input[name="upperBound"]').val(upperBound);
                callbacks.upperBound(interaction, upperBound);
            }

            // check if the length of the slider is smaller than the step
            if (sliderLength < step && sliderLength >= 0) {
                step = sliderLength;
                $form.find('input[name="step"]').val(step);
            }
            callbacks.step(interaction, step);

            let $lowerBoundLabel = '.slider-min';
            if (reversedLabels) {
                $lowerBoundLabel = '.slider-max';
            }
            $container.find($lowerBoundLabel).text(lowerBound);
            $container.find('span.qti-slider-cur-value').text(lowerBound);

            const $qtiSlider = $container.find('.qti-slider');
            $qtiSlider.noUiSlider({ range: { min: lowerBound, max: upperBound } }, true);
            $qtiSlider.val(lowerBound);
        };

        // -- upperBound Callback
        callbacks.upperBound = (interactionParam, attrValue) => {
            let upperBound = parseInt(attrValue, 10);

            if (isNaN(upperBound) || upperBound < 0) {
                upperBound = 0;
            }

            interaction.attr('upperBound', upperBound);

            let lowerBound = interaction.attr('lowerBound');
            const sliderLength = upperBound - lowerBound;
            let step = interaction.attr('step');
            const reverse = !!interaction.attr('reverse');
            const $container = _widget.$container;
            const direction = window.getComputedStyle($container[0]).getPropertyValue('direction') || 'ltr';
            const reversedLabels = ((!reverse && direction === 'rtl') || (reverse && direction !== 'rtl'));

            // if max is smaller than min then change lowerBound to be like upperBound
            if (upperBound < lowerBound) {
                lowerBound = upperBound;
                $form.find('input[name="lowerBound"]').val(lowerBound);
                callbacks.lowerBound(interaction, lowerBound);
            }

            // check if the length of the slider is smaller than the step
            if (sliderLength < step && sliderLength >= 0) {
                step = sliderLength;
                $form.find('input[name="step"]').val(step);
            }
            callbacks.step(interaction, step);

            $form.find('input[name="step"]').incrementer('options', { max: upperBound });

            let $upperBoundLabel = '.slider-max';
            if (reversedLabels) {
                $upperBoundLabel = '.slider-min';
            }
            $container.find($upperBoundLabel).text(upperBound);
            $container
                .find('.qti-slider')
                .noUiSlider(
                    { range: { min: lowerBound, max: upperBound } },
                    true
            );
        };

        // -- orientation Callback
        callbacks.orientation = (interactionParam, attrValue) => {
            const orientation = ['horizontal', 'vertical'].includes(attrValue) ? attrValue : 'horizontal';

            interactionParam.attr('orientation', orientation);
            _widget.rerenderSlider(interactionParam);
        };

        // -- reverse Callback
        callbacks.reverse = (interactionParam, attrValue) => {
            interactionParam.attr('reverse', !!attrValue);
            _widget.rerenderSlider(interactionParam);
        };

        // -- step Callback
        callbacks.step = (interactionParam, attrValue) => {

            let step = parseInt(attrValue);

            if (isNaN(step) || step < 0) {
                step = 0;
            }

            const lowerBound = interaction.attr('lowerBound');
            const upperBound = interaction.attr('upperBound');

            const sliderLength = upperBound - lowerBound;

            interaction.attr('step', step);

            if (sliderLength >= step) {
                _widget.$container.find('.qti-slider').noUiSlider({ step }, true);
                $form.find('input[name="step"]').incrementer('options', { max: sliderLength });
            }
        };

        formElement.setChangeCallbacks($form, interaction, callbacks);
    };
    return SliderInteractionStateQuestion;
});
