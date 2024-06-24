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
    'services/features',
    'ui/liststyler'
], function (
    _,
    __,
    stateFactory,
    Question,
    formElement,
    minMaxComponentFactory,
    formTpl,
    sizeAdapter,
    features
) {
    'use strict';

    const exitState = function exitState() {
        const widget = this.widget;
        const interaction = widget.element;
        const $choiceArea = widget.$container.find('.choice-area');
        const choiceCount = _.size(interaction.getChoices());
        const realCount = $choiceArea.find('.qti-choice:visible').length;
        if (choiceCount !== realCount) {
            // widget is closed while undo phase of removing choice
            if (interaction.attr('maxChoices') > realCount) {
                interaction.attr('maxChoices', realCount);
            }
            if (interaction.attr('minChoices') > realCount - 1) {
                interaction.attr('minChoices', Math.max(0, realCount - 1));
            }
        }
    };

    const ChoiceInteractionStateQuestion = stateFactory.extend(Question, () => {}, exitState);

    // Note: any change of this needs to be reflected in CSS
    const listStylePrefix = 'list-style-';

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
        const className = interaction.attr('class') || '';
        const listStyle = className.match(/\blist-style-[\w-]+/);

        return !_.isNull(listStyle) ? listStyle.pop().replace(listStylePrefix, '') : null;
    }

    ChoiceInteractionStateQuestion.prototype.initForm = function initForm() {
        let callbacks;
        const widget = this.widget;
        const $form = widget.$form;
        const interaction = widget.element;
        const response = interaction.getResponseDeclaration();
        const currListStyle = getListStyle(interaction);
        const $choiceArea = widget.$container.find('.choice-area');
        let minMaxComponent = null;
        let selectedCase = null;
        let type = '';
        let constraints = '';
        let prevValues = {};

        // minValue and maxValue - number or underfined
        const minValue = interaction.attr('minChoices')
            ? _.parseInt(interaction.attr('minChoices'))
            : interaction.attr('minChoices');
        const maxValue = interaction.attr('maxChoices')
            ? _.parseInt(interaction.attr('maxChoices'))
            : interaction.attr('maxChoices');
        const numberOfChoices = _.size(interaction.getChoices());

        const checkOtherEdgeCases = () => {
            if(constraints === 'other' && minMaxComponent) {
                const min = _.parseInt(interaction.attr('minChoices'));
                const max = _.parseInt(interaction.attr('maxChoices'));
                const firstRender = typeof prevValues.min === 'undefined';
                // deny case minChoices = 1 and maxChoices = Disabled(0) because it simiar to Multiple choice Constraint: Answer required
                if ((min === 1 || min === 0) && (firstRender || prevValues.min > 1)) {
                    minMaxComponent.disableToggler('max');
                } else if (min > 1 && (firstRender || prevValues.min <= 1)) {
                    minMaxComponent.enableToggler('max');
                }
                // deny case minChoices = Disabled(0) and maxChoices = Disabled(0) because it simiar to Multiple choice Constraint: None
                if (max === 0 && (firstRender || prevValues.max > 0)) {
                    minMaxComponent.disableToggler('min');
                    prevValues = {min, max}; // set before updateThresholds to prevent recursive call on update
                    // IF maxChoices = Disabled  THEN minChoices ≥ 2
                    const choiceCount = _.size(interaction.getChoices());
                    minMaxComponent.updateThresholds(DEFAULT_MIN + 1, choiceCount - 1, 'min');
                } else if (max > 0 && (firstRender || prevValues.max === 0)) {
                    minMaxComponent.enableToggler('min');
                    if (!firstRender) {
                        prevValues = {min, max}; // set before updateThresholds to prevent recursive call on update
                        // reset DEFAULT_MIN
                        const choiceCount = _.size(interaction.getChoices());
                        minMaxComponent.updateThresholds(DEFAULT_MIN, choiceCount - 1, 'min');
                    }
                }
                prevValues = {min, max};
            }
        };
        // min / max choices control, with sync values
        const createMinMaxComponent = (min, max) => {
            prevValues = {};
            minMaxComponent = minMaxComponentFactory($form.find('.min-max-panel'), {
                min: { value: min, lowerThreshold: DEFAULT_MIN, upperThreshold: numberOfChoices - 1 },
                max: { value: max, lowerThreshold: DEFAULT_MAX, upperThreshold: numberOfChoices },
                hideTooltips: true
            }).after('render.choice-widget', () => {
                checkOtherEdgeCases();
                minMaxComponent.off('render.choice-widget');
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

        const allowElimination = features.isVisible('taoQtiItem/creator/interaction/choice/property/allowElimination');
        const shuffleChoices = features.isVisible('taoQtiItem/creator/interaction/choice/property/shuffle');
        const choiceOptionsAvailable = allowElimination || shuffleChoices;
        const orientationAvailable = features.isVisible('taoQtiItem/creator/interaction/choice/property/orientation');
        $form.html(
            formTpl({
                type,
                constraints,
                shuffle: !!interaction.attr('shuffle'),
                horizontal: interaction.attr('orientation') === 'horizontal',
                eliminable: /\beliminable\b/.test(interaction.attr('class')),
                enabledFeatures: {
                    allowElimination,
                    shuffleChoices,
                    choiceOptionsAvailable,
                    listStyle: features.isVisible('taoQtiItem/creator/interaction/choice/property/listStyle'),
                    orientationAvailable
                }
            })
        );

        // create minMaxComponent after form will be set in DOM
        if (constraints === 'other') {
            createMinMaxComponent(minValue, maxValue);
        }

        // special case when a single choice is defined
        // shall disable Multiple choices option on the radio-button group
        if (numberOfChoices === 1) {
            $form.find('[name="type"][value="multiple"]').attr('disabled', true);
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
            updateCardinality: false,
            allowNull: true
        });

        //data change for shuffle
        callbacks.shuffle = formElement.getAttributeChangeCallback();

        //data change for orientation, change also the current css class
        callbacks.orientation = function (interactionParam, value) {
            interactionParam.attr('orientation', value);
            if (value === 'horizontal') {
                $choiceArea.addClass('horizontal');
                sizeAdapter.adaptSize(widget);
            } else {
                $choiceArea.removeClass('horizontal');
                sizeAdapter.resetSize(widget);
            }
        };

        const setAttrMaxMinChoices = (min, max) => {
            interaction.attr('minChoices', min);
            interaction.attr('maxChoices', max);
        };

        const resetToSingleNone = () => {
            selectedCase = allowedChoices[0];
            constraints = selectedCase.constraints;
            type = selectedCase.type;
            setAttrMaxMinChoices(selectedCase.minChoices, selectedCase.maxChoices);
            $form.find('[name="type"][value="single"]').prop('checked', true);
            $form.find('[name="constraints"][value="none"]').prop('checked', true);
            $form.find('[name="constraints"][value="other"]').prop('disabled', true);
            deleteMinMax();
            response.attr('cardinality', 'single');
        };

        const setSelectedCase = () => {
            selectedCase = allowedChoices.find(
                allowedChoice => allowedChoice.type === type && allowedChoice.constraints === constraints
            );
            if (!selectedCase) {
                resetToSingleNone();
            }
            setAttrMaxMinChoices(selectedCase.minChoices, selectedCase.maxChoices);
        };

        callbacks.type = function (interactionParam, value) {
            type = value;
            setSelectedCase();
            if (type === 'single') {
                $form.find('[name="constraints"][value="other"]').prop('disabled', true);
                deleteMinMax();
                response.attr('cardinality', 'single');
                response.setCorrect({});
            } else {
                $form.find('[name="constraints"][value="other"]').prop('disabled', false);
                response.attr('cardinality', 'multiple');
            }
        };

        callbacks.constraints = function (interactionParam, value) {
            constraints = value;
            if (constraints === 'other') {
                setAttrMaxMinChoices(DEFAULT_MIN, DEFAULT_MAX);
                createMinMaxComponent(DEFAULT_MIN, DEFAULT_MAX);
            } else {
                deleteMinMax();
                setSelectedCase();
            }
        };

        //when the number of choices changes we update the range
        widget.on('choiceCreated choiceDeleted', function (data, e) {
            if (data.interaction.serial === interaction.serial) {
                const choiceCount = _.size(interaction.getChoices());
                if (
                    choiceCount <= 1 ||
                    ($choiceArea.find('.qti-choice:visible').length <= 1 && e.type === 'choiceDeleted')
                ) {
                    // multiple choices should be disabled
                    resetToSingleNone();
                    $form.find('[name="type"][value="multiple"]').prop('disabled', true);
                } else {
                    // multiple choices should be enabled
                    $form.find('[name="type"][value="multiple"]').prop('disabled', false);
                }
                if (constraints === 'other' && minMaxComponent) {
                    minMaxComponent.updateThresholds(DEFAULT_MIN, choiceCount - 1, 'min');
                    minMaxComponent.updateThresholds(DEFAULT_MAX, choiceCount, 'max');
                }
            }
        });

        formElement.setChangeCallbacks($form, interaction, callbacks);

        //modify the checkbox/radio input appearances
        widget.on('attributeChange', function (data) {
            const $checkboxIcons = widget.$container.find('.real-label > span');
            const $checkboxInputs = widget.$container.find('.real-label > input');

            if (data.element.serial === interaction.serial && data.key === 'maxChoices') {
                if (parseInt(data.value) === 1) {
                    //radio
                    $checkboxIcons.removeClass('icon-checkbox').addClass('icon-radio');
                    $checkboxInputs.attr('type', 'radio');
                } else {
                    //checkbox
                    $checkboxIcons.removeClass('icon-radio').addClass('icon-checkbox');
                    $checkboxInputs.attr('type', 'checkbox');
                }
            }
            if (
                data.element.serial === interaction.serial &&
                (data.key === 'maxChoices' || data.key === 'minChoices')
            ) {
                checkOtherEdgeCases();
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
