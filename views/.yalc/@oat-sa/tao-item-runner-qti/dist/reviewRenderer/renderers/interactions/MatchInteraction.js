define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/MatchInteraction'], function (Handlebars, Helpers0, containerHelper, matchInteraction) { 'use strict';

  Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
  Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
  containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
  matchInteraction = matchInteraction && Object.prototype.hasOwnProperty.call(matchInteraction, 'default') ? matchInteraction['default'] : matchInteraction;

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
    
    var stack1, helper;
    if (helper = helpers.prompt) { stack1 = helper.call(depth0, {hash:{},data:data}); }
    else { helper = (depth0 && depth0.prompt); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
    if(stack1 || stack1 === 0) { return stack1; }
    else { return ''; }
    }

  function program9(depth0,data) {
    
    var stack1;
    stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0);
    if(stack1 || stack1 === 0) { return stack1; }
    else { return ''; }
    }

  function program11(depth0,data,depth1) {
    
    var buffer = "", stack1;
    buffer += "\n      <tr>\n        ";
    stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n        ";
    stack1 = helpers.each.call(depth0, (depth1 && depth1.matchSet1), {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      </tr>\n      ";
    return buffer;
    }
  function program12(depth0,data) {
    
    
    return "\n        <td>\n          <label>\n            <input disabled type=\"checkbox\" >\n            <span class=\"icon-checkbox cross\"></span>\n          </label>\n        </td>\n        ";
    }

    buffer += "<div ";
    stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " class=\"qti-interaction qti-blockInteraction qti-matchInteraction";
    stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\" data-serial=\"";
    if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
    else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
    buffer += escapeExpression(stack1)
      + "\" data-qti-class=\"matchInteraction\"";
    stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += ">\n  ";
    stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <div class=\"instruction-container\"></div>\n  <div class=\"match-interaction-area\">\n    <table class=\"matrix\">\n      <thead>\n      <tr>\n        <th> </th>\n        ";
    options={hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data};
    if (helper = helpers.matchSet1) { stack1 = helper.call(depth0, options); }
    else { helper = (depth0 && depth0.matchSet1); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
    if (!helpers.matchSet1) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data}); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      </tr>\n      </thead>\n      <tbody>\n      ";
    options={hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data};
    if (helper = helpers.matchSet2) { stack1 = helper.call(depth0, options); }
    else { helper = (depth0 && depth0.matchSet2); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
    if (!helpers.matchSet2) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(11, program11, data, depth0),data:data}); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      </tbody>\n    </table>\n  </div>\n  <div class=\"notification-container\"></div>\n</div>\n";
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

  const render = interaction => {
      const $container = containerHelper.get(interaction);

      $container.on('click.commonRenderer', 'input[type=checkbox]', e => e.preventDefault());
  };

  /**
   * Expose the common renderer for the match interaction
   * @exports reviewRenderer/renderers/interactions/MatchInteraction
   */
  var MatchInteraction = Object.assign({}, matchInteraction, {template, render});

  return MatchInteraction;

});
