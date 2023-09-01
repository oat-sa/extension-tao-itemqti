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

        $form.html(formTpl({
            // tpl data for the interaction
            lowerBound : parseFloat(interaction.attr('lowerBound')),
            upperBound : parseFloat(interaction.attr('upperBound')),
            orientation : interaction.attr('orientation'),
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

        // TODO clean old logic after UX review, tech debt
        // TODO orientation in Item runner tao-item-runner-qti-fe/src/qtiCommonRenderer/renderers/interactions/SliderInteraction.js
        // // -- orientation Callback
        // callbacks.orientation = function(interaction, attrValue, attrName){
        //     interaction.attr('orientation', attrValue);

        //     var orientation = (interaction.attr('orientation')) ? interaction.attr('orientation') : 'horizontal';
        //     var reverse = interaction.attr('reverse');

        //     _widget.$container.find('.qti-slider').noUiSlider({ 'orientation': interaction.attr('orientation') }, true);
        // };

        // TODO clean old logic after UX review, tech debt
        // TODO reverse in Item runner tao-item-runner-qti-fe/src/qtiCommonRenderer/renderers/interactions/SliderInteraction.js
        // // -- reverse Callback
        // callbacks.reverse = function(interaction, attrValue, attrName){

        //     interaction.attr('reverse', !!attrValue);

        //     var reverse = interaction.attr('reverse');
        //     var lowerBound = parseInt(interaction.attr('lowerBound'));
        //     var upperBound = parseInt(interaction.attr('upperBound'));
        //     var $sliderElt = _widget.$container.find('.qti-slider');
        //     var start = (reverse) ? upperBound : lowerBound;
        //     $sliderElt.noUiSlider({ start: start }, true);

        //     _widget.$container.find('span.qti-slider-cur-value').text(lowerBound);
        //     _widget.$container.find('.slider-min').text(!reverse ? lowerBound : upperBound);
        //     _widget.$container.find('.slider-max').text(!reverse ? upperBound : lowerBound);
        // };

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

        // TODO clean old logic after UX review, tech debt
        // // -- stepLabel Callback
        // callbacks.stepLabel = function(interaction, attrValue, attrName){

        //     interaction.attr('stepLabel', !!attrValue);

        //     _widget.$container.find('span.slider-middle').remove();

        //     if (interaction.attr('stepLabel')) {
        //         var upperBound = interaction.attr('upperBound');
        //         var lowerBound = interaction.attr('lowerBound');
        //         var step = interaction.attr('step');
        //         var reverse = interaction.attr('reverse');

        //         var steps = parseInt((upperBound - lowerBound) / step);
        //         var middleStep = parseInt(steps / 2);
        //         var leftOffset = (100 / steps) * middleStep;
        //         var middleValue = (reverse) ? upperBound - middleStep * step : lowerBound + middleStep * step;
        //         _widget.$container.find('.slider-min').after('<span class="slider-middle" style="left:' + leftOffset + '%">' + middleValue + '</span>');
        //     }
        // };

        formElement.setChangeCallbacks($form, interaction, callbacks);
    };
    return SliderInteractionStateQuestion;
});
