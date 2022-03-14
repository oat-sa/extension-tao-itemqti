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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA;
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
], function (_, __, stateFactory, Question, formElement, minMaxComponentFactory, formTpl, sizeAdapter) {
    'use strict';

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    // Note: any change of this needs to be reflected in CSS
    var listStylePrefix = 'list-style-';

    const allowedChoices = [
        {
            type: 'single',
            constraints: 'none',
            minChoices: 0,
            maxChoices: 1
        },
        {
            type: 'single',
            constraints: 'required',
            minChoices: 1,
            maxChoices: 1
        },
        {
            type: 'multiple',
            constraints: 'none',
            minChoices: 0,
            maxChoices: 0
        },
        {
            type: 'multiple',
            constraints: 'required',
            minChoices: 1,
            maxChoices: 0
        },
        {
            type: 'multiple',
            constraints: 'other'
        }
    ];
    const DEFAULT_MIN = 1;
    const DEFAULT_MAX = 2;

    function getListStyle(interaction) {
        var className = interaction.attr('class') || '',
            listStyle = className.match(/\blist-style-[\w-]+/);

        return !_.isNull(listStyle) ? listStyle.pop().replace(listStylePrefix, '') : null;
    }

    ChoiceInteractionStateQuestion.prototype.initForm = function initForm(updateCardinality) {
        var callbacks;
        var widget = this.widget;
        var $form = widget.$form;
        var interaction = widget.element;
        var currListStyle = getListStyle(interaction);
        var $choiceArea = widget.$container.find('.choice-area');
        let minMaxComponent = null;
        let selectedCase = null;
        let type = '';
        let constraints = '';

        // minValue and maxValue - number or underfined
        const minValue = interaction.attr('minChoices') ? _.parseInt(interaction.attr('minChoices')) : interaction.attr('minChoices');
        const maxValue = interaction.attr('maxChoices') ? _.parseInt(interaction.attr('maxChoices')) : interaction.attr('maxChoices');
        const numberOfChoices = _.size(interaction.getChoices());

        // min / max choices control, with sync values
        const createMinMaxComponent = (min, max) => {
            minMaxComponent = minMaxComponentFactory($form.find('.min-max-panel'), {
                min: { value: min, lowerThreshold: DEFAULT_MIN, upperThreshold: numberOfChoices - 1 },
                max: { value: max, lowerThreshold: DEFAULT_MAX, upperThreshold: numberOfChoices }
            });
        };
        const deleteMinMax = () => {
            if (minMaxComponent) {
                minMaxComponent.destroy();
                minMaxComponent = null;
            }
        };

        allowedChoices.forEach(allowedChoice => {
            if (minValue === allowedChoice.minChoices && maxValue === allowedChoice.maxChoices) {
                selectedCase = allowedChoice;
            }
        });

        if (!selectedCase) {
            selectedCase = allowedChoices[allowedChoices.length - 1];
        }
        type = selectedCase.type;
        constraints = selectedCase.constraints;
        $form.html(
            formTpl({
                type,
                constraints,
                shuffle: !!interaction.attr('shuffle'),
                horizontal: interaction.attr('orientation') === 'horizontal',
                eliminable: /\beliminable\b/.test(interaction.attr('class'))
            })
        );
        // create minMaxComponent after form will be set in DOM
        if (constraints === 'other') {
            createMinMaxComponent(minValue, maxValue);
        }

        $form
            .find('[data-list-style]')
            .liststyler({ selected: currListStyle })
            .on('stylechange.liststyler', function (e, data) {
                // model
                interaction.removeClass(listStylePrefix + data.oldStyle);
                // current visual
                $choiceArea.removeClass(listStylePrefix + data.oldStyle);
                if (data.newStyle !== 'none') {
                    interaction.addClass(listStylePrefix + data.newStyle);
                    $choiceArea.addClass(listStylePrefix + data.newStyle);
                }
            });

        // activate the elimination buttons
        $form.find('[name="eliminable"]').on('change.eliminable', function () {
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
        callbacks = formElement.getMinMaxAttributeCallbacks('minChoices', 'maxChoices', {
            updateCardinality: updateCardinality
        });

        //data change for shuffle
        callbacks.shuffle = formElement.getAttributeChangeCallback();

        //data change for orientation, change also the current css class
        callbacks.orientation = function (interactionParam, value) {
            interactionParam.attr('orientation', value);
            if (value === 'horizontal') {
                $choiceArea.addClass('horizontal');
            } else {
                $choiceArea.removeClass('horizontal');
            }
        };

        const resetToSingleNone = () => {
            selectedCase = allowedChoices[0];
            $form.find('[name="type"][value="single"]').attr('checked', true);
            $form.find('[name="constraints"][value="none"]').attr('checked', true);
            deleteMinMax();
        };

        const setSelectedCase = () => {
            selectedCase = allowedChoices.find(
                allowedChoice => allowedChoice.type === type && allowedChoice.constraints === constraints
            );
            if (!selectedCase) {
                resetToSingleNone();
            }
            interaction.attr('minChoices', selectedCase.minChoices);
            interaction.attr('maxChoices', selectedCase.maxChoices);
        };


        callbacks.type = function (interactionParam, value) {
            type = value;
            setSelectedCase();
            if (type === 'single') {
                $form.find('[name="constraints"][value="other"]').attr('disabled', true);
                deleteMinMax();
            } else {
                $form.find('[name="constraints"][value="other"]').removeAttr('disabled');
            }
        };

        callbacks.constraints = function (interactionParam, value) {
            constraints = value;
            if (constraints === 'other') {
                interactionParam.attr('minChoices', DEFAULT_MIN);
                interactionParam.attr('maxChoices', DEFAULT_MAX);
                createMinMaxComponent(DEFAULT_MIN, DEFAULT_MAX);
            } else {
                deleteMinMax();
                setSelectedCase();
            }
        };

        //when the number of choices changes we update the range
        widget.on('choiceCreated choiceDeleted', function (data) {
            if (data.interaction.serial === interaction.serial) {
                const choiceCount = _.size(interaction.getChoices());
                if (choiceCount <= 1) {
                    // multiple choices should be disabled
                    $form.find('[name="type"][value="multiple"]').attr('disabled', true);
                    resetToSingleNone();
                } else {
                    // multiple choices should be enabled
                    $form.find('[name="type"][value="multiple"]').removeAttr('disabled');
                }
                if (constraints === 'other') {
                    minMaxComponent.updateThresholds(DEFAULT_MIN, choiceCount - 1, 'min');
                    minMaxComponent.updateThresholds(DEFAULT_MAX, choiceCount, 'max');
                }
            }
        });

        formElement.setChangeCallbacks($form, interaction, callbacks);

        //modify the checkbox/radio input appearances
        widget.on('attributeChange', function (data) {
            var $checkboxIcons = widget.$container.find('.real-label > span');

            if (data.element.serial === interaction.serial && data.key === 'maxChoices') {
                if (parseInt(data.value) === 1) {
                    //radio
                    $checkboxIcons.removeClass('icon-checkbox').addClass('icon-radio');
                } else {
                    //checkbox
                    $checkboxIcons.removeClass('icon-radio').addClass('icon-checkbox');
                }
            }
        });

        //adapt size
        if (interaction.attr('orientation') === 'horizontal') {
            sizeAdapter.adaptSize(widget);
        }

        widget.on('choiceCreated', function () {
            if (interaction.attr('orientation') === 'horizontal') {
                sizeAdapter.adaptSize(widget);
            }
        });
    };

    return ChoiceInteractionStateQuestion;
});
