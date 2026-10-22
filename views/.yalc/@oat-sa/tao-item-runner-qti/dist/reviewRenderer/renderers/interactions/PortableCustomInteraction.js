define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction', 'taoQtiItem/qtiItem/helper/util', 'taoQtiItem/qtiCommonRenderer/helpers/PortableElement', 'taoQtiItem/reviewRenderer/helpers/pci'], function (Handlebars, Helpers0, portableCustomInteraction, util, PortableElement, pci) { 'use strict';

    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    portableCustomInteraction = portableCustomInteraction && Object.prototype.hasOwnProperty.call(portableCustomInteraction, 'default') ? portableCustomInteraction['default'] : portableCustomInteraction;
    util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;
    PortableElement = PortableElement && Object.prototype.hasOwnProperty.call(PortableElement, 'default') ? PortableElement['default'] : PortableElement;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      return "style=\"pointer-events: none;\" ";
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" ";
      return buffer;
      }

      buffer += "<div ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.isInteractionDisabled), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " class=\"qti-interaction qti-customInteraction\"\n    data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    ";
      if (helper = helpers.markup) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.markup); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</div>";
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
     * Copyright (c) 2020-2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
     *
     */

    const getData = function (customInteraction, data) {
        let markup = data.markup;
        const isInteractionDisabled = pci.isInteractionDisabledForPci(data.typeIdentifier);

        // Set review mode on for PCI
        customInteraction.properties.isReviewMode = true;

        //remove ns + fix media file path
        markup = util.removeMarkupNamespaces(markup);
        markup = PortableElement.fixMarkupMediaSources(markup, this);

        return Object.assign({}, data, { markup, isInteractionDisabled });
    };

    /**
     * Set back response for review mode
     * @param {Object} interaction
     * @param {Object} serializedState
     */
    const setState = (interaction, serializedState) => {
        const pciRenderer = interaction.data('pci-renderer');

        // IMS renderer has a special function to restore response
        if (typeof pciRenderer.setReviewState === 'function') {
            pciRenderer.setReviewState(interaction, serializedState);
        } else {
            pciRenderer.setState(interaction, serializedState);
        }
    };

    var PortableCustomInteraction = Object.assign({}, portableCustomInteraction, { template, getData, setState });

    return PortableCustomInteraction;

});
