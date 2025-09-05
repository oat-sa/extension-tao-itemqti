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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/GapMatchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function(_, __,stateFactory, Custom, commonRenderer, instructionMgr, PciResponse, answerState){

    var GapMatchInteractionStateCustom = stateFactory.create(Custom, function(){

        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        var corrects  = _.values(response.getCorrect());

        var instruction;
        var bodyLength = 0;
        var numberOfGaps = 0;
        if (interaction && interaction.bdy && interaction.bdy.bdy) {
            bodyLength = interaction.bdy.bdy.length;
        }
        if (interaction && interaction.bdy && interaction.bdy.elements) {
            numberOfGaps = Object.keys(interaction.bdy.elements).length;
        }

        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);

        //add a specific instruction
        if (bodyLength === 0) {
            instruction = __('This interaction has no text defined in question mode.');
        }
        else if (numberOfGaps === 0) {
            instruction = __('Please add one or more gaps to the text in question mode.');
        }
        else {
            instruction = __('Please fill the gap with the correct choices.');
        }
        instructionMgr.appendInstruction(interaction, instruction);

        //use the common Renderer
        commonRenderer.render.call(interaction.getRenderer(), interaction);

        commonRenderer.setResponse(
            interaction,
            PciResponse.serialize(_.invokeMap(corrects, String.prototype.split, ' '), interaction)
        );

        widget.$container.on('responseChange.qti-widget', function(e, data){
            const type = response.attr('cardinality') === 'single' ? 'base' : 'list';
            if(data.response && data.response[type]){
                if(type === 'base'){
                    response.setCorrect(data.response.base.directedPair.join(' '));
                } else {
                    response.setCorrect(
                        _.map(data.response.list.directedPair, function(pair){
                            return pair.join(' ');
                        })
                    );
                }
            } else {
                response.setCorrect([]);
            }
        });

    }, function(){
        var widget = this.widget;
        var interaction = this.widget.element;
        answerState.createOutcomeScore(widget);

        //stop listening responses changes
        widget.$container.off('responseChange.qti-widget');

        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);

        instructionMgr.removeInstructions(interaction);
    });

    return GapMatchInteractionStateCustom;
});
