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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
define([
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/helpers/stringResponse',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'util/locale',
    'util/converter'
], function ($, __, stringResponseHelper, stateFactory, Correct, instructionMgr, locale, converter) {
    'use strict';

    function setErrorNotification(submitButton, element, baseType) {
        submitButton.attr('disabled', true);
        instructionMgr
            .appendInstruction(
                element,
                __('This is not a valid value. Expected %s', baseType)
            );
    }

    function start() {
        const widget = this.widget;
        const element = widget.element;
        const $container = widget.$container;
        const $responseForm = widget.$responseForm;
        const $submitButton = $container.find('button.widget-ok');
        const $correctInput = $container.find('tr[data-edit=correct] input[name=correct]');
        const response = element.getResponseDeclaration();
        const attributes = response.attributes;
        const decimalSeparator = locale.getDecimalSeparator();
        let correctResponse = stringResponseHelper.getCorrectResponse(response);

        instructionMgr.removeInstructions(element);
        instructionMgr.appendInstruction(element, __('Please type the correct response in the box below.'));

        if (attributes.baseType === 'float') {
            $correctInput.attr('placeholder', __(`example: 999${decimalSeparator}99`));
            // converting preloaded number to float if it not
            correctResponse = (+correctResponse % 1) ? correctResponse : `${correctResponse}.0`;
        }

        if (attributes.baseType === 'float' && decimalSeparator !== '.') {
            $correctInput
                .focus()
                .val(correctResponse.replace('.', decimalSeparator));
        } else {
            $correctInput.focus().val(correctResponse);
        }

        $responseForm.on('change', '#responseBaseType',function () {
            if ($(this).val() === 'float') {
                $correctInput.attr('placeholder', __(`example: 999${decimalSeparator}99`));
            } else {
                $correctInput.removeAttr('placeholder');
            }
            $correctInput.val('');
            stringResponseHelper.setCorrectResponse(response, '', { trim: true });
        });
        $container.on('blur.correct', 'tr[data-edit=correct] input[name=correct]', function () {
            $submitButton.attr('disabled', false);
            instructionMgr.removeInstructions(element);
            instructionMgr.appendInstruction(element, __('Please type the correct response in the box below.'));
            const $input = $(this);
            let value = $input.val();
            let responseValue = '';
            const numericBase = attributes.base || 10;
            const convertedValue = converter.convert(value.trim());
            switch (attributes.baseType) {
                case 'integer':
                    value = locale.parseInt(convertedValue, numericBase);
                    responseValue = isNaN(value) ? '' : value;
                    // check for parsing and integer
                    if (responseValue === '' || !/^[+-]?[0-9]+(e-?\d*)?$/.test(convertedValue)) {
                        widget.isValid(widget.serial, false, __('Invalid value in correct response property.'));
                        return setErrorNotification($submitButton, element, attributes.baseType)
                    }
                    break;
                case 'float':
                    value = locale.parseFloat(convertedValue);
                    responseValue = isNaN(value) ? '' : value;
                    const regex = new RegExp(`^[+-]?[0-9]+\\${decimalSeparator}[0-9]+(e-?\\d*)?$`);
                    if (responseValue === '' || !regex.test(convertedValue)) { // check for parsing and float
                        widget.isValid(widget.serial, false, __('Invalid value in correct response property.'));
                        return setErrorNotification(
                            $submitButton,
                            element,
                            `value is a decimal number as example: 999${decimalSeparator}99`
                        );
                    }
                    break;
                case 'string':
                    responseValue = convertedValue;
                    if (responseValue === '') {
                        widget.isValid(widget.serial, false, __('Invalid value in correct response property.'));
                        return setErrorNotification($submitButton, element, attributes.baseType);
                    }
                    break;
                default:
                    return false;
            }
            widget.isValid(widget.serial, true);
            stringResponseHelper.setCorrectResponse(response, `${responseValue}`, { trim: true });
        });
    }
    function exit() {
        // Make sure to adjust the response when exiting the state even if not modified
        const widget = this.widget;
        const response = widget.element.getResponseDeclaration();
        if(response.template === "no_response_processing") {
            widget.$container.find('button.widget-ok').attr('disabled', false);
            widget.isValid(widget.serial, true);
        }
        stringResponseHelper.rewriteCorrectResponse(response, { trim: true });

        widget.$container.off('.correct');
        instructionMgr.removeInstructions(widget.element);
    }

    return stateFactory.create(Correct, start, exit);
});
