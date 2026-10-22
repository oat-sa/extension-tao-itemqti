define(['jquery', 'lodash', 'i18n', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'nouislider'], function ($$1, _, __, Handlebars, Helpers0, containerHelper, pciResponse, nouislider) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;

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

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program7(depth0,data) {
      
      var stack1, helper;
      if (helper = helpers.prompt) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.prompt); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      }

      buffer += "<div ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " class=\"qti-interaction qti-blockInteraction qti-sliderInteraction";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-qti-class=\"sliderInteraction\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " >\r\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\r\n    <div class=\"instruction-container\"></div>\r\n</div>\r\n";
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

    var _slideTo = function(options) {
        options.sliderCurrentValue.find('.qti-slider-cur-value').text(options.value);
        options.sliderValue.val(options.value);
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     *
     * @param {object} interaction
     */
    const render = function(interaction) {
        const attributes = interaction.getAttributes(),
            $container = interaction.getContainer(),
            direction = window.getComputedStyle($container[0]).getPropertyValue('direction') || 'ltr',
            $el = $$1('<div />').attr({ id: `${attributes.responseIdentifier}-qti-slider`, class: 'qti-slider' }), //slider element
            $sliderLabels = $$1('<div />').attr({ class: 'qti-slider-values' }),
            $sliderCurrentValue = $$1('<div />').attr({
                id: `${attributes.responseIdentifier}-qti-slider-cur-value`,
                class: 'qti-slider-cur-value'
            }), //show the current selected value
            $sliderValue = $$1('<input />').attr({ type: 'hidden', id: `${attributes.responseIdentifier}-qti-slider-value`, class: 'qti-slider-value' }); //the input that always holds the slider value

        //getting the options
        let orientation = 'horizontal';
        const reverse = typeof attributes.reverse !== 'undefined' && attributes.reverse ? true : false, //setting the slider whether to be reverse or not
            min = parseInt(attributes.lowerBound),
            max = parseInt(attributes.upperBound),
            step = typeof attributes.step !== 'undefined' && attributes.step ? parseInt(attributes.step) : 1, //default value as per QTI standard
            steps = (max - min) / step; //number of the steps

        //add the containers
        $sliderCurrentValue
            .append(`<span class="qti-slider-cur-value-text">${__('Current value:')}</span>`)
            .append('<span class="qti-slider-cur-value"></span>');

        //setting the orientation of the slider
        if (
            typeof attributes.orientation !== 'undefined' &&
            $$1.inArray(attributes.orientation, ['horizontal', 'vertical']) > -1
        ) {
            orientation = attributes.orientation;
        }

        let reversedLabels = false;
        //for vertical only reverse matters
        if(orientation === 'vertical') {
            reversedLabels = reverse;
        }else {
            reversedLabels = ((!reverse && direction === 'rtl') || (reverse && direction !== 'rtl'));
        }

        $sliderLabels
            .append(`<span class="slider-min">${reversedLabels ? max : min }</span>`)
            .append(`<span class="slider-max">${reversedLabels ? min : max}</span>`);

        interaction
            .getContainer()
            .append($el)
            .append($sliderLabels)
            .append($sliderCurrentValue)
            .append($sliderValue);


        let sliderSize = 0;

        if (orientation === 'horizontal') {
            $container.addClass('qti-slider-horizontal');
        } else {
            const maxHeight = 300;
            sliderSize = steps * 20;
            if (sliderSize > maxHeight) {
                sliderSize = maxHeight;
            }
            $container.addClass('qti-slider-vertical');
            $el.height(`${sliderSize}px`);
            $sliderLabels.height(`${sliderSize}px`);
        }

        //set the middle value if the stepLabel attribute is enabled
        if (typeof attributes.stepLabel !== 'undefined' && attributes.stepLabel) {
            const middleStep = parseInt(steps / 2),
                leftOffset = (100 / steps) * middleStep,
                middleValue = reverse ? max - middleStep * step : min + middleStep * step;

            if (orientation === 'horizontal') {
                $sliderLabels
                    .find('.slider-min')
                    .after(`<span class="slider-middle" style="left:'${leftOffset}%">${middleValue}</span>`);
            } else {
                $sliderLabels
                    .find('.slider-min')
                    .after(`<span class="slider-middle" style="top:${leftOffset}%">${middleValue}</span>`);
            }
        }

        //create the slider
        $el.noUiSlider({
            start: reverse ? max : min,
            range: {
                min: min,
                max: max
            },
            step: step,
            orientation,
            direction
        }).on('slide', function() {
            let val = parseInt($$1(this).val());
            if (interaction.attr('reverse')) {
                val = max + min - val;
            }
            val = Math.round(val * 1000) / 1000;
            _slideTo({
                value: val,
                sliderValue: $sliderValue,
                sliderCurrentValue: $sliderCurrentValue
            });

            containerHelper.triggerResponseChangeEvent(interaction);
        });

        _slideTo({
            value: min,
            sliderValue: $sliderValue,
            sliderCurrentValue: $sliderCurrentValue
        });

        //bind event listener in case the attributes change dynamically on runtime
        $$1(document).on('attributeChange.qti-widget.commonRenderer', function(e, data) {
            if (data.element.getSerial() === interaction.getSerial()) {
                if (data.key === 'responseIdentifier' && data.value) {
                    const attributesNew = interaction.getAttributes();
                    // data.value and attributesNew.responseIdentifier is the same
                    $container.find('.qti-slider').attr({ id: `${attributesNew.responseIdentifier}-qti-slider`});
                    $container.find('.qti-slider-cur-value').attr({ id: `${attributesNew.responseIdentifier}-qti-slider-cur-value`});
                    $container.find('.qti-slider-value').attr({ id: `${attributesNew.responseIdentifier}-qti-slider-value`});
                }
            }
        });
    };

    var resetResponse = function(interaction) {
        const attributes = interaction.getAttributes(),
            $container = interaction.getContainer(),
            $el = $container.find(`#${attributes.responseIdentifier}-qti-slider`),
            $sliderValue = $container.find(`#${attributes.responseIdentifier}-qti-slider-value`),
            $sliderCurrentValue = $container.find(`#${attributes.responseIdentifier}-qti-slider-cur-value`),
            min = parseInt(attributes.lowerBound),
            max = parseInt(attributes.upperBound),
            reverse = typeof attributes.reverse !== 'undefined' && attributes.reverse ? true : false,
            startValue = reverse ? max : min;

        _slideTo({
            value: min,
            sliderValue: $sliderValue,
            sliderCurrentValue: $sliderCurrentValue
        });

        $el.val(startValue);
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     *
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response) {
        const attributes = interaction.getAttributes(),
            $container = interaction.getContainer(),
            $sliderValue = $container.find(`#${attributes.responseIdentifier}-qti-slider-value`),
            $sliderCurrentValue = $container.find(`#${attributes.responseIdentifier}-qti-slider-cur-value`),
            $el = $container.find(`#${attributes.responseIdentifier}-qti-slider`),
            min = parseInt(attributes.lowerBound),
            max = parseInt(attributes.upperBound);
        let value;

        value = pciResponse.unserialize(response, interaction)[0];

        _slideTo({
            value: value,
            sliderValue: $sliderValue,
            sliderCurrentValue: $sliderCurrentValue
        });

        $el.val(interaction.attr('reverse') ? max + min - value : value);
    };

    var _getRawResponse = function(interaction) {
        let value;
        const attributes = interaction.getAttributes(),
            baseType = interaction.getResponseDeclaration().attr('baseType'),
            min = parseInt(attributes.lowerBound),
            $container = interaction.getContainer(),
            $sliderValue = $container.find(`#${attributes.responseIdentifier}-qti-slider-value`);

        if (baseType === 'integer') {
            value = parseInt($sliderValue.val());
        } else if (baseType === 'float') {
            value = parseFloat($sliderValue.val());
        }

        return isNaN(value) ? min : value;
    };

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
    const getResponse = function(interaction) {
        return pciResponse.serialize([_getRawResponse(interaction)], interaction);
    };

    const destroy = function(interaction) {
        const $container = interaction.getContainer();

        $container.empty();

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
        }
    };

    /**
     * Get the interaction state.
     *
     * @param {Object} interaction - the interaction instance
     * @returns {Object} the interaction current state
     */
    const getState = function getState(interaction) {
        const state = {};
        const response = interaction.getResponse();

        if (response) {
            state.response = response;
        }
        return state;
    };

    var SliderInteraction = {
        qtiClass: 'sliderInteraction',
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

    return SliderInteraction;

});
