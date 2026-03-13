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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicAssociateInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/helpers/arrowRendering',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/helpers/arrowResponse'
], function(_, __, stateFactory, Correct, commonRenderer, instructionMgr, PciResponse, arrowRenderingHelper, arrowResponseHelper){

    'use strict';

    /**
     * Initialize the state: use the common renderer to set the correct response.
     */
    function initCorrectState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var corrects  = _.values(response.getCorrect());
        var isSanitizing = false;
        var instructionMessage = __('Please set the correct associations by linking the choices.');
        var instruction;

        if (_.isFunction(widget._detachArrowReverseControl)) {
            widget._detachArrowReverseControl();
            widget._detachArrowReverseControl = null;
        }

        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);

        if(!interaction.paper){
            return;
        }
        
        instructionMessage = arrowResponseHelper.getInstructionMessage(interaction, instructionMessage);

        //add a specific instruction
        instruction = instructionMgr.appendInstruction(interaction, instructionMessage);
        
        //use the common Renderer
        commonRenderer.render.call(interaction.getRenderer(), interaction);

        corrects = _.invokeMap(corrects, String.prototype.split, ' ');
        corrects = arrowResponseHelper.sanitizePairs(interaction, corrects);
        response.setCorrect(
            _.map(corrects, function(pair){
                return pair.join(' ');
            })
        );
        commonRenderer.setResponse(interaction, PciResponse.serialize(corrects, interaction));
        arrowRenderingHelper.scheduleApply(interaction);

  

        widget.$container.on('responseChange.qti-widget', function(e, data){
           var type = response.attr('cardinality') === 'single' ? 'base' : 'list';
           var rawPairs;
           if(isSanitizing){
                return;
           }
           rawPairs = arrowResponseHelper.extractResponsePairs(data && data.response, type);
           if(rawPairs !== null){
                var sanitizedResponse = arrowResponseHelper.sanitizePairChange(interaction, rawPairs);
                var pairs = sanitizedResponse.pairs;
                if (sanitizedResponse.changed) {
                    arrowResponseHelper.showInvalidDirectionWarning(instruction);
                    isSanitizing = true;
                    commonRenderer.resetResponse(interaction);
                    commonRenderer.setResponse(interaction, PciResponse.serialize(pairs, interaction));
                    isSanitizing = false;
                }
                response.setCorrect(
                    _.map(pairs, function(pair){
                        return pair.join(' ');
                    })
                );
           }
            arrowRenderingHelper.scheduleApply(interaction);
        });

    }

    /**
     * Exit the correct state
     */
    function exitCorrectState(){
        var widget = this.widget;
        var interaction = widget.element;
        
        if(!interaction.paper){
            return;
        }

        //stop listening responses changes
        widget.$container.off('responseChange.qti-widget');
        if (_.isFunction(widget._detachArrowReverseControl)) {
            widget._detachArrowReverseControl();
            widget._detachArrowReverseControl = null;
        }

        //destroy the common renderer
        commonRenderer.resetResponse(interaction); 
        commonRenderer.destroy(interaction); 
        instructionMgr.removeInstructions(interaction);

        //initialize again the widget's paper
        interaction.paper = widget.createPaper();
        widget.createChoices();
    }

    /**
     * The correct answer state for the graphicAssociate interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Correct
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Correct
     */
    return stateFactory.create(Correct, initCorrectState, exitCorrectState);
});
