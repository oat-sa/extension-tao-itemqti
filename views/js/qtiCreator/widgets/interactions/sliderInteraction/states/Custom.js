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
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/SliderInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/Helper',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function(
    stateFactory,
    Custom,
    commonRenderer,
    instructionMgr,
    _,
    __,
    sliderInteractionHelper,
    answerState
){

    const SliderInteractionStateCustom = stateFactory.create(Custom, function(){
        _createResponseWidget(this.widget);
    }, function(){
        _destroyResponseWidget(this.widget);
    });

    const _createResponseWidget = function(widget){
        const interaction = widget.element;
        const response = interaction.getResponseDeclaration();
        const correctResponse = _.values(response.getCorrect());
        response.setCorrect(correctResponse);
        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));

        const $sliderElt = widget.$container.find('.qti-slider');
        $sliderElt.removeAttr('disabled');

        instructionMgr.appendInstruction(interaction, __('Please define the correct response using the slider.'));

        widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect([data.response.base.integer]);
        });
    };

    const _destroyResponseWidget = function(widget){
        answerState.createOutcomeScore(widget);
        const $sliderElt = widget.$container.find('.qti-slider');
        const lowerBound = widget.element.attributes.lowerBound;
        const interaction = widget.element;
        const responseDeclaration = interaction.getResponseDeclaration();
        const currentResponse = _.values(responseDeclaration.getCorrect());
        const responseManager = sliderInteractionHelper.responseManager(interaction, currentResponse);

        widget.isValid('sliderInteraction', responseManager.isValid(), responseManager.getErrorMessage());

        $sliderElt.attr('disabled', 'disabled');
        $sliderElt.val(lowerBound);
        widget.$container.find('span.qti-slider-cur-value').text('' + lowerBound);

        instructionMgr.removeInstructions(widget.element);
        widget.$container.off('responseChange.qti-widget');
    };

    const _formatResponse = function(response){
        return {"base" : {"integer" : response}};
    };

    return SliderInteractionStateCustom;
});
