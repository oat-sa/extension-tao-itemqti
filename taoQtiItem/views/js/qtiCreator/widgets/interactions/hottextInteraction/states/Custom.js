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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HottextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function(_, __, stateFactory, Custom, commonRenderer, instructionMgr, PciResponse, answerState){
    'use strict';

    /**
     * Initialize the custom state
     */
    function initCustomState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        //enable the checkbox to enable user selection
        this.widget.$original.find('.hottext-checkmark > input').removeProp('disabled');

        //add a specific instruction
        instructionMgr.appendInstruction(interaction, __('Please select the correct hottext choices below.'));
        
        //use the common Renderer
        commonRenderer.render.call(interaction.getRenderer(), interaction);

        commonRenderer.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));

        widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(PciResponse.unserialize(data.response, interaction));
        });
    }

    /**
     * Exit the custom state
     */
    function exitCustomState(){
        var widget = this.widget;
        var interaction = widget.element;
        answerState.createOutcomeScore(widget);

        //always restore the checkbox to readonly before leaving the state
        this.widget.$original.find('.hottext-checkmark > input').prop('disabled', 'disabled');

        //stop listening responses changes
        widget.$container.off('responseChange.qti-widget');

        //destroy the common renderer
        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);
        instructionMgr.removeInstructions(interaction);
    }

    /**
     * The custom answer state for the hottext interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Custom
     * @exports taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/states/Custom
     */
    return stateFactory.create(Custom, initCustomState, exitCustomState);
});
