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
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/associate',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'services/features'
], function (
    _, 
    stateFactory, 
    Question, 
    formElement, 
    minMaxComponentFactory, 
    formTpl, 
    sizeAdapter, 
    features
) {
    'use strict';

    var AssociateInteractionStateQuestion = stateFactory.extend(Question);

    AssociateInteractionStateQuestion.prototype.initForm = function initForm(){

       var widget      = this.widget;
       var $form       = this.widget.$form;
       var interaction = this.widget.element;

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            enabledFeatures: {
                shuffleChoices: features.isVisible('taoQtiItem/creator/interaction/associate/property/shuffle')
            }
        }));

        minMaxComponentFactory($form.find('.min-max-panel'), {
            min : {
                fieldName: 'minAssociations',
                value:     _.parseInt(interaction.attr('minAssociations')) || 0,
                toggler:   false
            },
            max : {
                fieldName: 'maxAssociations',
                value:     _.parseInt(interaction.attr('maxAssociations')) || 0,
                toggler:   false
            },
            lowerThreshold : 0,
            upperThreshold : 100     // arbitrary value!
        }).on('change', function(){
            //TODO refresh the associations list view
        });


        formElement.initWidget($form);

        //init data change callbacks
        var callbacks = formElement.getMinMaxAttributeCallbacks('minAssociations', 'maxAssociations');
        callbacks.shuffle = formElement.getAttributeChangeCallback();
        formElement.setChangeCallbacks($form, interaction, callbacks);

        //adapt size
        sizeAdapter.adaptSize(widget);
        widget.on('choiceCreated', function(){
            sizeAdapter.adaptSize(widget);
        });
    };

    return AssociateInteractionStateQuestion;
});
