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
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice',
    'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter',
    'ui/liststyler'
], function(_, stateFactory, Question, formElement, minMaxComponentFactory, formTpl, sizeAdapter){

    'use strict';

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    // Note: any change of this needs to be reflected in CSS
    var listStylePrefix = 'list-style-';

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

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            horizontal : interaction.attr('orientation') === 'horizontal',
            eliminable : (/\beliminable\b/).test(interaction.attr('class'))
        }));

        // min / max choices control, with sync values
        minMaxComponentFactory($form.find('.min-max-panel'), {
            min : { value : _.parseInt(interaction.attr('minChoices')) || 0 },
            max : { value : _.parseInt(interaction.attr('maxChoices')) || 0 },
            upperThreshold : _.size(interaction.getChoices())
        }).on('render', function(){
            var self = this;

            //when the number of choices changes we update the range
            widget.on('choiceCreated choiceDeleted', function(data){
                if(data.interaction.serial === interaction.serial){
                    self.updateThresholds(1, _.size(interaction.getChoices()));
                }
            });
        });

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

            // indicate whether this has been unchecked on purpose
            interaction.toggleClass('eliminability-deselected', !this.checked);
        });

        formElement.initWidget($form);

        //data change callbacks with the usual min/maxChoices
        callbacks = formElement.getMinMaxAttributeCallbacks($form, 'minChoices', 'maxChoices', { updateCardinality: updateCardinality });

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
