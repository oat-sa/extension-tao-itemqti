define(['handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/UploadInteraction', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'i18n', 'ui/previewer'], function (Handlebars, Helpers0, uploadInteraction, containerHelper, i18n, previewer) { 'use strict';

    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    uploadInteraction = uploadInteraction && Object.prototype.hasOwnProperty.call(uploadInteraction, 'default') ? uploadInteraction['default'] : uploadInteraction;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    i18n = i18n && Object.prototype.hasOwnProperty.call(i18n, 'default') ? i18n['default'] : i18n;

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
      
      var stack1, helper;
      if (helper = helpers.prompt) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.prompt); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      }

      buffer += "<div class=\"qti-interaction qti-blockInteraction qti-uploadInteraction\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n	";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    <div class=\"file-upload fixed-grid-row lft\">\n        <span class=\"file-name placeholder col-8 truncate\"></span>\n        <button type=\"button\" data-control=\"download\" class=\"btn-info small\"><span class=\"icon-download\"></span> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Download", options) : helperMissing.call(depth0, "__", "Download", options)))
        + "</button>\n    </div>\n    <div class=\"file-upload-preview lft visible-file-upload-preview runtime-visible-file-upload-preview\">\n        <p class=\"nopreview\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "No uploaded file", options) : helperMissing.call(depth0, "__", "No uploaded file", options)))
        + "</p>\n    </div>\n</div>\n";
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
    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     * @param {object} response
     */
    function setResponse(interaction, response) {
        const $container = containerHelper.get(interaction);
        const $previewArea = $container.find('.file-upload-preview');
        if (response.base && response.base.file) {
            const downloadLink = document.createElement("a");

            const { name: filename, mime, data } = response.base.file;
            const downloadUrl = data ? `data:${mime};base64,${response.base.file.data}` : '';

            $container
                .find('.file-name')
                .empty()
                .text(filename);

            $container
                .find('[data-control="download"]')
                .on('click', e => {
                    e.preventDefault();
                    downloadLink.href = downloadUrl;
                    downloadLink.download = filename;
                    downloadLink.click();
                });

            $previewArea.previewer({
                url: downloadUrl,
                name: filename,
                mime: mime
            });
        } else {
            $container
                .find('.file-upload')
                .hide();

            $previewArea.css({
                'min-width': '300px',
                'min-height': '200px'
            });
        }
        interaction.data('_response', response);
    }
    function render(interaction) {
        callResetGui(interaction);
        //init response
        interaction.data('_response', { base: null });
    }
    function callResetGui(interaction) {
        const renderer = interaction.getRenderer();
        if (_.isFunction(renderer.resetGui)) {
            renderer.resetGui(interaction);
        }
    }

    var UploadInteraction = Object.assign({}, uploadInteraction, {
        template,
        setResponse,
        render
    });

    return UploadInteraction;

});
