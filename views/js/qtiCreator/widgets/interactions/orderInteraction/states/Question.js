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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 */

define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/order',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'services/features',
    'ui/liststyler'
], function (
    stateFactory,
    Question,
    formElement,
    minMaxComponentFactory,
    formTpl,
    sizeAdapter,
    features
) {
    'use strict';

    var OrderInteractionStateQuestion = stateFactory.extend(Question);

    OrderInteractionStateQuestion.prototype.initForm = function initForm(){

        var callbacks;
        var widget      = this.widget;
        var $form       = this.widget.$form;
        var interaction = this.widget.element;
        var $choiceArea = this.widget.$container.find('.choice-area');
        var $resultArea = this.widget.$container.find('.result-area');
        var $interaction = this.widget.$container.find('.qti-interaction');
        var $iconAdd = this.widget.$container.find('.icon-add-to-selection');
        var $iconRemove = this.widget.$container.find('.icon-remove-from-selection');

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            horizontal : interaction.attr('orientation') === 'horizontal',
            enabledFeatures: {
                shuffleChoices: features.isVisible('taoQtiItem/creator/interaction/order/property/shuffle'),
                orientation: features.isVisible('taoQtiItem/creator/interaction/order/property/orientation')
            }
        }));

        //usual min/maxChoices control
        minMaxComponentFactory($form.find('.min-max-panel'), {
            min : { value : parseInt(interaction.attr('minChoices'), 10) || 0 },
            max : { value : parseInt(interaction.attr('maxChoices'), 10) || 0 },
            upperThreshold : interaction.getChoices().length
        }).on('render', function(){
            var self = this;
            widget.on('choiceCreated choiceDeleted', function(data){
                if(data.interaction.serial === interaction.serial){
                    self.updateThresholds(1, interaction.getChoices().length);
                }
            });
        });

        formElement.initWidget($form);

        //data change callbacks with the usual min/maxChoices
        callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices', {updateCardinality:false});

        //data change for shuffle
        callbacks.shuffle = formElement.getAttributeChangeCallback();

        //data change for orientation, change also the current css class
        callbacks.orientation = function(interaction, value){
            interaction.attr('orientation', value);
            $interaction.attr('data-orientation', value);

            if(value === 'horizontal'){
                $choiceArea.addClass('horizontal').removeClass('vertical');
                $resultArea.addClass('horizontal').removeClass('vertical');
                $interaction.addClass('qti-horizontal').removeClass('qti-vertical');
                $iconAdd.addClass('icon-down').removeClass('icon-right');
                $iconRemove.addClass('icon-up').removeClass('icon-left');
            } else {
                $choiceArea.addClass('vertical').removeClass('horizontal');
                $resultArea.addClass('vertical').removeClass('horizontal');
                $interaction.addClass('qti-vertical').removeClass('qti-horizontal');
                $iconAdd.addClass('icon-right').removeClass('icon-down');
                $iconRemove.addClass('icon-left').removeClass('icon-up');

            }
        };

        formElement.setChangeCallbacks($form, interaction, callbacks);

        //adapt size
        if(interaction.attr('orientation') === 'horizontal') {
            sizeAdapter.adaptSize(widget);
        }

        widget.on('choiceCreated', function(){
            if(interaction.attr('orientation') === 'horizontal') {
                sizeAdapter.adaptSize(widget);
            }
        });
    };

    return OrderInteractionStateQuestion;
});
