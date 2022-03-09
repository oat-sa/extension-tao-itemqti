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
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'ui/liststyler'
], function(_, __, stateFactory, Question, formElement, minMaxComponentFactory, formTpl, sizeAdapter){

    'use strict';

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    // Note: any change of this needs to be reflected in CSS
    var listStylePrefix = 'list-style-';

    const NUMBER_OF_CHOICES_DEFINED ='NumberOfChoicesDefined';
    const allowedChoices = {
        none: {
            label: __('No Constraints'),
            minChoices: 0,
            maxChoices: 0
        }, optionalSingle: {
            label: __('Optional Single choice'),
            minChoices: 0,
            maxChoices: 1
        }, requiredSingle: {
            label: __('Required Single choice'),
            minChoices: 1,
            maxChoices: 1
        }, optionalMulti: {
            label: __('Optional Multiple choices'),
            minChoices: 0,
            maxChoices: NUMBER_OF_CHOICES_DEFINED
        }, requiredSingleUpToLimit: {
            label: __('Required Single answer up to limit on Multiple choices'),
            minChoices: 1,
            maxChoices: NUMBER_OF_CHOICES_DEFINED
        }, requiredAnswer: {
            label: __('Required Answer'),
            minChoices: 1,
            maxChoices: 0
        }, custom: {
            label: __('Custom choices constraints')
        }};

    function getListStyle(interaction) {
        var className = interaction.attr('class') || '',
            listStyle = className.match(/\blist-style-[\w-]+/);

        return !_.isNull(listStyle) ? listStyle.pop().replace(listStylePrefix, '') : null;
    }

    ChoiceInteractionStateQuestion.prototype.initForm = function initForm(updateCardinality){
        var callbacks;
        var widget        = this.widget;
        var $form         = widget.$form;
        var interaction   = widget.element;
        var currListStyle = getListStyle(interaction);
        var $choiceArea   = widget.$container.find('.choice-area');
        let minMaxComponent = null;
        let selectedCase = '';

        const choices = {};
        const minValue = _.parseInt(interaction.attr('minChoices'));
        const maxValue = _.parseInt(interaction.attr('maxChoices'));
        const numberOfChoices = _.size(interaction.getChoices());

        // min / max choices control, with sync values
        const createMinMaxComponent = (min = 0, max = 0) => minMaxComponentFactory($form.find('.min-max-panel'), {
            min : { value : min },
            max : { value : max },
            upperThreshold : numberOfChoices
        });

        Object.keys(allowedChoices).forEach(key => {
            let selected = false;
            const maxChoices = allowedChoices[key].maxChoices === NUMBER_OF_CHOICES_DEFINED ? numberOfChoices : allowedChoices[key].maxChoices;
            if(minValue === allowedChoices[key].minChoices && maxChoices === maxValue) {
                selected = true;
                selectedCase = key;
            }
            choices[key] = {label: allowedChoices[key].label, selected};
        });

        if(!selectedCase) {
            choices['custom'].selected = true;
            selectedCase = 'custom';
        }

        $form.html(formTpl({
            choices,
            shuffle : !!interaction.attr('shuffle'),
            horizontal : interaction.attr('orientation') === 'horizontal',
            eliminable : (/\beliminable\b/).test(interaction.attr('class'))
        }));
        // create minMaxComponent after form will be set in DOM
        if(selectedCase === 'custom') {
            minMaxComponent = createMinMaxComponent(minValue || 0, maxValue || 0);
        }

        $form.find('[data-list-style]').liststyler( { selected: currListStyle })
            .on('stylechange.liststyler', function(e, data) {
                // model
                interaction.removeClass(listStylePrefix + data.oldStyle);
                // current visual
                $choiceArea.removeClass(listStylePrefix + data.oldStyle);
                if(data.newStyle !== 'none'){
                    interaction.addClass(listStylePrefix + data.newStyle);
                    $choiceArea.addClass(listStylePrefix + data.newStyle);
                }
            });


        // activate the elimination buttons
        $form.find('[name="eliminable"]').on('change.eliminable', function() {
            // model
            interaction.toggleClass('eliminable', this.checked);
            // current visual
            widget.$original.toggleClass('eliminable', this.checked);
            if (!this.checked) {
                widget.$original.find('.eliminated').removeClass('eliminated');
            }
            // indicate whether this has been unchecked on purpose
            interaction.toggleClass('eliminability-deselected', !this.checked);
        });

        formElement.initWidget($form);

        //data change callbacks with the usual min/maxChoices
        callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices', { updateCardinality: updateCardinality });

        //data change for shuffle
        callbacks.shuffle = formElement.getAttributeChangeCallback();

        //data change for orientation, change also the current css class
        callbacks.orientation = function(interactionParam, value){
            interactionParam.attr('orientation', value);
            if(value === 'horizontal'){
                $choiceArea.addClass('horizontal');
            } else {
                $choiceArea.removeClass('horizontal');
            }
        };

        callbacks.allowed = function(interactionParam, value){
            selectedCase = value;
            if(value === 'custom') {
                interactionParam.removeAttr('minChoices');
                interactionParam.removeAttr('maxChoices');
                minMaxComponent = createMinMaxComponent();
            } else {
                if(minMaxComponent) {
                    minMaxComponent.destroy();
                    minMaxComponent = null;
                }
                interactionParam.attr('minChoices', allowedChoices[value].minChoices);
                if(allowedChoices[value].maxChoices === NUMBER_OF_CHOICES_DEFINED) {
                    interactionParam.attr('maxChoices', _.size(interaction.getChoices()));
                } else {
                    interactionParam.attr('maxChoices', allowedChoices[value].maxChoices);
                }
            }
        };

        //when the number of choices changes we update the range
        widget.on('choiceCreated choiceDeleted', function(data){
            if(data.interaction.serial === interaction.serial){
                if(selectedCase === 'custom') {
                    minMaxComponent.updateThresholds(1, _.size(interaction.getChoices()));
                } else if(allowedChoices[selectedCase].maxChoices === NUMBER_OF_CHOICES_DEFINED) {
                    interaction.attr('maxChoices', _.size(interaction.getChoices()));
                }
            }
        });

        formElement.setChangeCallbacks($form, interaction, callbacks);

        //modify the checkbox/radio input appearances
        widget.on('attributeChange', function(data){

            var $checkboxIcons = widget.$container.find('.real-label > span');

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
        if(interaction.attr('orientation') === 'horizontal') {
            sizeAdapter.adaptSize(widget);
        }

        widget.on('choiceCreated', function(){
            if(interaction.attr('orientation') === 'horizontal') {
                sizeAdapter.adaptSize(widget);
            }
        });
    };

    return ChoiceInteractionStateQuestion;
});
