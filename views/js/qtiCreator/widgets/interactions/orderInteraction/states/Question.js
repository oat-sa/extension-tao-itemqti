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

define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/order',
    'lodash',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'ui/liststyler'
], function(stateFactory, Question, formElement, interactionFormElement, formTpl, _, sizeAdapter){

    'use strict';

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    ChoiceInteractionStateQuestion.prototype.initForm = function(updateCardinality){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            $choiceArea = _widget.$container.find('.choice-area');

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            maxChoices : parseInt(interaction.attr('maxChoices')),
            minChoices : parseInt(interaction.attr('minChoices')),
            choicesCount : _.size(_widget.element.getChoices()),
            horizontal : interaction.attr('orientation') === 'horizontal'
        }));


        formElement.initWidget($form);

        //data change callbacks with the usual min/maxChoices
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minChoices', 'maxChoices', {updateCardinality:updateCardinality});

        //data change for shuffle
        callbacks.shuffle = formElement.getAttributeChangeCallback();

        //data change for orientation, change also the current css class
        callbacks.orientation = function(interaction, value){
            interaction.attr('orientation', value);
            if(value === 'horizontal'){
                $choiceArea.addClass('horizontal');
            } else {
                $choiceArea.removeClass('horizontal');
            }
        };

        formElement.setChangeCallbacks($form, interaction, callbacks);

        interactionFormElement.syncMaxChoices(_widget);

        //modify the checkbox/radio input appearances
        _widget.on('attributeChange', function(data){

            var $checkboxIcons = _widget.$container.find('.real-label > span');

            if(data.element.serial === interaction.serial && data.key === 'maxChoices'){
                if(parseInt(data.value) === 1){
                    //radio
                    $checkboxIcons.removeClass('icon-checkbox').addClass('icon-radio');
                }else{
                    //checkbox
                    $checkboxIcons.removeClass('icon-radio').addClass('icon-checkbox');
                }
            }
        });

        //adapt size
        if(_widget.element.attr('orientation') === 'horizontal') {
            sizeAdapter.adaptSize(_widget);
        }

        _widget.on('choiceCreated', function(){
            if(_widget.element.attr('orientation') === 'horizontal') {
                sizeAdapter.adaptSize(_widget);
            }
        });
    };

    return ChoiceInteractionStateQuestion;
});
