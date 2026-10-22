define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/TextEntryInteraction', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'util/locale'], function (Handlebars, Helpers0, textEntryInteraction, containerHelper, pciResponse, locale) { 'use strict';

	Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
	Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
	textEntryInteraction = textEntryInteraction && Object.prototype.hasOwnProperty.call(textEntryInteraction, 'default') ? textEntryInteraction['default'] : textEntryInteraction;
	containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
	pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;
	locale = locale && Object.prototype.hasOwnProperty.call(locale, 'default') ? locale['default'] : locale;

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
	    + "\" ";
	  return buffer;
	  }

	  buffer += "<span ";
	  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n	class=\"qti-interaction qti-inlineInteraction qti-textEntryInteraction review-text-container\"\n	data-serial=\"";
	  if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "\" data-qti-class=\"textEntryInteraction\">\n</span>";
	  return buffer;
	  });
	function template(data, options, asString) {
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
	 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
	 *
	 */

	/**
	 * Init rendering, called after template injected into the DOM
	 * All options are listed in the QTI v2.1 information model:
	 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
	 *
	 * @param {object} interaction
	 */
	const render = interaction => {
	    const attributes = interaction.getAttributes();

	    if (attributes.expectedLength) {
	        const $input = interaction.getContainer();
	    }
	};

	const resetResponse = interaction => {
	    interaction.getContainer().text('');
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
	 * Special value: the empty object value {} resets the interaction responses
	 *
	 * @param {object} interaction
	 * @param {object} response
	 */
	const setResponse = (interaction, response) => {
	    let responseValue;

	    try {
	        responseValue = pciResponse.unserialize(response, interaction);
	    } catch (e) {
	        console.error(e.message);
	    }

	    if (responseValue && responseValue.length) {
	        interaction.getContainer().text(responseValue[0]);
	    }
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
	const getResponse = interaction => {
	    const $input = interaction.getContainer(),
	        attributes = interaction.getAttributes(),
	        baseType = interaction.getResponseDeclaration().attr('baseType'),
	        numericBase = attributes.base || 10;
	    let value;

	    if ($input.hasClass('invalid') || (attributes.placeholderText && $input.text() === attributes.placeholderText)) {
	        //invalid response or response equals to the placeholder text are considered empty
	        value = '';
	    } else if (baseType === 'integer') {
	        value = locale.parseInt($input.text(), numericBase);
	    } else if (baseType === 'float') {
	        value = locale.parseFloat($input.text());
	    } else if (baseType === 'string') {
	        value = $input.text();
	    }

	    return {
	        base: {
	            [baseType]: isNaN(value) && typeof value === 'number' ? '' : value
	        }
	    };
	};

	const destroy = interaction => {
	    //remove all references to a cache container
	    containerHelper.reset(interaction);
	};

	/**
	 * Expose the common renderer for the text entry interaction
	 * @exports qtiCommonRenderer/renderers/interactions/TextEntryInteraction
	 */

	var TextEntryInteraction = Object.assign({}, textEntryInteraction, {
	    template,
	    render,
	    getResponse,
	    setResponse,
	    resetResponse,
	    destroy
	});

	return TextEntryInteraction;

});
