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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import _ from 'lodash';
import $ from 'jquery';
import __ from 'i18n';
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/interactions/choiceInteraction';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import instructionMgr from 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager';
import pciResponse from 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse';
import sizeAdapter from 'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter';
import adaptSize from 'util/adaptSize';
import features from 'services/features';
import {
    getIsWritingModeVerticalRl,
    wrapDigitsInCombineUpright
} from 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting';

const KEY_CODE_SPACE = 32;
const KEY_CODE_ENTER = 13;
const KEY_CODE_LEFT = 37;
const KEY_CODE_UP = 38;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_DOWN = 40;

/**
 * Propagate the checked state to the actual input.
 * @type {Function}
 * @param {jQuery} $choiceBox - list element with the class `.qti-choice`
 * @param {Boolean} state
 * @private
 */
const _triggerInput = function _triggerInput($choiceBox, state) {
    const $input = $choiceBox.find('input:radio,input:checkbox').not('[disabled]').not('.disabled');
    const $choiceBoxes = $choiceBox.add($choiceBox.siblings());

    if (!$input.length) {
        return;
    }

    if (!_.isBoolean(state)) {
        state = !$input.prop('checked');
    }

    $input.prop('checked', state);
    $input.trigger('change');

    $choiceBoxes.removeClass('user-selected');
    $choiceBoxes
        .find('input:checked')
        .not('[disabled]')
        .not('.disabled')
        .parents('.qti-choice')
        .addClass('user-selected');
};

/**
 * 'pseudo-label' is technically a div that behaves like a label.
 * This allows the usage of block elements inside the fake label
 *
 * @private
 * @param {Object} interaction - the interaction instance
 * @param {jQueryElement} $container
 */
