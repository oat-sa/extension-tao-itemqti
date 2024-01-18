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
    'taoQtiItem/qtiCreator/helper/textEntryConverterHelper'
], function ($, __, stringResponseHelper, stateFactory, Correct, instructionMgr, locale, textEntryConverterHelper) {
    'use strict';

    function start() {
        const element = this.widget.element;
        const $container = this.widget.$container;
        const response = element.getResponseDeclaration();
        const correctResponse = stringResponseHelper.getCorrectResponse(response);
        const $submitButton = $container.find('button.widget-ok');
        instructionMgr.removeInstructions(element);
        instructionMgr.appendInstruction(element, __('Please type the correct response in the box below.'));
        $container.find('tr[data-edit=correct] input[name=correct]').focus().val(correctResponse);
        $container.on('blur.correct', 'tr[data-edit=correct] input[name=correct]', function () {
            $submitButton.attr('disabled', false);
            instructionMgr.removeInstructions(element);
            instructionMgr.appendInstruction(element, __('Please type the correct response in the box below.'));
            const $input = $(this);
            const value = textEntryConverterHelper($input.val(), response.attributes);
            if (locale.getDecimalSeparator()  !== '.') {
                $input.val(value.replace('.', locale.getDecimalSeparator()));
            }
            if (value === '') {
                $submitButton.attr('disabled', true);
                return instructionMgr.appendInstruction(element, __('This is not a valid value'));
            }
            stringResponseHelper.setCorrectResponse(response, `${value}`, { trim: true });
        });
    }
    function exit() {
        // Make sure to adjust the response when exiting the state even if not modified
        const response = this.widget.element.getResponseDeclaration();
        stringResponseHelper.rewriteCorrectResponse(response, { trim: true });

        this.widget.$container.off('.correct');
        instructionMgr.removeInstructions(this.widget.element);
    }

    return stateFactory.create(Correct, start, exit);
});
