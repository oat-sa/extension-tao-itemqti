define(['jquery', 'lodash', 'i18n', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting', 'ui/tooltip', 'select2'], function ($$1, _, __, Handlebars, Helpers0, containerHelper, instructionMgr, pciResponse, verticalWriting, tooltip, select2) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    instructionMgr = instructionMgr && Object.prototype.hasOwnProperty.call(instructionMgr, 'default') ? instructionMgr['default'] : instructionMgr;
    pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;
    tooltip = tooltip && Object.prototype.hasOwnProperty.call(tooltip, 'default') ? tooltip['default'] : tooltip;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

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

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program7(depth0,data) {
      
      var stack1;
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0);
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      }

      buffer += "<span role=\"listbox\" ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " class=\"qti-interaction qti-inlineInteraction qti-inlineChoiceInteraction";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"\n        data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n        data-qti-class=\"inlineChoiceInteraction\"\n        data-has-search=\"false\"\n        ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n>\n    <span role=\"option\" data-identifier=\"empty\"></span>\n    ";
      options={hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data};
      if (helper = helpers.choices) { stack1 = helper.call(depth0, options); }
      else { helper = (depth0 && depth0.choices); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
      if (!helpers.choices) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data}); }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</span>\n";
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
     * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
     *
     */

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

    const getOptionMarkup = opt => $$1(opt).html();

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
            const itemBody = $$1('.qti-itemBody');
            const itemDir = itemBody.attr('dir') || 'ltr';
            return itemDir;
        };

        const dirClass = getItemDir();

        const isVertical = verticalWriting.getIsWritingModeVerticalRl($container);
        const writingMode = isVertical ? 'vertical-rl' : void 0;
        const serial = $container.data('serial');

        $container.select2({
            data: $container
                .find(optionSelector)
                .map((i, opt) => ({
                    id: $$1(opt).data('identifier'),
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
            $$1(document).on(`themeapplied.inlineChoiceInteraction-${serial}`, () => {
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
                if ($$1(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
                    const $selectedIndex = $$1(e.currentTarget)[0].options.selectedIndex
                        ? $$1(e.currentTarget)[0].options.selectedIndex
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
        $$1(document).off('.commonRenderer');
        $$1(document).off(`.inlineChoiceInteraction-${serial}`);

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

                $$1(optionSelector, $container)
                    .sort(function (a, b) {
                        const aIndex = _.indexOf(state.order, $$1(a).data('identifier'));
                        const bIndex = _.indexOf(state.order, $$1(b).data('identifier'));
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
            $$1(optionSelector, $container).each(function () {
                state.order.push($$1(this).data('identifier'));
            });
        }
        return state;
    };

    /**
     * Expose the common renderer for the inline choice interaction
     * @exports qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction
     */
    var InlineChoiceInteraction = {
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

    return InlineChoiceInteraction;

});
