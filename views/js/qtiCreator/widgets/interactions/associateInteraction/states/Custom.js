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
    'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/ResponseWidget',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function(stateFactory, Custom, responseWidget, _, answerState){

    var AssociateInteractionStateCustom = stateFactory.create(Custom, function(){

        var interaction = this.widget.element,
            response = interaction.getResponseDeclaration();

        responseWidget.create(this.widget, false);
        responseWidget.setResponse(interaction, _.values(response.getCorrect()));

        this.widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(responseWidget.unformatResponse(data.response));
        });

    }, function(){
        answerState.createOutcomeScore(this.widget);
        this.widget.$container.off('responseChange.qti-widget');

        responseWidget.destroy(this.widget);
    });

    return AssociateInteractionStateCustom;
});
