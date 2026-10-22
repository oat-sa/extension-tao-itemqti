define(['jquery', 'lodash', 'i18n', 'core/mimetype', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager', 'taoQtiItem/qtiCommonRenderer/helpers/uploadMime', 'ui/progressbar', 'ui/previewer', 'ui/modal', 'ui/waitForMedia'], function ($$1, _, __, mimetype, Handlebars, Helpers0, containerHelper, instructionMgr, uploadHelper, progressbar, previewer, modal, waitForMedia) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    mimetype = mimetype && Object.prototype.hasOwnProperty.call(mimetype, 'default') ? mimetype['default'] : mimetype;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    instructionMgr = instructionMgr && Object.prototype.hasOwnProperty.call(instructionMgr, 'default') ? instructionMgr['default'] : instructionMgr;
    uploadHelper = uploadHelper && Object.prototype.hasOwnProperty.call(uploadHelper, 'default') ? uploadHelper['default'] : uploadHelper;

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

    function program5(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "accept=\"";
      if (helper = helpers.accept) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.accept); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      return buffer;
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
      buffer += "\n	<div class=\"instruction-container\"></div>\n    <div class=\"file-upload fixed-grid-row lft\">\n        <div class=\"progressbar\"></div>\n        <span class=\"btn-info small col-4\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Browse...", options) : helperMissing.call(depth0, "__", "Browse...", options)))
        + "</span>\n        <span class=\"file-name placeholder col-8 truncate\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "No file selected", options) : helperMissing.call(depth0, "__", "No file selected", options)))
        + "</span>\n        <input type=\"file\" ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.accept), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "/>\n    </div>\n    <div class=\"file-upload-preview lft visible-file-upload-preview runtime-visible-file-upload-preview\">\n        <p class=\"nopreview\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "No preview available", options) : helperMissing.call(depth0, "__", "No preview available", options)))
        + "</p>\n    </div>\n    <div class=\"file-upload-preview-popup modal\">\n        <div class=\"modal-body\">\n        </div>\n    </div>\n</div>\n";
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
     * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
     *
     */

    var _initialInstructions = __('Browse your computer and select the appropriate file.');

    var _readyInstructions = __('The selected file is ready to be sent.');

    /**
     * Validate type of selected file
     * @param file
     * @param interaction
     * @returns {boolean}
     */
    var validateFileType = function validateFileType(file, interaction) {
        var expectedTypes = uploadHelper.getExpectedTypes(interaction, true);
        var filetype = mimetype.getMimeType(file);
        if (expectedTypes.length) {
            return _.indexOf(expectedTypes, filetype) >= 0;
        }
        return true;
    };

    /**
     * Compute the message to be displayed when an invalid file type has been selected
     *
     * @param {Object} interaction
     * @param {Function} userSelectedType
     * @param {Function} messageWrongType
     * @returns {String}
     */
    var getMessageWrongType = function getMessageWrongType(interaction, userSelectedType, messageWrongType) {
        var types = uploadHelper.getExpectedTypes(interaction);
        var expectedTypeLabels = _.map(_.uniq(types), function (type) {
            var mime = _.find(uploadHelper.getMimeTypes(), { mime: type });
            if (mime) {
                return mime.label;
            } else {
                return type;
            }
        });

        if (messageWrongType && _.isFunction(messageWrongType)) {
            return messageWrongType({
                userSelectedType: userSelectedType,
                types: expectedTypeLabels
            });
        } else {
            return __('Wrong type of file. Expected %s. The selected file has the mimetype "%s".',
                expectedTypeLabels.join(__(' or ')),
                userSelectedType
            );
        }
    };

    var _handleSelectedFiles = function _handleSelectedFiles(interaction, file, messageWrongType) {
        var reader;
        var $container = containerHelper.get(interaction);

        // Show information about the processed file to the candidate.
        var filename = file.name;
        var filetype = mimetype.getMimeType(file);
        instructionMgr.removeInstructions(interaction);
        instructionMgr.appendInstruction(interaction, _initialInstructions);

        if (!validateFileType(file, interaction)) {
            instructionMgr.removeInstructions(interaction);
            instructionMgr.appendInstruction(
                interaction,
                getMessageWrongType(interaction, filetype, messageWrongType),
                function () {
                    this.setLevel('error');
                    //clear preview
                }
            );
            instructionMgr.validateInstructions(interaction);
            return;
        }

        $container
            .find('.file-name')
            .empty()
            .append(filename);

        // Let's read the file to get its base64 encoded content.
        reader = new FileReader();

        // Update file processing progress.

        reader.onload = function (e) {
            var base64Data, commaPosition, base64Raw, $previewArea;

            instructionMgr.removeInstructions(interaction);
            instructionMgr.appendInstruction(interaction, _readyInstructions, function () {
                this.setLevel('success');
            });
            instructionMgr.validateInstructions(interaction);

            $container.find('.progressbar').progressbar('value', 100);

            base64Data = e.target.result;
            commaPosition = base64Data.indexOf(',');

            // Store the base64 encoded data for later use.
            base64Raw = base64Data.substring(commaPosition + 1);
            interaction.data('_response', { base: { file: { data: base64Raw, mime: filetype, name: filename } } });

            $previewArea = $container.find('.file-upload-preview');
            $previewArea.previewer({
                url: base64Data,
                name: filename,
                mime: filetype
            });

            // we wait for the image to be completely loaded
            $previewArea.waitForMedia(function () {
                var $originalImg = $previewArea.find('img'),
                    $largeDisplay = $$1('.file-upload-preview-popup'),
                    $item = $$1('.qti-item'),
                    itemWidth = $item.width(),
                    winWidth = $$1(window).width() - 80,
                    fullHeight = $$1('body').height(),
                    imgNaturalWidth,
                    isOversized,
                    modalWidth;

                if (!$originalImg.length) {
                    return;
                }

                imgNaturalWidth = $originalImg[0].naturalWidth;
                isOversized = imgNaturalWidth > itemWidth;
                modalWidth = Math.min(winWidth, imgNaturalWidth);

                $previewArea.toggleClass('clickable', isOversized);

                if (!isOversized) {
                    return;
                }

                $previewArea.on('click', function () {
                    var $modalBody;

                    $$1('.upload-ia-modal-bg').remove();

                    // remove any previous unnecessary content before inserting the preview image
                    $modalBody = $largeDisplay.find('.modal-body');
                    $modalBody.empty().append($originalImg.clone());

                    $largeDisplay
                        .on('opened.modal', function () {
                            // prevents the rest of the page from scrolling when modal is open
                            $$1('.tao-item-scope.tao-preview-scope').css('overflow', 'hidden');

                            $largeDisplay.css({
                                width: modalWidth,
                                height: fullHeight,
                                left: (modalWidth - itemWidth - 40) / -2
                            });
                        })
                        .on('closed.modal', function () {
                            // make the page scrollable again
                            $$1('.tao-item-scope.tao-preview-scope').css('overflow', 'auto');
                        })
                        .modal({ modalOverlayClass: 'modal-bg upload-ia-modal-bg' });
                });
            });
        };

        reader.onloadstart = function onloadstart() {
            instructionMgr.removeInstructions(interaction);
            $container.find('.progressbar').progressbar('value', 0);
        };

        reader.onprogress = function onprogress(e) {
            var percentProgress = Math.ceil((Math.round(e.loaded) / Math.round(e.total)) * 100);
            $container.find('.progressbar').progressbar('value', percentProgress);
        };

        reader.readAsDataURL(file);
    };

    /**
     * Resets the GUI state to the default display.
     *
     * @param {Object} interaction
     */
    function resetGui(interaction) {
        var $container = containerHelper.get(interaction);
        $container.find('.file-name').text(__('No file selected'));
        $container.find('.btn-info').text(__('Browse...'));
    }
    function callResetGui(interaction) {
        const renderer = interaction.getRenderer();
        if (_.isFunction(renderer.resetGui)) {
            renderer.resetGui(interaction);
        }
    }

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     */
    function render(interaction) {
        var changeListener,
            self = this,
            $input;
        var $container = containerHelper.get(interaction);
        callResetGui(interaction);

        instructionMgr.appendInstruction(interaction, _initialInstructions);

        //init response
        interaction.data('_response', { base: null });

        changeListener = function (e) {
            var file = e.target.files[0];

            // Are you really sure something was selected
            // by the user... huh? :)
            if (typeof file !== 'undefined') {
                _handleSelectedFiles(interaction, file, self.getCustomMessage('upload', 'wrongType'));
            }
        };

        $input = $container.find('input');

        $container.find('.progressbar').progressbar();

        if (!window.FileReader) {
            throw new Error('FileReader API not supported! Please use a compliant browser!');
        }
        $input.bind('change', changeListener);

        // IE Specific hack, prevents button to slightly move on click
        $input.bind('mousedown', function (e) {
            e.preventDefault();
            $$1(this).blur();
            return false;
        });
    }
    var resetResponse = function resetResponse(interaction) {
        callResetGui(interaction);
    };

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
    var setResponse = function setResponse(interaction, response) {
        var filename,
            $container = containerHelper.get(interaction);

        if (response.base !== null) {
            filename =
                typeof response.base.file.name !== 'undefined' ? response.base.file.name : 'previously-uploaded-file';
            $container
                .find('.file-name')
                .empty()
                .text(filename);
        }

        interaction.data('_response', response);
    };

    /**
     * Return the response of the rendered interaction
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function getResponse(interaction) {
        return interaction.data('_response');
    };

    var destroy = function destroy(interaction) {
        //remove event
        $$1(document).off('.commonRenderer');
        containerHelper.get(interaction).off('.commonRenderer');

        //remove instructions
        instructionMgr.removeInstructions(interaction);

        //remove all references to a cache container
        containerHelper.reset(interaction);
    };

    /**
     * Set the interaction state. It could be done anytime with any state.
     *
     * @param {Object} interaction - the interaction instance
     * @param {Object} state - the interaction state
     */
    var setState = function setState(interaction, state) {
        if (_.isObject(state)) {
            if (state.response) {
                interaction.resetResponse();
                interaction.setResponse(state.response);
            }
        }
    };

    /**
     * Get the interaction state.
     *
     * @param {Object} interaction - the interaction instance
     * @returns {Object} the interaction current state
     */
    var getState = function getState(interaction) {
        var state = {};
        var response = interaction.getResponse();

        if (response) {
            state.response = response;
        }
        return state;
    };

    /**
     * Set additional data to the template (data that are not really part of the model).
     * @param {Object} interaction - the interaction
     * @param {Object} [data] - interaction custom data
     * @returns {Object} custom data
     * This way we could cover a lot more types. How could this be matched with the preview templates
     * in tao/views/js/ui/previewer.js
     */
    var getCustomData = function getCustomData(interaction, data) {
        return _.merge(data || {}, {
            accept: uploadHelper.getExpectedTypes(interaction, true).join(',')
        });
    };

    var UploadInteraction = {
        qtiClass: 'uploadInteraction',
        template: tpl,
        render: render,
        getContainer: containerHelper.get,
        setResponse: setResponse,
        getResponse: getResponse,
        resetResponse: resetResponse,
        destroy: destroy,
        setState: setState,
        getState: getState,
        getData: getCustomData,

        // Exposed private methods for qtiCreator
        resetGui: resetGui
    };

    return UploadInteraction;

});
