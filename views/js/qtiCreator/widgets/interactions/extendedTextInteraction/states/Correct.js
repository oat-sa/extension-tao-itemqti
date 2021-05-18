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
 * Copyright (c) 2014-2018 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager'
], function(_, __, stateFactory, Correct, renderer, instructionMgr){
    'use strict';

    var _createResponseWidget = function(widget){

        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var correctResponse = _.values(response.getCorrect());

        renderer.enable(interaction);
        renderer.setText(interaction, correctResponse[0]);

        instructionMgr.appendInstruction(interaction, __('Please type the correct response below.'));

        widget.$container.on('responseChange.qti-widget', function(){
            if(renderer.getResponse(interaction).base.string){
                response.setCorrect([renderer.getResponse(interaction).base.string]);
            }else{
                response.resetCorrect();
            }
        });
    };

    var _destroyResponseWidget = function(widget){

        var interaction = widget.element;
        renderer.clearText(interaction);

        instructionMgr.removeInstructions(widget.element);
        widget.$container.off('responseChange.qti-widget');
    };


    var ExtendedTextInteractionStateCorrect = stateFactory.create(Correct, function start(){

        _createResponseWidget(this.widget);

    }, function exit(){

        _destroyResponseWidget(this.widget);
    });

    return ExtendedTextInteractionStateCorrect;
});
