define(['ui/waitForMedia', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting', 'taoQtiItem/qtiCommonRenderer/helpers/userAgent'], function (waitForMedia, Handlebars, Helpers0, containerHelper, verticalWriting, userAgent) { 'use strict';

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
      buffer += "id=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "class=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "height=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.height)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" ";
      return buffer;
      }

    function program7(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "width=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.width)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" ";
      return buffer;
      }

    function program9(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program11(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " aria-describedby=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-describedby'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program13(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " aria-hidden=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-hidden'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program15(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " aria-label=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-label'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program17(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " aria-labelledby=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-labelledby'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program19(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " aria-live=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-live'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program21(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " role=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.role)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<img\n    data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n    data-qti-class=\"img\"\n    src=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.src)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n    alt=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.alt)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.height), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.width), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-describedby']), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-hidden']), {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-label']), {hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-labelledby']), {hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['aria-live']), {hash:{},inverse:self.noop,fn:self.program(19, program19, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.role), {hash:{},inverse:self.noop,fn:self.program(21, program21, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    />\n";
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

    var Img = {
        qtiClass: 'img',
        template: tpl,
        getContainer: containerHelper.get,
        render: function render(img, data) {
            const $img = containerHelper.get(img);
            const isVerticalWriting = verticalWriting.getIsWritingModeVerticalRl($img);

            if (isVerticalWriting) {
                if ($img.attr('width') && $img.attr('width').endsWith('%') && !$img.attr('height')) {
                    $img.attr('height', img.attr('width'));
                    $img.removeAttr('width');
                }
            }

            /** Safari + vertical writing mode or mixed wirting modes:
             *   image isn't always painted after loading; so change opacity to force browser to repaint the whole scroll container area.
             *   (browser has trouble with understanding which area to repaint, in scroll containers with different writing modes)
             */
            if (userAgent.isSafari()) {
                const $closest = $img.closest("[data-scrolling='true'], .writing-mode-vertical-rl");
                if ($closest.length && !$closest.data('wait-for-img')) {
                    $closest.waitForMedia(() => {
                        setTimeout(() => {
                            if (!$closest.get(0).isConnected) {
                                return;
                            }
                            $closest.removeData('wait-for-img');
                            const opacityStyle = ';opacity:0.98';
                            let style = $closest.attr('style') || '';
                            $closest.attr('style', `${style}${opacityStyle}`);

                            setTimeout(() => {
                                if (!$closest.get(0).isConnected) {
                                    return;
                                }
                                style = ($closest.attr('style') || '').replace(opacityStyle, '');
                                $closest.attr('style', style);
                            }, 200);
                        }, 0);
                    });
                }
                $closest.data('wait-for-img', true);
            }
        }
    };

    return Img;

});
