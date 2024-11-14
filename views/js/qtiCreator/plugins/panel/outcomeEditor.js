/**
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
 * Copyright (c) 2016-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/helper/popup',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/model/variables/OutcomeDeclaration',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'ui/tooltip',
    'services/features',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/panel',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/listing'
], function (
    $,
    _,
    __,
    pluginFactory,
    Element,
    popup,
    formElement,
    OutcomeDeclaration,
    xmlRenderer,
    tooltip,
    features,
    panelTpl,
    listingTpl
) {
    'use strict';

    const _ns = '.outcome-editor';

    /**
     * Types of externalScored attributes
     *
     * @typedef {Object} externalScoredOptions - Defines types of externalScored attributes
     * @property {String} externalMachine - Score is computed by a service
     * @property {String} none - No scoring
     * @property {String} human - Score is applied manually by a reviewer
     */
    const externalScoredOptions = {
        none: 'none',
        human: 'human',
        externalMachine: 'externalMachine'
    };
    const externalScoredValidOptions = [
        externalScoredOptions.human,
        externalScoredOptions.externalMachine
    ];

    /**
     * Get the identifiers of the variables that are used in the response declaration
     *
     * @param {Object} item
     * @returns {Array}
     */
    function getRpUsedVariables(item) {
        const rpXml = xmlRenderer.render(item.responseProcessing);
        const variables = ['MAXSCORE'];
        const $rp = $(rpXml);

        $rp.find('variable,setOutcomeValue').each(function () {
            const id = $(this).attr('identifier');
            if (id !== 'SCORE') {
                variables.push(id);
            }
        });

        return _.uniq(variables);
    }

    /**
     * Render the lists of the item outcomes into the outcome editor panel
     *
     * @param {Object} item
     * @param {JQuery} $outcomeEditorPanel
     */
    function renderListing(item, $outcomeEditorPanel) {
        const readOnlyRpVariables = getRpUsedVariables(item);
        const scoreMaxScoreVisible = features.isVisible('taoQtiItem/creator/interaction/response/outcomeDeclarations/scoreMaxScore');
        const scoreExternalScored = _.get(_.find(item.outcomes, function (outcome) {
            return outcome.attributes && outcome.attributes.identifier === 'SCORE';
        }), 'attributes.externalScored', externalScoredOptions.none);

        let outcomesData = _.map(item.outcomes, function (outcome) {
            const readonly = readOnlyRpVariables.indexOf(outcome.id()) >= 0;
            const id = outcome.id();
            let externalScoredDisabled = outcome.attr('externalScoredDisabled');
            const externalScored = {
                none: { label: __('None'), selected: !outcome.attr('externalScored') },
                human: { label: __('Human'), selected: outcome.attr('externalScored') === externalScoredOptions.human },
                externalMachine: {
                    label: __('External Machine'),
                    selected: outcome.attr('externalScored') === externalScoredOptions.externalMachine
                }
            };
            function setExternalScoredToNone() {
                externalScoredDisabled = 1;
                outcome.removeAttr('externalScored');
            }

            function hasExternalScoredOutcome(outcomes) {
                return _.some(outcomes, function (outcome) {
                    return outcome.attributes &&
                    outcome.attributes.identifier !== 'SCORE' &&
                    outcome.attributes.externalScored &&
                    outcome.attributes.externalScored !== externalScoredOptions.none
                });
            }

            function shouldSetExternalScoredToNone() {
                if (id !== 'SCORE') {
                    return scoreExternalScored && scoreExternalScored !== externalScoredOptions.none;
                }
                return hasExternalScoredOutcome(item.outcomes);
            }

            if (shouldSetExternalScoredToNone()) {
                setExternalScoredToNone();
            }

            return {
                serial: outcome.serial,
                identifier: id,
                hidden: (id === 'SCORE' || id === 'MAXSCORE') && !scoreMaxScoreVisible,
                interpretation: outcome.attr('interpretation'),
                longInterpretation: outcome.attr('longInterpretation'),
                externalScored: externalScored,
                normalMaximum: outcome.attr('normalMaximum'),
                normalMinimum: outcome.attr('normalMinimum'),
                titleDelete: readonly
                    ? __('Cannot delete a variable currently used in response processing')
                    : __('Delete'),
                titleEdit: readonly ? __('Cannot edit a variable currently used in response processing') : __('Edit'),
                readonly: readonly,
                externalScoredDisabled: externalScoredDisabled || 0
            };
        });

        const allExternalScoredDisabled = outcomesData.every(outcomeData => outcomeData.externalScoredDisabled === 1);

        if (allExternalScoredDisabled) {
            // Update all externalScoredDisabled values to false if we have inconsistente data from bad items
            outcomesData.forEach(outcomeData => outcomeData.externalScoredDisabled = 0);
        }

        $outcomeEditorPanel.find('.outcomes').html(
            listingTpl({
                outcomes: outcomesData
            })
        );

        //init form javascript
        formElement.initWidget($outcomeEditorPanel);
    }

    /**
     * Validates if the number is a valid scoring trait
     *
     * @param {number} value
     * @returns {boolean}
     */
    function isValidScoringTrait(value) {
        return value % 1 === 0 && typeof value !== 'undefined';
    }

    /**
     * Attaches warning tooltips to value fields
     *
     * @param {JQueryElement} $field
     */
    const attachScoringTraitWarningTooltip = $field => {
        let widgetTooltip;

        if (!$field.data('$tooltip')) {
            widgetTooltip = tooltip.warning(
                $field,
                __("This value does not follow scoring traits guidelines. It won't be compatible with TAO Manual Scoring"),
                {
                    trigger: 'manual',
                    placement: 'left-start'
                }
            );
            $field.data('$tooltip', widgetTooltip);
        }
    };

    function setMinumumMaximumValue(outcomeElement, outcomeValueContainer, min, max) {
        outcomeElement.attr('normalMaximum', max);
        outcomeValueContainer.find('[name="normalMaximum"]').val(max);
        outcomeElement.attr('normalMinimum', min);
        outcomeValueContainer.find('[name="normalMinimum"]').val(min);
    }


    function updateExternalScored(responsePanel, serial, disableCondition, shouldDisable) {
        // Iterate over each outcome container
        responsePanel.find('.outcome-container').each(function () {
            const currentSerial = $(this).data('serial');
            if (currentSerial === serial) {
                return; // Skip the current serial
            }

            const currentOutcomeElement = Element.getElementBySerial(currentSerial);
            const id = $(this).find(".identifier").val();

            // Check if disabling condition is met
            if (disableCondition(id)) {
                $(this).find("select[name='externalScored']").attr('disabled', shouldDisable);
                if (shouldDisable) {
                    currentOutcomeElement.removeAttr('externalScored');
                }
            }
        });
    }

    function shouldDisableScoreBasedOnOtherVariables(responsePanel, serial) {
        let shouldDisable = false;

        // Iterate over each element in responsePanel and check if any value != none
        responsePanel.find('.outcome-container').each(function () {
            const currentSerial = $(this).data('serial');
            const id = $(this).find(".identifier").val();

            // Skip the element with the same serial, as we're focusing on other elements
            if (currentSerial === serial || id === 'SCORE') {
                return;
            }

            const currentValue = $(this).find("select[name='externalScored']").val();

            // If any element has a value other than 'none', disable SCORE
            if (currentValue !== externalScoredOptions.none) {
                shouldDisable = true;
                return false; // Exit the loop early
            }
        });

        return shouldDisable;
    }

    /**
     * Disposes tooltips
     *
     * @param {JQueryElement} $field
     */
    const removeScoringTraitWarningTooltip = $field => {
        if ($field.data('$tooltip')) {
            $field.data('$tooltip').dispose();
            $field.removeData('$tooltip');
        }
    };

    return pluginFactory({
        name: 'outcomeEditor',
        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            const item = this.getHost().getItem();
            const $container = this.getAreaBroker().getContainer();
            const $responsePanel = $container.find('#sidebar-right-response-properties');
            let $outcomeEditorPanel;

            $container.on(`initResponseForm${_ns}`, function () {
                //remove old one if exists
                $responsePanel.find('.qti-outcome-editor').remove();

                //create new one
                $outcomeEditorPanel = $(panelTpl());

                //bind behaviour
                $outcomeEditorPanel
                    .on(`click${_ns}`, '.editable [data-role="edit"]', function () {
                        const $outcomeContainer = $(this).closest('.outcome-container');
                        const serial = $outcomeContainer.data('serial');
                        const outcomeElement = Element.getElementBySerial(serial);
                        const $labelContainer = $outcomeContainer.find('.identifier-label');
                        const $incrementerContainer = $outcomeContainer.find(".incrementer");
                        const $identifierLabel = $labelContainer.find('.label');
                        const $identifierInput = $labelContainer.find('.identifier');
                        const $outcomeValueContainer = $outcomeContainer.find('div.minimum-maximum');
                        const isScoreOutcome = outcomeElement.attributes.identifier === 'SCORE';
                        let isScoringTraitValidationEnabled =
                            outcomeElement.attr('externalScored') === externalScoredOptions.human;
                        if (
                          !externalScoredValidOptions.includes(
                            outcomeElement.attr("externalScored")
                          )
                        ) {
                            $incrementerContainer.incrementer("disable");
                            setMinumumMaximumValue(outcomeElement, $outcomeValueContainer, 0, 0);
                        } else {
                            $incrementerContainer.incrementer("enable");
                        }

                        $outcomeContainer.addClass('editing');
                        $outcomeContainer.removeClass('editable');

                        //sync the identifier value in case it was invalid before
                        $identifierInput.focus();
                        $identifierInput.val('');
                        $identifierInput.val(outcomeElement.id());

                        const showScoringTraitWarningOnInvalidValue = () => {
                            if (
                                !isValidScoringTrait(outcomeElement.attr('normalMinimum')) ||
                                !isValidScoringTrait(outcomeElement.attr('normalMaximum'))
                            ) {
                                $outcomeValueContainer.data('$tooltip').show();
                            } else {
                                $outcomeValueContainer.data('$tooltip').hide();
                            }
                        };

                        //Attach scoring trait warning tooltips on init to outcome value fields on init
                        if (isScoringTraitValidationEnabled) {
                            attachScoringTraitWarningTooltip($outcomeValueContainer);

                            // shows tooltips in case of invalid value
                            showScoringTraitWarningOnInvalidValue();
                        }

                        //attach form change callbacks
                        formElement.setChangeCallbacks(
                            $outcomeContainer,
                            outcomeElement,
                            _.assign(
                                {
                                    identifier(outcome, value) {
                                        //update the html for real time update
                                        $identifierLabel.html(value);

                                        //save to model
                                        outcome.id(value);
                                    },
                                    interpretation(outcome, value) {
                                        //update the title attr for real time update
                                        $labelContainer.attr('title', value);

                                        //save to model
                                        outcome.attr('interpretation', value);
                                    },
                                    longInterpretation(outcome, value) {
                                        //update the title attr for real time update
                                        $labelContainer.attr('title', value);

                                        //save to model
                                        outcome.attr('longInterpretation', value);
                                    },
                                    externalScored(outcome, value) {
                                        //Turn off scoring trait validation if externalScored is not human
                                        isScoringTraitValidationEnabled = value === externalScoredOptions.human;
                                        if (isScoreOutcome && value !== externalScoredOptions.none) {
                                            $incrementerContainer.incrementer("enable");
                                        } else if (isScoreOutcome) {
                                            setMinumumMaximumValue(outcome, $outcomeValueContainer, 0, 0);
                                            $incrementerContainer.incrementer("disable");
                                        } else if (value !== externalScoredOptions.none) {
                                            $incrementerContainer.incrementer("enable");
                                        } else {
                                            setMinumumMaximumValue(outcome, $outcomeValueContainer, 0, 0);
                                            $incrementerContainer.incrementer("disable");
                                        }

                                        /**
                                         * Attaches scoring trait warning tooltips when `externalScored` is `human`
                                         */
                                        if (value === externalScoredOptions.human) {
                                            attachScoringTraitWarningTooltip($outcomeValueContainer);

                                            // shows tooltips in case of invalid value
                                            showScoringTraitWarningOnInvalidValue();
                                        } else {
                                            removeScoringTraitWarningTooltip($outcomeValueContainer);
                                        }

                                        /**
                                         * Removes the `externalScored` attribute from outcome when `none` is selected.
                                         */
                                        if (value === externalScoredOptions.none) {
                                            outcome.removeAttr('externalScored');
                                        } else {
                                            outcome.attr('externalScored', value);
                                        }
                                        if (isScoreOutcome && value !== externalScoredOptions.none) {
                                            // Disable other outcomes if condition is met
                                            updateExternalScored($responsePanel, serial, function (id) {
                                                return value !== externalScoredOptions.none;
                                            }, true);
                                        } else if (isScoreOutcome && value === externalScoredOptions.none) {
                                            // Disable other outcomes if condition is met
                                            updateExternalScored($responsePanel, serial, function (id) {
                                                return id !== 'SCORE';
                                            }, false);
                                        } else if (value !== externalScoredOptions.none) {
                                            // Disable SCORE if condition is met
                                            updateExternalScored($responsePanel, serial, function (id) {
                                                return id === 'SCORE';
                                            }, true);
                                        } else {
                                            // Check the states of other outcomes before enabling SCORE
                                            const shouldDisable = shouldDisableScoreBasedOnOtherVariables($responsePanel, serial);

                                            // Enable or disable SCORE based on the result
                                            updateExternalScored($responsePanel, serial, function (id) {
                                                return id === 'SCORE';
                                            }, shouldDisable); // Disable SCORE if any other outcomes is not 'none'
                                        }
                                    }
                                },
                                formElement.getMinMaxAttributeCallbacks(
                                    'normalMinimum',
                                    'normalMaximum',
                                    {
                                        allowNull: true,
                                        floatVal: true,
                                        callback: function (outcome, value, attr) {
                                            if (isScoringTraitValidationEnabled) {
                                                showScoringTraitWarningOnInvalidValue();
                                            }

                                            if (isNaN(value)) {
                                                outcome.removeAttr(attr);
                                            } else {
                                                value = Math.round(value);

                                                outcome.attr(attr, value);
                                                $outcomeValueContainer.find(`[name = "${attr}"]`).val(value);

                                                if (attr === 'normalMinimum' && outcome.attr('normalMaximum') < value) {
                                                    outcome.attr('normalMaximum', value);
                                                    $outcomeValueContainer.find('[name="normalMaximum"]').val(value);
                                                } else if (attr === 'normalMaximum' && outcome.attr('normalMinimum') > value) {
                                                    outcome.attr('normalMinimum', value);
                                                    $outcomeValueContainer.find('[name="normalMinimum"]').val(value);
                                                }
                                            }
                                        }
                                    }
                                )
                            ),
                            { saveInvalid: true, validateOnInit: true }
                        );
                    })
                    .on(`click${_ns}`, '.editing [data-role="edit"]', function () {
                        const $outcomeContainer = $(this).closest('.outcome-container');
                        $outcomeContainer.removeClass('editing');
                        $outcomeContainer.addClass('editable');
                        formElement.removeChangeCallback($outcomeContainer);
                    })
                    .on(`click${_ns}`, '.deletable [data-role="delete"]', function () {
                        //delete the outcome
                        const $outcomeContainer = $(this).closest('.outcome-container');
                        const serial = $outcomeContainer.data('serial');
                        // Check the states of other outcomes before enabling SCORE
                        const shouldDisable = shouldDisableScoreBasedOnOtherVariables($responsePanel, serial);

                        // Enable or disable SCORE based on the result
                        updateExternalScored($responsePanel, serial, function (id) {
                            return id === 'SCORE';
                        }, shouldDisable); // Disable SCORE if any other outcomes is not 'none'

                        $outcomeContainer.remove();
                        item.remove('outcomes', $outcomeContainer.data('serial'));
                    })
                    .on(`click${_ns}`, '.adder', function (e) {
                        e.preventDefault();
                        //add new outcome
                        const newOutcome = new OutcomeDeclaration({
                            cardinality: 'single',
                            baseType: 'float',
                            normalMinimum: 0.0,
                            normalMaximum: 1.0
                        });

                        //attach the outcome to the item before generating item-level unique id
                        item.addOutcomeDeclaration(newOutcome);
                        newOutcome.buildIdentifier('OUTCOME');

                        //refresh the list
                        renderListing(item, $outcomeEditorPanel);
                    });

                //attach to response form side panel
                $responsePanel.append($outcomeEditorPanel);
                renderListing(item, $outcomeEditorPanel);
            });
        }
    });
});
