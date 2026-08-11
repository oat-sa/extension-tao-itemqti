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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HottextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse'
], function(_, __, stateFactory, Correct, commonRenderer, instructionMgr, PciResponse){
    'use strict';

    /**
     * Initialize the state: use the common renderer to set the correct response.
     */
    function initCorrectState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        //enable the checkbox to enable user selection
        this.widget.$original.find('.hottext-checkmark > input').removeProp('disabled');

        //really need to destroy before ?
        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);
        
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
     * Exit the correct state
     */
    function exitCorrectState(){
        var widget = this.widget;
        var interaction = widget.element;

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
     * The correct answer state for the hottext interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Correct
     * @exports taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/states/Correct
     */
    return stateFactory.create(Correct, initCorrectState, exitCorrectState);
});
