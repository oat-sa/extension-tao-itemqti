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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/helpers/stringResponse',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function (_, __, stringResponseHelper, stateFactory, Custom, renderer, instructionMgr, answerState) {
    'use strict';

    function start() {
        const interaction = this.widget.element;
        const response = interaction.getResponseDeclaration();
        const correctResponse = stringResponseHelper.getCorrectResponse(response);

        renderer.enable(interaction);
        renderer.setText(interaction, correctResponse);

        instructionMgr.appendInstruction(interaction, __('Please type the correct response below.'));

        this.widget.$container.on('responseChange.qti-widget', function () {
            stringResponseHelper.setCorrectResponse(response, renderer.getResponse(interaction).base.string);
        });
    }

    function exit() {
        answerState.createOutcomeScore(this.widget);
        const interaction = this.widget.element;
        renderer.clearText(interaction);

        // Make sure to adjust the response when exiting the state even if not modified
        const response = this.widget.element.getResponseDeclaration();
        stringResponseHelper.rewriteCorrectResponse(response);

        instructionMgr.removeInstructions(this.widget.element);
        this.widget.$container.off('responseChange.qti-widget');
    }

    return stateFactory.create(Custom, start, exit);
});
