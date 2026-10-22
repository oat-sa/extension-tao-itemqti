define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container'], function (Handlebars, Helpers0, containerHelper) { 'use strict';

    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n            <input\n                disabled\n                type=\"radio\"\n                name=\"response-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.interaction)),stack1 == null || stack1 === false ? stack1 : stack1.serial)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n                value=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n                tabindex=\"1\"\n                aria-labelledby=\"choice-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.interaction)),stack1 == null || stack1 === false ? stack1 : stack1.serial)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n            >\n            <span class=\"icon-radio\"></span>\n            ";
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n            <input\n                disabled\n                type=\"checkbox\"\n                name=\"response-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.interaction)),stack1 == null || stack1 === false ? stack1 : stack1.serial)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n                value=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n                tabindex=\"1\"\n                aria-labelledby=\"choice-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.interaction)),stack1 == null || stack1 === false ? stack1 : stack1.serial)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n            >\n            <span class=\"icon-checkbox\"></span>\n            ";
      return buffer;
      }

      buffer += "<li class=\"qti-choice qti-simpleChoice\" data-identifier=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    <div class=\"pseudo-label-box\">\n        <label class=\"real-label\">\n            ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.unique), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n        </label>\n        <div class=\"label-box\">\n            <div class=\"label-content clear\" contenteditable=\"false\" id=\"choice-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.interaction)),stack1 == null || stack1 === false ? stack1 : stack1.serial)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "-"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\">\n                ";
      if (helper = helpers.body) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.body); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n                <svg class=\"overlay-answer-eliminator\">\n                    <line x1=\"0\" y1=\"100%\" x2=\"100%\" y2=\"0\"/>\n                    <line x1=\"0\" y1=\"0\" x2=\"100%\" y2=\"100%\"/>\n                </svg>\n            </div>\n        </div>\n    </div>\n    <label data-eliminable=\"container\" data-label=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Eliminate", options) : helperMissing.call(depth0, "__", "Eliminate", options)))
        + "\">\n        <span data-eliminable=\"trigger\" class=\"icon-checkbox\"></span>\n    </label>\n</li>\n";
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

    var SimpleChoice_ChoiceInteraction = {
        qtiClass: 'simpleChoice.choiceInteraction',
        getContainer: containerHelper.get,
        getData: (choice, data) => Object.assign(data, { unique: parseInt(data.interaction.attributes.maxChoices) === 1 }),
        template
    };

    return SimpleChoice_ChoiceInteraction;

});