const _pseudoLabel = function _pseudoLabel(interaction, $container) {
    const inputSelector =
        '.qti-choice input:radio:not([disabled]):not(.disabled), .qti-choice input:checkbox:not([disabled]):not(.disabled)';
    $container.off('.commonRenderer');

    $container
        .on('keydown.commonRenderer.keyNavigation', inputSelector, function (e) {
            const $qtiChoice = $(this).closest('.qti-choice');
            const keyCode = e.keyCode ? e.keyCode : e.charCode;

            if (keyCode === KEY_CODE_UP || keyCode === KEY_CODE_LEFT) {
                e.preventDefault();
                e.stopPropagation();
                $qtiChoice
                    .prev('.qti-choice')
                    .find('input:radio,input:checkbox')
                    .not('[disabled]')
                    .not('.disabled')
                    .focus();
            } else if (keyCode === KEY_CODE_DOWN || keyCode === KEY_CODE_RIGHT) {
                e.preventDefault();
                e.stopPropagation();
                $qtiChoice
                    .next('.qti-choice')
                    .find('input:radio,input:checkbox')
                    .not('[disabled]')
                    .not('.disabled')
                    .focus();
            }
        })
        .on('keyup.commonRenderer.keyNavigation', inputSelector, function (e) {
            const keyCode = e.keyCode ? e.keyCode : e.charCode;

            if (keyCode === KEY_CODE_SPACE || keyCode === KEY_CODE_ENTER) {
                e.preventDefault();
                e.stopPropagation();
                _triggerInput($(this).closest('.qti-choice'));
            }
        });

    $container.on('click.commonRenderer', '.qti-choice', function (e) {
        const $choiceBox = $(this);
        let state;
        const eliminator = e.target.dataset && e.target.dataset.eliminable;
        const input = this.querySelector('.real-label > input');

        // if the click has been triggered by a keyboard check, prevent this listener to cancel this check
        if (e.originalEvent && $(e.originalEvent.target).is('input')) {
            instructionMgr.validateInstructions(interaction, { choice: $choiceBox });
            containerHelper.triggerResponseChangeEvent(interaction);
            $(input).focus();
            return;
        }

        //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
        if ($choiceBox.closest('.qti-item').hasClass('prevent-click-handler')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation(); //required otherwise any tao scoped, form initialization might prevent it from working

        if (!_.isUndefined(eliminator)) {
            state = false;
            if (eliminator === 'trigger') {
                this.classList.toggle('eliminated');
            }
        }

        _triggerInput($choiceBox, state);

        if (this.classList.contains('eliminated')) {
            input.setAttribute('disabled', 'disabled');
        } else {
            input.removeAttribute('disabled');
        }

        instructionMgr.validateInstructions(interaction, { choice: $choiceBox });
        containerHelper.triggerResponseChangeEvent(interaction);
        $(input).focus();
    });
};

/**
 * Get the responses from the DOM.
 * @private
 * @param {Object} interaction - the interaction instance
 * @returns {Array} the list of choices identifiers
 */
const _getRawResponse = function _getRawResponse(interaction) {
    const values = [];
    const $container = containerHelper.get(interaction);
    $('.real-label > input[name=response-' + interaction.getSerial() + ']:checked', $container).each(function () {
        values.push($(this).val());
    });
    return values;
};

/**
 * Define the instructions for the interaction
 * @private
 * @param {Object} interaction - the interaction instance
 * @param {boolean} isVertical - wrtiting mode
 */
const _setInstructions = function _setInstructions(interaction, isVertical) {
    const min = interaction.attr('minChoices');
    const max = interaction.attr('maxChoices');
    let msg;
    const choiceCount = _.size(interaction.getChoices());

    const highlightInvalidInput = function highlightInvalidInput($choice) {
        const $input = $choice.find('.real-label > input');
        const $icon = $choice.find('.real-label > span');

        const prevTimeoutData = $choice.data('__instructionTimeout');
        if (prevTimeoutData) {
            clearTimeout(prevTimeoutData.timeout);
            prevTimeoutData.unhighlight();
        }

        const choiceStyle = $choice.attr('style');
        const iconStyle = $icon.attr('style');
        $choice.get(0).style.setProperty('color', '#BA122B', 'important');
        $icon.css('color', '#BA122B').addClass('cross error');

        const unhighlight = () => {
            $choice.attr('style', choiceStyle || '');
            $icon.attr('style', iconStyle || '').removeClass('cross error');
        };
        const timeout = setTimeout(() => {
            unhighlight();
            $input.prop('checked', false);
            $choice.toggleClass('user-selected', false);
            containerHelper.triggerResponseChangeEvent(interaction);
        }, 250);
        $choice.data('__instructionTimeout', { timeout, unhighlight });
    };

    // if maxChoice = 1, use the radio group behaviour
    // if maxChoice = 0, infinite choice possible
    // there are 5 cases according AUT-345 Choice interaction: reduce edge cases constraints
    if (min === 1 && (max === 0 || max === choiceCount || typeof max === 'undefined')) {
        // Multiple Choice: 4.Constraint: Answer required -> minChoices = 1 / maxChoices = 0 -> “You need to select at least 1 choice”
        // Multiple Choice: 5.Constraint: Other constraints -> minChoices = 1 / maxChoices = (N or Disabled)
        msg = wrapDigitsInCombineUpright(__('You need to select at least 1 choice.'), isVertical);
        instructionMgr.appendInstruction(interaction, msg, function () {
            if (_getRawResponse(interaction).length >= 1) {
                this.setLevel('success');
            } else {
                this.reset();
            }
        });
    } else if (min >= 1 && max >= 2 && min !== max) {
        // Multiple Choice: 5. Constraint: Other constraints -> “You must select from minChoices to maxChoices choices. for the correct answer“
        msg = wrapDigitsInCombineUpright(__('You need to select from %s to %s choices.', min, max), isVertical);
        instructionMgr.appendInstruction(interaction, msg, function (data) {
            if (_getRawResponse(interaction).length >= min && _getRawResponse(interaction).length < max) {
                this.reset();
                this.setLevel('success');
            } else if (_getRawResponse(interaction).length >= max) {
                this.setMessage(__('Maximum choices reached'));
                if (this.checkState('fulfilled')) {
                    this.update({
                        level: 'warning',
                        timeout: 2000,
                        start: function () {
                            if (data && data.choice) {
                                highlightInvalidInput(data.choice);
                            }
                        },
                        stop: function () {
                            this.setLevel('info');
                        }
                    });
                }
                this.setState('fulfilled');
            } else {
                this.reset();
            }
        });
    } else if (min > 1 && min === max) {
        // Multiple Choice: 5. Constraint: Other constraints -> minChoices ≠ Disabled / maxChoices ≠ Disabled -> “You need to select {minChoices = maxChoices value} choices.“
        msg = wrapDigitsInCombineUpright(__('You need to select %s choices', min), isVertical);
        instructionMgr.appendInstruction(interaction, msg, function (data) {
            if (_getRawResponse(interaction).length === min) {
                this.setLevel('success');
            } else if (_getRawResponse(interaction).length >= max) {
                this.setMessage(__('Maximum choices reached'));
                this.update({
                    level: 'warning',
                    timeout: 2000,
                    start: function () {
                        if (data && data.choice) {
                            highlightInvalidInput(data.choice);
                        }
                    },
                    stop: function () {
                        this.setLevel('info');
                    }
                });
                this.setState('fulfilled');
            } else {
                this.reset();
            }
        });
    } else if (max > 1 && max < choiceCount && (typeof min === 'undefined' || min === 0)) {
        // Multiple Choice: 5. Constraint: Other constraints -> minChoices = Disabled / maxChoices ≠ Disabled  -> "You can select up to {maxChoices value} choices."
        msg = wrapDigitsInCombineUpright(__('You can select up to %s choices.', max), isVertical);
        instructionMgr.appendInstruction(interaction, msg, function (data) {
            if (_getRawResponse(interaction).length >= max) {
                this.setMessage(__('Maximum choices reached'));
                if (this.checkState('fulfilled')) {
                    this.update({
                        level: 'warning',
                        timeout: 2000,
                        start: function () {
                            if (data && data.choice) {
                                highlightInvalidInput(data.choice);
                            }
                        },
                        stop: function () {
                            this.setLevel('info');
                        }
                    });
                }
                this.setState('fulfilled');
            } else {
                this.reset();
            }
        });
    } else if (min > 1 && (typeof max === 'undefined' || max === 0)) {
        // Multiple Choice: 5. Constraint: Other constraints -> minChoices ≠ Disabled / maxChoices = Disabled or 0   -> "You need to select at least {minChoices value} choices.""
        msg = wrapDigitsInCombineUpright(__('You need to select at least %s choices.', min), isVertical);
        instructionMgr.appendInstruction(interaction, msg, function () {
            if (_getRawResponse(interaction).length >= min) {
                this.setLevel('success');
            } else {
                this.reset();
            }
        });
    }
    // Single choice: 1.Constraint: None -> minChoices = 0 / maxChoices = 1 -> No messages
    // Single choice: 2.Constraint: Answer required  -> minChoices = 1, maxChoices = 1 -> No messages
    // Multiple Choice: 3.Constraint: None  -> minChoices = 0, maxChoices = 0 -> No messages
};

/**
 * Init rendering, called after template injected into the DOM
 * All options are listed in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10278
 *
 * @param {Object} interaction - the interaction instance
 */
const render = function render(interaction) {
    const $container = containerHelper.get(interaction);
    const isVertical = getIsWritingModeVerticalRl($container);

    _pseudoLabel(interaction, $container);

    _setInstructions(interaction, isVertical);

    if (interaction.attr('orientation') === 'horizontal') {
        const $elements = $('.add-option, .result-area .target, .choice-area .qti-choice', $container);
        sizeAdapter.adaptSize($elements);

        $(document).on('themeapplied.choiceInteraction', () =>
            isVertical ? adaptSize.width($elements) : adaptSize.height($elements)
        );
    }
};

/**
 * Reset the responses previously set
 *
 * @param {Object} interaction - the interaction instance
 */
const resetResponse = function resetResponse(interaction) {
    const $container = containerHelper.get(interaction);

    $('.real-label > input', $container).prop('checked', false);
};

/**
 * Set a new response to the rendered interaction.
 * Please note that it does not reset previous responses.
 *
 * The response format follows the IMS PCI recommendation :
 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
 *
 * Available base types are defined in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10278
 *
 * @param {Object} interaction - the interaction instance
 * @param {Object} response - the PCI formatted response
 */
const setResponse = function setResponse(interaction, response) {
    const $container = containerHelper.get(interaction);

    try {
        _.forEach(pciResponse.unserialize(response, interaction), function (identifier) {
            const $input = $container.find('.real-label > input[value="' + identifier + '"]').prop('checked', true);
            $input.closest('.qti-choice').toggleClass('user-selected', true);
        });
        instructionMgr.validateInstructions(interaction);
    } catch (e) {
        throw new Error('wrong response format in argument : ' + e);
    }
};

/**
 * Return the response of the rendered interaction
 *
 * The response format follows the IMS PCI recommendation :
 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
 *
 * Available base types are defined in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10278
 *
 * @param {Object} interaction - the interaction instance
 * @returns {Object} the response formatted in PCI
 */
const getResponse = function getResponse(interaction) {
    return pciResponse.serialize(_getRawResponse(interaction), interaction);
};

/**
 * Check if a choice interaction is choice-eliminable
 *
 * @param {Object} interaction
 * @returns {boolean}
 */
const isEliminable = function isEliminable(interaction) {
    return /\beliminable\b/.test(interaction.attr('class'));
};

/**
 * Set additional data to the template (data that are not really part of the model).
 * @param {Object} interaction - the interaction
 * @param {Object} [data] - interaction custom data
 * @returns {Object} custom data
 */
const getCustomData = function getCustomData(interaction, data) {
    const listStyleVisible = features.isVisible('taoQtiItem/creator/interaction/choice/property/listStyle');
    const listStyles = (interaction.attr('class') || '').match(/\blist-style-[\w-]+/) || [];
    return _.merge(data || {}, {
        horizontal: interaction.attr('orientation') === 'horizontal',
        listStyle: listStyleVisible ? listStyles.pop() : void 0,
        eliminable: isEliminable(interaction),
        allowEliminationVisible: features.isVisible('taoQtiItem/creator/interaction/choice/property/allowElimination')
    });
};

/**
 * Destroy the interaction by leaving the DOM exactly in the same state it was before loading the interaction.
 * @param {Object} interaction - the interaction
 */
const destroy = function destroy(interaction) {
    const $container = containerHelper.get(interaction);

    $container.find('.choice-area .qti-choice').each(function () {
        const $choice = $(this);
        const timeout = $choice.data('__instructionTimeout');
        if (timeout) {
            clearTimeout(timeout);
        }
    });

    //remove event
    $container.off('.commonRenderer');
    $(document).off('.commonRenderer').off('.choiceInteraction');

    //remove instructions
    instructionMgr.removeInstructions(interaction);

    //remove all references to a cache container
    containerHelper.reset(interaction);
};

/**
 * Set the interaction state. It could be done anytime with any state.
 *
 * @param {Object} interaction - the interaction instance
 * @param {Object} state - the interaction state
 */
const setState = function setState(interaction, state) {
    if (_.isObject(state)) {
        if (state.response) {
            interaction.resetResponse();
            interaction.setResponse(state.response);
        }

        const $container = containerHelper.get(interaction);

        //restore order of previously shuffled choices
        if (_.isArray(state.order) && state.order.length === _.size(interaction.getChoices())) {
            $('.qti-simpleChoice', $container)
                .sort(function (a, b) {
                    const aIndex = _.indexOf(state.order, $(a).data('identifier'));
                    const bIndex = _.indexOf(state.order, $(b).data('identifier'));
                    if (aIndex > bIndex) {
                        return 1;
                    }
                    if (aIndex < bIndex) {
                        return -1;
                    }
                    return 0;
                })
                .detach()
                .appendTo($('.choice-area', $container));
        }

        //restore eliminated choices
        if (isEliminable(interaction) && _.isArray(state.eliminated) && state.eliminated.length) {
            _.forEach(state.eliminated, function (identifier) {
                $container.find('.qti-simpleChoice[data-identifier="' + identifier + '"]').addClass('eliminated');
            });
        }
    }
};

/**
 * Get the interaction state.
 *
 * @param {Object} interaction - the interaction instance
 * @returns {Object} the interaction current state
 */
const getState = function getState(interaction) {
    const $container = containerHelper.get(interaction);
    const state = {};
    const response = interaction.getResponse();

    if (response) {
        state.response = response;
    }

    //we store also the choice order if shuffled
    if (interaction.attr('shuffle') === true) {
        state.order = [];
        $('.qti-simpleChoice', $container).each(function () {
            state.order.push($(this).data('identifier'));
        });
    }

    //store the eliminated choices
    if (isEliminable(interaction)) {
        state.eliminated = [];
        $container.find('.qti-simpleChoice.eliminated').each(function () {
            state.eliminated.push($(this).data('identifier'));
        });
    }

    return state;
};

/**
 * Expose the common renderer for the choice interaction
 * @exports qtiCommonRenderer/renderers/interactions/ChoiceInteraction
 */
export default {
    qtiClass: 'choiceInteraction',
    template: tpl,
    getData: getCustomData,
    render: render,
    getContainer: containerHelper.get,
    setResponse: setResponse,
    getResponse: getResponse,
    resetResponse: resetResponse,
    destroy: destroy,
    setState: setState,
    getState: getState
};
