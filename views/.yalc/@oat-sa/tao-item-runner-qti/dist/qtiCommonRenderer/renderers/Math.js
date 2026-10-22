define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'mathJax', 'jquery'], function (Handlebars, Helpers0, containerHelper, MathJax, $$1) { 'use strict';

    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    MathJax = MathJax && Object.prototype.hasOwnProperty.call(MathJax, 'default') ? MathJax['default'] : MathJax;
    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "<span data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-qti-class=\"math\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "><math display=\"block\">";
      if (helper = helpers.raw) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.raw); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "</math></span>";
      return buffer;
      }
    function program2(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program4(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "<span data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-qti-class=\"math\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "><math>";
      if (helper = helpers.raw) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.raw); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "</math></span>";
      return buffer;
      }

      stack1 = helpers['if'].call(depth0, (depth0 && depth0.block), {hash:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
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

    // Do not wait between rendering each individual math element
    // http://docs.mathjax.org/en/latest/api/hub.html
    if (typeof MathJax !== 'undefined' && MathJax) {
        MathJax.Hub.processSectionDelay = 0;
    }

    var _Math = {
        qtiClass: 'math',
        template: tpl,
        getContainer: containerHelper.get,
        render: function render(math) {
            $$1('body').on('mathjaxRendered', function (event, reference) {
                if ($$1(reference).find('math').length !== 0) {
                    $$1(reference).closest('.qti-choice').addClass('flexible-choice-width');
                }
            });

            return new Promise(function (resolve) {
                const $self = containerHelper.get(math);
                if (typeof MathJax !== 'undefined' && MathJax) {
                    //MathJax needs to be exported globally to integrate with tools like TTS, it's weird...
                    if (!window.MathJax) {
                        window.MathJax = MathJax;
                    }
                    //defer execution fix some rendering issue in chrome
                    if ($self.length) {
                        MathJax.Hub.Queue(['Typeset', MathJax.Hub, $self[0]]);
                        MathJax.Hub.Queue(function () {
                            $$1('body').trigger('mathjaxRendered', [$self[0]]);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            });
        }
    };

    return _Math;

});
