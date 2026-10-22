define(['jquery', 'lodash', 'i18n', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'taoQtiItem/qtiCommonRenderer/helpers/patternMask', 'util/locale', 'ui/tooltip', 'core/logger', 'util/converter', 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting'], function ($$1, _, __, Handlebars, Helpers0, containerHelper, instructionMgr, pciResponse, patternMaskHelper, locale, tooltip, loggerFactory, converter, verticalWriting) { 'use strict';

        $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
        _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
        __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
        Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
        Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
        containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
        instructionMgr = instructionMgr && Object.prototype.hasOwnProperty.call(instructionMgr, 'default') ? instructionMgr['default'] : instructionMgr;
        pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;
        patternMaskHelper = patternMaskHelper && Object.prototype.hasOwnProperty.call(patternMaskHelper, 'default') ? patternMaskHelper['default'] : patternMaskHelper;
        locale = locale && Object.prototype.hasOwnProperty.call(locale, 'default') ? locale['default'] : locale;
        tooltip = tooltip && Object.prototype.hasOwnProperty.call(tooltip, 'default') ? tooltip['default'] : tooltip;
        loggerFactory = loggerFactory && Object.prototype.hasOwnProperty.call(loggerFactory, 'default') ? loggerFactory['default'] : loggerFactory;
        converter = converter && Object.prototype.hasOwnProperty.call(converter, 'default') ? converter['default'] : converter;

        if (!Helpers0.__initialized) {
          Helpers0(Handlebars);
          Helpers0.__initialized = true;
        }
        var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
          this.compilerInfo = [4,'>= 1.0.0'];
        helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
          var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

        function program1(depth0,data) {
          
          var buffer = "", stack1;
          buffer += "id=\""
            + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"";
          return buffer;
          }

        function program3(depth0,data) {
          
          var buffer = "", stack1;
          buffer += " "
            + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
          return buffer;
          }

          buffer += "<input\n        ";
          stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
          if(stack1 || stack1 === 0) { buffer += stack1; }
          buffer += "\n        class=\"qti-interaction qti-inlineInteraction qti-textEntryInteraction";
          stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
          if(stack1 || stack1 === 0) { buffer += stack1; }
          buffer += "\"\n        data-serial=\"";
          if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
          else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
          buffer += escapeExpression(stack1)
            + "\"\n        data-qti-class=\"textEntryInteraction\"\n        type=\"text\"\n>";
          return buffer;
          });
        function tpl(data, options, asString) {
          var html = Template(data, options);
          return (asString || true) ? html : $(html);
        }

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
         * Copyright (c) 2014-2022 Open Assessment Technologies SA (under the project TAO-PRODUCT);
         *
         */

        /**
         * Create a logger
         */
        const logger = loggerFactory('taoQtiItem/qtiCommonRenderer/renderers/interactions/TextEntryInteraction.js');

        /**
         * Hide the tooltip for the text input
         * @param {jQuery} $input
         */
        function hideTooltip($input) {
            if ($input.data('$tooltip')) {
                $input.data('$tooltip').hide();
                $input.data('textentry-tooltip-is-shown', false);
            }
        }

        /**
         * Create/Show tooltip for the text input
         * @param {jQuery} $input
         * @param {String} theme
         * @param {String} message
         */
        function showTooltip($input, theme, message) {
            const isVertical = verticalWriting.getIsWritingModeVerticalRl($input);
            message = verticalWriting.wrapDigitsInCombineUpright(message, isVertical);

            if ($input.data('$tooltip')) {
                $input.data('$tooltip').updateTitleContent(message);
            } else {
                let tooltipOptions = {
                    theme: theme,
                    trigger: 'manual',
                    placement: isVertical ? 'right' : 'top',
                    popperOptions: {
                        positionFixed: false,
                        modifiers: {
                            preventOverflow: { escapeWithReference: true },
                            flip: { enabled: false }
                        }
                    }
                };
                const textEntryTooltip = tooltip.create($input, message, tooltipOptions);

                $input.data('$tooltip', textEntryTooltip);
            }

            $input.data('$tooltip').show();
            $input.data('textentry-tooltip-is-shown', true);
        }

        /**
         * Refresh tooltip position
         * @param {jQuery} $input
         */
        function refreshTooltip($input) {
            if ($input.data('$tooltip') && $input.data('textentry-tooltip-is-shown')) {
                $input.data('$tooltip').hide();
                $input.data('$tooltip').show();
            }
        }

        /**
         * Validate the input for decimal values.
         *
         * This function ensures that the input value is either empty or follows
         * the rules for decimal numbers. It allows numbers with optional
         * thousands separators (commas) and a mandatory decimal point (dot).
         *
         * @param {jQuery} $input
         * @param {Object} options - `{ allowMinusOnly: boolean, withTooltip: boolean }`
         */
        function validateDecimalInput($input, { allowMinusOnly = false, withTooltip = true } = {}) {
            const separatorName = {
                '.': __('(dot)'),
                ',': __('(comma)'),
                ' ': __('(space)')
            };
            const value = converter.convert($input.val());
            const thousandsSeparator = locale.getThousandsSeparator();
            const decimalSeparator = locale.getDecimalSeparator();
            const thousandsSeparatorName = separatorName[thousandsSeparator] ? separatorName[thousandsSeparator] : '';
            const decimalSeparatorName = separatorName[decimalSeparator] ? separatorName[decimalSeparator] : '';

            const escapedThousandsSeparator = thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedDecimalSeparator = decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            let regexPattern = `^$|^-?\\d+(${escapedDecimalSeparator}\\d+)?$|^-?\\d*${escapedDecimalSeparator}$|^-?${escapedDecimalSeparator}\\d+$`;
            if (thousandsSeparator) {
                regexPattern += `|^-?\\d{1,3}(${escapedThousandsSeparator}\\d{3})*(${escapedDecimalSeparator}\\d+)?$`;
            }
            if (allowMinusOnly) {
                regexPattern += '|^-$';
            }

            const regex = new RegExp(regexPattern);

            if (!regex.test(value)) {
                $input.addClass('error');

                if (withTooltip) {
                    const decimalError = thousandsSeparator
                        ? __('Invalid value, use %s %s for decimal point and %s %s for thousands separator.',
                            decimalSeparator,
                            decimalSeparatorName,
                            thousandsSeparator,
                            thousandsSeparatorName
                        )
                        : __('Invalid value, use %s %s for decimal point.', decimalSeparator, decimalSeparatorName);
                    showTooltip($input, 'error', decimalError);
                } else {
                    hideTooltip($input);
                }
            } else {
                $input.removeClass('error');
                hideTooltip($input);
            }
        }

        /**
         * Validate the input for integer values.
         * @param {jQuery} $input
         * @param {Object} options - `{ allowMinusOnly: boolean, withTooltip: boolean }`
         */
        function validateIntegerInput($input, { allowMinusOnly = false, withTooltip = true } = {}) {
            const value = converter.convert($input.val());
            const regex = new RegExp(`^${allowMinusOnly ? '-?' : ''}$|^-?\\d+$`);
            if (!regex.test(value)) {
                $input.addClass('error');
                if (withTooltip) {
                    showTooltip($input, 'error', __('Invalid value, should be an integer number.'));
                } else {
                    hideTooltip($input);
                }
            } else {
                $input.removeClass('error');
                hideTooltip($input);
            }
        }

        /**
         * Init rendering, called after template injected into the DOM
         * All options are listed in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
         *
         * @param {object} interaction
         */
        function render(interaction) {
            const attributes = interaction.getAttributes();
            const baseType = interaction.getResponseDeclaration().attr('baseType');
            const $input = interaction.getContainer();
            const serial = $input.data('serial');
            const patternMask = interaction.attr('patternMask');
            const maxChars = parseInt(patternMaskHelper.parsePattern(patternMask, 'chars'), 10);
            let expectedLength;

            // Setting up baseType
            switch (baseType) {
                case 'integer':
                    $input.attr('inputmode', 'numeric');
                    $input
                        .on('input.commonRenderer', () =>
                            validateIntegerInput($input, { allowMinusOnly: true, withTooltip: true })
                        )
                        .on('focus.commonRenderer', () =>
                            validateIntegerInput($input, { allowMinusOnly: false, withTooltip: true })
                        )
                        .on('blur.commonRenderer', () =>
                            validateIntegerInput($input, { allowMinusOnly: false, withTooltip: false })
                        );
                    break;
                case 'float':
                    $input.attr('inputmode', 'decimal');
                    $input
                        .on('input.commonRenderer', () =>
                            validateDecimalInput($input, { allowMinusOnly: true, withTooltip: true })
                        )
                        .on('focus.commonRenderer', () =>
                            validateDecimalInput($input, { allowMinusOnly: false, withTooltip: true })
                        )
                        .on('blur.commonRenderer', () =>
                            validateDecimalInput($input, { allowMinusOnly: false, withTooltip: false })
                        );
                    break;
                default:
                    $input.attr('inputmode', 'text');
            }

            //setting up the width of the input field
            if (attributes.expectedLength) {
                //adding 2 chars to include reasonable padding size
                expectedLength = parseInt(attributes.expectedLength) + 2;
                $input.css('inline-size', expectedLength + 'ch');
                $input.css('min-inline-size', expectedLength + 'ch');
            }

            //checking if there's a placeholder for the input
            if (attributes.placeholderText) {
                $input.attr('placeholder', attributes.placeholderText);
            }

            if (maxChars) {
                let valueBeforeComposition = null;
                let cursorPositionBeforeComposition = null;

                const updateMaxCharsTooltip = () => {
                    const count = $input.val().length;
                    let message;
                    let messageType;

                    if (count) {
                        message = __('%d/%d', count, maxChars);
                    } else {
                        message = __('%d characters allowed', maxChars);
                    }

                    if (count >= maxChars) {
                        $input.addClass('maxed');
                        messageType = 'warning';
                    } else {
                        $input.removeClass('maxed');
                        messageType = 'info';
                    }

                    showTooltip($input, messageType, message);
                    if (count && messageType === 'warning') {
                        hideTooltip($input);
                    }
                };

                const handleCompositionStart = function () {
                    // Store the value and cursor position before composition starts
                    valueBeforeComposition = $input[0].value;
                    cursorPositionBeforeComposition = $input[0].selectionStart;
                };

                const handleCompositionEnd = function () {
                    const currentValue = $input[0].value;
                    const currentLength = currentValue.length;

                    // If composition result exceeds the limit, prevent insertion by restoring previous value
                    if (currentLength > maxChars && valueBeforeComposition !== null) {
                        $input[0].value = valueBeforeComposition;
                        // Restore cursor position
                        if (cursorPositionBeforeComposition !== null) {
                            $input[0].setSelectionRange(cursorPositionBeforeComposition, cursorPositionBeforeComposition);
                        }
                        updateMaxCharsTooltip();
                    }

                    // Clear stored values
                    valueBeforeComposition = null;
                    cursorPositionBeforeComposition = null;
                };

                $input
                    .attr('maxlength', maxChars)
                    .on('focus.commonRenderer', function () {
                        updateMaxCharsTooltip();
                    })
                    .on('keyup.commonRenderer', function () {
                        updateMaxCharsTooltip();
                        containerHelper.triggerResponseChangeEvent(interaction);
                    })
                    .on('blur.commonRenderer', function () {
                        hideTooltip($input);
                    })
                    .on('compositionstart.commonRenderer', handleCompositionStart)
                    .on('compositionend.commonRenderer', handleCompositionEnd);
            } else if (attributes.patternMask) {
                const updatePatternMaskTooltip = () => {
                    const validator = patternMaskHelper.createValidator(attributes.patternMask);

                    hideTooltip($input);

                    if ($input.val()) {
                        if (validator.isValid($input.val())) {
                            $input.removeClass('error');
                        } else {
                            $input.addClass('error');
                            showTooltip($input, 'error', __('This is not a valid answer'));
                        }
                    }
                };

                $input
                    .on('focus.commonRenderer', function () {
                        updatePatternMaskTooltip();
                    })
                    .on('keyup.commonRenderer', function () {
                        updatePatternMaskTooltip();
                        containerHelper.triggerResponseChangeEvent(interaction);
                    })
                    .on('blur.commonRenderer', function () {
                        hideTooltip($input);
                    });
            } else {
                $input.on('keyup.commonRenderer', function () {
                    containerHelper.triggerResponseChangeEvent(interaction);
                });
            }

            //refresh tooltip position when all styles loaded.
            $$1(document).on(`themeapplied.textEntryInteraction-${serial}`, () => {
                refreshTooltip($input);
            });
        }

        function resetResponse(interaction) {
            interaction.getContainer().val('');
        }

        /**
         * Set the response to the rendered interaction.
         *
         * The response format follows the IMS PCI recommendation :
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * Available base types are defined in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
         *
         * Special value: the empty object value {} resets the interaction responses
         *
         * @param {object} interaction
         * @param {object} response
         */
        function setResponse(interaction, response) {
            let responseValue;

            try {
                responseValue = pciResponse.unserialize(response, interaction);
            } catch (e) {
                logger.warn(`setResponse error ${e}`);
            }

            if (responseValue && responseValue.length) {
                interaction.getContainer().val(responseValue[0]);
            }
        }

        /**
         * Return the response of the rendered interaction
         *
         * The response format follows the IMS PCI recommendation :
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * Available base types are defined in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
         *
         * @param {object} interaction
         * @returns {object}
         */
        function getResponse(interaction) {
            const ret = { base: {} };
            const $input = interaction.getContainer();
            const attributes = interaction.getAttributes();
            const baseType = interaction.getResponseDeclaration().attr('baseType');
            const numericBase = attributes.base || 10;

            const inputValue = $input.val();
            let value;

            const patternMask = interaction.attr('patternMask');

            if (
                (patternMask && $input.hasClass('error')) ||
                (attributes.placeholderText && inputValue === attributes.placeholderText)
            ) {
                //invalid response or response equals to the placeholder text are considered empty
                value = '';
            } else {
                const convertedValue = converter.convert(inputValue.trim());
                if (baseType === 'integer') {
                    value = locale.parseInt(convertedValue, numericBase);
                } else if (baseType === 'float') {
                    value = locale.parseFloat(convertedValue);
                } else if (baseType === 'string') {
                    value = convertedValue;
                }
            }

            ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;

            return ret;
        }

        function destroy(interaction) {
            const $interaction = containerHelper.get(interaction);
            const serial = $interaction.data('serial');

            $$1('input.qti-textEntryInteraction').each(function (index, el) {
                const $input = $$1(el);
                if ($input.data('$tooltip')) {
                    $input.data('$tooltip').dispose();
                    $input.removeData('$tooltip');
                }
            });

            //remove event
            $$1(document).off('.commonRenderer');
            $interaction.off('.commonRenderer');
            $$1(document).off(`.textEntryInteraction-${serial}`);

            //remove instructions
            instructionMgr.removeInstructions(interaction);

            //remove all references to a cache container
            containerHelper.reset(interaction);
        }

        /**
         * Set the interaction state. It could be done anytime with any state.
         *
         * @param {Object} interaction - the interaction instance
         * @param {Object} state - the interaction state
         */
        function setState(interaction, state) {
            if (_.isObject(state)) {
                if (state.response) {
                    interaction.resetResponse();
                    interaction.setResponse(state.response);
                }
            }
        }

        /**
         * Get the interaction state.
         *
         * @param {Object} interaction - the interaction instance
         * @returns {Object} the interaction current state
         */
        function getState(interaction) {
            const state = {};
            const response = interaction.getResponse();

            if (response) {
                state.response = response;
            }

            const $input = interaction.getContainer();
            if ($input.hasClass('error')) {
                state.validity = { isValid: false };
            }

            return state;
        }

        var TextEntryInteraction = {
            qtiClass: 'textEntryInteraction',
            template: tpl,
            render: render,
            getContainer: containerHelper.get,
            setResponse: setResponse,
            getResponse: getResponse,
            resetResponse: resetResponse,
            destroy: destroy,
            setState: setState,
            getState: getState
        };

        return TextEntryInteraction;

});
