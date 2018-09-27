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
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/order',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'ui/liststyler'
], function(_, stateFactory, Question, formElement, minMaxComponentFactory, formTpl, sizeAdapter){
    'use strict';

    var OrderInteractionStateQuestion = stateFactory.extend(Question);

    OrderInteractionStateQuestion.prototype.initForm = function initForm(){

        var  callbacks;
        var widget      = this.widget;
        var $form       = this.widget.$form;
        var interaction = this.widget.element;
        var $choiceArea = this.widget.$container.find('.choice-area');

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            horizontal : interaction.attr('orientation') === 'horizontal'
        }));

        //usual min/maxChoices control
        minMaxComponentFactory($form.find('.min-max-panel'), {
            min : { value : _.parseInt(interaction.attr('minChoices')) || 0 },
            max : { value : _.parseInt(interaction.attr('maxChoices')) || 0 },
            upperThreshold : _.size(interaction.getChoices())
        }).on('render', function(){
            var self = this;
            widget.on('choiceCreated choiceDeleted', function(data){
                if(data.interaction.serial === interaction.serial){
                    self.updateThresholds(1, _.size(interaction.getChoices()));
                }
            });
        });

        formElement.initWidget($form);

        //data change callbacks with the usual min/maxChoices
        callbacks = formElement.getMinMaxAttributeCallbacks($form, 'minChoices', 'maxChoices', {updateCardinality:false});

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
