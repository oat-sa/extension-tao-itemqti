define(['context', 'lodash', 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'handlebars', 'lib/handlebars/helpers', 'ui/mediaEditor/plugins/mediaAlignment/helper'], function (context, _, verticalWriting, containerHelper, Handlebars, Helpers0, helper) { 'use strict';

    context = context && Object.prototype.hasOwnProperty.call(context, 'default') ? context['default'] : context;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;

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
      buffer += " class=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<figure data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">";
      if (helper = helpers.body) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.body); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "</figure>\n";
      return buffer;
      });
    function imageTpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template$1 = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n<figure \n    data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n>";
      if (helper = helpers.body) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.body); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "</figure>\n";
      return buffer;
      }
    function program2(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " class=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program4(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program6(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n<span data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-figure=\"true\">\n    ";
      if (helper = helpers.body) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.body); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</span>\n";
      return buffer;
      }

      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.showFigure), {hash:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n";
      return buffer;
      });
    function widgetTpl(data, options, asString) {
      var html = Template$1(data, options);
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
     * Copyright (c) 2022-2023 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
     */

    const DISABLE_FIGURE_WIDGET = context.featureFlags['FEATURE_FLAG_DISABLE_FIGURE_WIDGET'];

    var Figure = {
        qtiClass: 'figure',
        getContainer: containerHelper.get,
        template: DISABLE_FIGURE_WIDGET ? imageTpl : widgetTpl,
        getData(elem, data) {
            if (DISABLE_FIGURE_WIDGET) {
                return data;
            }

            let showFigure = false;
            if (
                data.attributes.class &&
                [helper.FLOAT_LEFT_CLASS, helper.FLOAT_RIGHT_CLASS, helper.CENTER_CLASS].includes(data.attributes.class)
            ) {
                showFigure = true;
            } else {
                _.some(elem.bdy['elements'], childElement => {
                    if (childElement.serial.includes('figcaption')) {
                        showFigure = true;
                        data.attributes.class = 'wrap-left';
                        elem.attributes.class = 'wrap-left';
                    }
                });
            }
            data.attributes.showFigure = showFigure;
            elem.attributes.showFigure = showFigure;
            return data;
        },
        render(figure) {
            const $figure = containerHelper.get(figure);
            const $img = $figure.find('img');
            if ($img.length && (DISABLE_FIGURE_WIDGET || $figure.prop('tagName') === 'FIGURE')) {
                // move width from image to figure
                if (
                    verticalWriting.getIsWritingModeVerticalRl($figure) &&
                    $img.attr('height') &&
                    $img.attr('height').endsWith('%') &&
                    !$img.attr('width')
                ) {
                    $figure.css({ height: $img.attr('height') });
                    $img.attr('height', '100%');
                } else {
                    $figure.css({ width: $img.attr('width') });
                    $img.attr('width', '100%');
                }
            }
        }
    };

    return Figure;

});
