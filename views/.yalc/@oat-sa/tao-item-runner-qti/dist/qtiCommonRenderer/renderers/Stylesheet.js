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
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "media=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.media)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<link \n    href=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.href)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" \n    type=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.type)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" \n    rel=\"stylesheet\" \n    data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" \n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.media), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    />";
      return buffer;
      });
    function tpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

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
     * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
     */

    var Stylesheet = {
        qtiClass: 'stylesheet',
        template: tpl,
        getContainer: containerHelper.get
    };

    return Stylesheet;

});
