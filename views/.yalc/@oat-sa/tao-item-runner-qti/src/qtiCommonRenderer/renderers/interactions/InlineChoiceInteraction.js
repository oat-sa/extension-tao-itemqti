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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import $ from 'jquery';
import _ from 'lodash';
import __ from 'i18n';
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/interactions/inlineChoiceInteraction';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import instructionMgr from 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager';
import pciResponse from 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse';
import { getIsWritingModeVerticalRl } from 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting';
import tooltip from 'ui/tooltip';
import 'select2';

/**
 * The value of the "empty" option
 * @type String
 */
const _emptyValue = 'empty';

const _defaultOptions = {
    allowEmpty: true,
    placeholderText: __('select a choice')
};

const optionSelector = 'span[role="option"]';

const getOptionMarkup = opt => $(opt).html();

/**
 * Init rendering, called after template injected into the DOM
 * All options are listed in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
 *
 * @param {object} interaction
 * @param {object} options - object containing available options
 */
const render = function (interaction, options) {
    const opts = _.clone(_defaultOptions);
    const required = !!interaction.attr('required');
    let choiceTooltip;
    const $container = containerHelper.get(interaction);

    _.extend(opts, options);

    if (opts.allowEmpty && !required) {
        $container.find(`span[data-identifier=${_emptyValue}]`).html(`--- ${__('leave empty')}---`);
    } else {
        $container.find(`span[data-identifier=${_emptyValue}]`).remove();
    }

    const getItemDir = () => {
        const itemBody = $('.qti-itemBody');
        const itemDir = itemBody.attr('dir') || 'ltr';
        return itemDir;
    };

    const dirClass = getItemDir();

    const isVertical = getIsWritingModeVerticalRl($container);
    const writingMode = isVertical ? 'vertical-rl' : void 0;
    const serial = $container.data('serial');

    $container.select2({
        data: $container
            .find(optionSelector)
            .map((i, opt) => ({
                id: $(opt).data('identifier'),
                markup: getOptionMarkup(opt)
            }))
            .get(),
        formatResult: function (result) {
            return result.markup;
        },
        formatSelection: function (data) {
            return data.markup;
        },
        escapeMarkup: markup => markup,
        width: 'fit-content',
        placeholder: opts.placeholderText,
        minimumResultsForSearch: -1,
        containerCssClass: `${dirClass}`,
        dropdownCssClass: `qti-inlineChoiceInteraction-dropdown ${dirClass}`,
        writingMode
    });

    const $el = $container.select2('container');

    if (required) {
        //set up the tooltip plugin for the input
        choiceTooltip = tooltip.warning($el, __('A choice must be selected'), {
            placement: isVertical ? 'right' : 'top'
        });
        //don't show immediately - wait for user interaction to avoid positioning issues
        //in vertical writing mode on slow devices (Chromebook), the tooltip may be positioned
        //incorrectly if shown before CSS styles are fully applied. The tooltip will be shown
        //by the select2-close event handler (line 147) if the field is still empty.

        //refresh tooltip position when all styles loaded (only if already visible)
        $(document).on(`themeapplied.inlineChoiceInteraction-${serial}`, () => {
            if (choiceTooltip._isOpen) {
                choiceTooltip.hide();
                choiceTooltip.show();
            }
        });
    }

    $container
        .on('change', function (e) {
            //if tts component is loaded and click-to-speak function is activated - we must fix the situation when select2 prevents tts from working
            //for this a "one-moment" handler of option click is added and removed after event fired
            if ($(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
                const $selectedIndex = $(e.currentTarget)[0].options.selectedIndex
                    ? $(e.currentTarget)[0].options.selectedIndex
                    : null;
                $container.find(optionSelector).one('click', function (ev) {
                    ev.stopPropagation();
                });
                $container.find(optionSelector).eq($selectedIndex).trigger('click');
            }

            if (required && $container.val() !== '') {
                choiceTooltip.hide();
            }

            containerHelper.triggerResponseChangeEvent(interaction);
        })
        .on('select2-open', function () {
            if (required) {
                choiceTooltip.hide();
            }
        })
        .on('select2-close', function () {
            if (required && $container.val() === '') {
                choiceTooltip.show();
            }
        });
};

const _setVal = function (interaction, choiceIdentifier) {
    containerHelper.get(interaction).val(choiceIdentifier).select2('val', choiceIdentifier);
};

const resetResponse = function (interaction) {
    _setVal(interaction, _emptyValue);
};

/**
 * Set the response to the rendered interaction.
 *
 * The response format follows the IMS PCI recommendation :
 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
 *
 * Available base types are defined in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
 *
 * @param {object} interaction
 * @param {object} response
 */
const setResponse = function (interaction, response) {
    _setVal(interaction, pciResponse.unserialize(response, interaction)[0]);
};

const _getRawResponse = function (interaction) {
    const value = containerHelper.get(interaction).val();
    return value && value !== _emptyValue ? [value] : [];
};

/**
 * Return the response of the rendered interaction
 *
 * The response format follows the IMS PCI recommendation :
 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
 *
 * Available base types are defined in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
 *
 * @param {object} interaction
 * @returns {object}
 */
const getResponse = function (interaction) {
    return pciResponse.serialize(_getRawResponse(interaction), interaction);
};

/**
 * Clean interaction destroy
 * @param {Object} interaction
 */
const destroy = function (interaction) {
    const $container = containerHelper.get(interaction);
    const serial = $container.data('serial');

    //remove event
    $(document).off('.commonRenderer');
    $(document).off(`.inlineChoiceInteraction-${serial}`);

    $container.select2('destroy');

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
    let $container;

    if (_.isObject(state)) {
        if (state.response) {
            interaction.resetResponse();
            interaction.setResponse(state.response);
        }

        //restore order of previously shuffled choices
        if (_.isArray(state.order) && state.order.length === _.size(interaction.getChoices())) {
            $container = containerHelper.get(interaction);

            //just in case the dropdown is opened
            $container.select2('disable').select2('close');

            $(optionSelector, $container)
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
                .appendTo($container);

            $container.select2('enable');
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
    let $container;
    const state = {};
    const response = interaction.getResponse();

    if (response) {
        state.response = response;
    }

    //we store also the choice order if shuffled
    if (interaction.attr('shuffle') === true) {
        $container = containerHelper.get(interaction);

        state.order = [];
        $(optionSelector, $container).each(function () {
            state.order.push($(this).data('identifier'));
        });
    }
    return state;
};

/**
 * Expose the common renderer for the inline choice interaction
 * @exports qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction
 */
export default {
    qtiClass: 'inlineChoiceInteraction',
    template: tpl,
    render,
    getContainer: containerHelper.get,
    setResponse,
    getResponse,
    resetResponse,
    destroy,
    setState,
    getState
};
