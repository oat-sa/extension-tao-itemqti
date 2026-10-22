define(['lodash', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiItem/helper/container', 'ui/waitForMedia', 'ui/modal'], function (_, Handlebars, Helpers0, containerHelper, coreContainerHelper, waitForMedia, modal) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    coreContainerHelper = coreContainerHelper && Object.prototype.hasOwnProperty.call(coreContainerHelper, 'default') ? coreContainerHelper['default'] : coreContainerHelper;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      return "modal ";
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "<h2 class=\"qti-title modal-title\">"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "</h2>";
      return buffer;
      }

      buffer += "<div id=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-identifier=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.identifier)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\" class=\"";
      stack1 = helpers.unless.call(depth0, (depth0 && depth0.inline), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "qti-modalFeedback ";
      if (helper = helpers.feedbackStyle) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.feedbackStyle); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.title), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    <div class=\"modal-body\">";
      if (helper = helpers.body) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.body); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "</div>\n</div>";
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
     * Copyright (c) 2014-2019 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
     *
     */

    var modalFeedbackRenderer = {
        qtiClass: 'modalFeedback',
        template: tpl,
        getContainer: containerHelper.get,
        width: 600,
        getData: function(fb, data) {
            data.feedbackStyle = coreContainerHelper.getEncodedData(fb, 'modalFeedback');
            return data;
        },
        render: function(modalFeedback, data) {
            var $modal = containerHelper.get(modalFeedback);

            $modal.waitForMedia(function() {
                //when we are sure that media is loaded:
                $modal
                    .on('opened.modal', function() {
                        //set item body height
                        var $itemBody = containerHelper.get(modalFeedback.getRootElement()).children('.qti-itemBody');
                        var requiredHeight = $modal.outerHeight() + parseInt($modal.css('top'));
                        if (requiredHeight > $itemBody.height()) {
                            $itemBody.height(requiredHeight);
                        }
                    })
                    .on('closed.modal', function() {
                        data = data || {};

                        if (_.isFunction(data.callback)) {
                            data.callback.call(this);
                        }
                    })
                    .modal({
                        startClosed: false,
                        minHeight: modalFeedbackRenderer.minHeight,
                        width: modalFeedbackRenderer.width
                    });
            });
        }
    };

    return modalFeedbackRenderer;

});
