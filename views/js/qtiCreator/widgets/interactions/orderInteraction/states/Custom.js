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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'i18n',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function(stateFactory, Custom, __, commonRenderer, answerState){

    var InlineChoiceInteractionStateCustom = stateFactory.create(Custom, function(){
        var interaction = this.widget.element,
            response = interaction.getResponseDeclaration(),
            correctResponse = _.values(response.getCorrect());

        commonRenderer.render(this.widget.element);
        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));
        

        this.widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(_unformatResponse(data.response));
        });
    }, function(){
        answerState.createOutcomeScore(this.widget);

        this.widget.$container.off('responseChange.qti-widget');

        commonRenderer.resetResponse(this.widget.element);

        commonRenderer.destroy(this.widget.element);
    });

    var _formatResponse = function(response){
        return {list : {identifier : response}};
    };

    var _unformatResponse = function(formatedResponse){
        var res = [];
        if(formatedResponse.list && formatedResponse.list.identifier){
            res = formatedResponse.list.identifier;
        }
        return res;
    };

    return InlineChoiceInteractionStateCustom;
});
