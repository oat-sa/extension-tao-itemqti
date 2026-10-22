define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'ui/resizeObserver', 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting'], function (Handlebars, Helpers0, containerHelper, resizeObserverHelper, verticalWriting) { 'use strict';

    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    resizeObserverHelper = resizeObserverHelper && Object.prototype.hasOwnProperty.call(resizeObserverHelper, 'default') ? resizeObserverHelper['default'] : resizeObserverHelper;

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
      buffer += " "
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "summary=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.summary)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<table\n    class=\"qti-table";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"\n    data-qti-class=\"table\"\n    data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.summary), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    >\n    ";
      if (helper = helpers.body) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.body); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</table>\n";
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
     * Copyright (c) 2017-2026 (original work) Open Assessment Technologies SA;
     */

    function render(table) {
        const $table = containerHelper.get(table);

        if (verticalWriting.getIsWritingModeVerticalRl($table)) {
            _fixSafariCaption($table);
        }
    }

    function destroy(table) {
        const $table = containerHelper.get(table);
        _destroySafariCaption($table);
    }

    /**
     * Safari + `writing-mode: vertical-rl`:
     *  all `position: relative` elements inside table get shifted by the size of caption.
     * So in css, give `block-size: 0` to the caption,
     *  but show its inner content (`overflow: visible`), and shift the whole table by the caption's size.
     * @param {JQuery} $table
     */
    function _fixSafariCaption($table) {
        const $caption = $table.find('caption');
        if ($caption.length) {
            $caption.addClass('no-block-size').wrapInner('<span/>');
            const resizeObserverCallback = entry => {
                requestAnimationFrame(() => {
                    const captionBlockSize = entry.borderBoxSize[0].blockSize;
                    $table.get(0).style.setProperty('--caption-block-size', `${captionBlockSize}px`);
                });
            };
            resizeObserverHelper.observe($table.find('caption > span'), resizeObserverCallback);
            $table.data('resizeObserverCallback', resizeObserverCallback);
        }
    }

    function _destroySafariCaption($table) {
        const $captionSpan = $table.find('caption.no-block-size > span');
        if ($captionSpan.length) {
            resizeObserverHelper.unobserve($captionSpan, $table.data('resizeObserverCallback'));
        }
    }

    var Table = {
        qtiClass: 'table',
        getContainer: containerHelper.get,
        template: tpl,
        render: render,
        destroy: destroy
    };

    return Table;

});
