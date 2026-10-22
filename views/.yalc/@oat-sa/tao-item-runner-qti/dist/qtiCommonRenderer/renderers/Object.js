define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'ui/previewer'], function (Handlebars, Helpers0, containerHelper, previewer) { 'use strict';

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
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<div class=\"qti-object-container\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " >\n</div>\n";
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
     * Copyright (c) 2014 (original work) Open Assessment Technologies SA
     */

    var _Object = {
        qtiClass: 'object',
        template: tpl,
        getContainer: containerHelper.get,
        render: function(obj) {
            var $container = containerHelper.get(obj);
            var previewOptions = {
                url: obj.renderer.resolveUrl(obj.attr('data')),
                mime: obj.attr('type')
            };
            if (obj.attr('height')) {
                previewOptions.height = obj.attr('height');
            }
            if (obj.attr('width')) {
                previewOptions.width = obj.attr('width');
            }
            if (
                obj.metaData.metadataUri
                && obj.metaData.resourceMetadataUrl
                && obj.attr('data').includes('taomedia://mediamanager/')
            ) {
                const transcriptionUrl = obj.metaData.resourceMetadataUrl;
                const metadataUri = encodeURIComponent(obj.metaData.metadataUri);
                const resourceUri = obj.attr('data').replace('taomedia://mediamanager/', '');
                previewOptions.transcriptionUrl = `${transcriptionUrl}?metadataUri=${metadataUri}&resourceUri=${resourceUri}`;
            }
            if (previewOptions.url && previewOptions.mime) {
                $container.previewer(previewOptions);
            }
        }
    };

    return _Object;

});
