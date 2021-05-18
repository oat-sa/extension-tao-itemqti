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
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'lodash',
    'i18n'
], function($, stateFactory, Correct, instructionMgr, _, __){
    'use strict';
    var TextEntryInteractionStateCorrect = stateFactory.create(Correct, function start(){

        var $container = this.widget.$container,
            response = this.widget.element.getResponseDeclaration(),
            correct = _.values(response.getCorrect()).pop() || '';

        $container.find('tr[data-edit=correct] input[name=correct]').focus().val(correct);
        $container.on('keyup.correct', 'tr[data-edit=correct] input[name=correct]', function(){
            var value = $(this).val();
            if(value){
                response.setCorrect(value);
            }else{
                response.resetCorrect();
            }
        });
        instructionMgr.appendInstruction(this.widget.element, __('Please type the correct response in the box below.'));

    }, function exit(){

        this.widget.$container.off('.correct');
        instructionMgr.removeInstructions(this.widget.element);

    });

    return TextEntryInteractionStateCorrect;
});
