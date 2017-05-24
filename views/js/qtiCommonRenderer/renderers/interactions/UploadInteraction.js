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

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'context',
    'core/mimetype',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/uploadInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/uploadMime',
    'ui/progressbar',
    'ui/previewer',
    'ui/modal',
    'ui/waitForMedia'
], function ($, _, __, context, mimetype, tpl, containerHelper, instructionMgr, uploadHelper) {
    'use strict';

    var _initialInstructions = __('Browse your computer and select the appropriate file.');

    var _readyInstructions = __('The selected file is ready to be sent.');

    /**
     * Validate type of selected file
     * @param file
     * @param interaction
     * @returns {boolean}
     */
    var validateFileType = function validateFileType (file, interaction) {
        var expectedTypes = uploadHelper.getExpectedTypes(interaction, true);
        var filetype = mimetype.getMimeType(file);
        if (expectedTypes.length) {
            return (_.indexOf(expectedTypes, filetype) >= 0);
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
    var getMessageWrongType = function getMessageWrongType(interaction, userSelectedType, messageWrongType){
        var types = uploadHelper.getExpectedTypes(interaction);
        var expectedTypeLabels = _.map(_.uniq(types), function(type){
            var mime = _.find(uploadHelper.getMimeTypes(), {mime : type});
            if(mime){
                return mime.label;
            }else{
                return type;
            }
        });

        if(messageWrongType && _.isFunction(messageWrongType)){
            return messageWrongType({
                userSelectedType : userSelectedType,
                types : expectedTypeLabels
            });
        }else{
            return __('Wrong type of file. Expected %s. The selected file has the mimetype "%s".', expectedTypeLabels.join(__(' or ')), userSelectedType);
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
            instructionMgr.appendInstruction(interaction, getMessageWrongType(interaction, filetype, messageWrongType), function () {
                this.setLevel('error');
                //clear preview
            });
            instructionMgr.validateInstructions(interaction);
            return;
        }

        $container.find('.file-name').empty()
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
            interaction.data('_response', {base: {file: {data: base64Raw, mime: filetype, name: filename}}});

            $previewArea = $container.find('.file-upload-preview');
            $previewArea.previewer({
                url: base64Data,
                name: filename,
                mime: filetype
            });

            // we wait for the image to be completely loaded
            $previewArea.waitForMedia(function(){
                var $originalImg = $previewArea.find('img'),
                    $largeDisplay = $('.file-upload-preview-popup'),
                    $item = $('.qti-item'),
                    itemWidth = $item.width(),
                    winWidth = $(window).width() - 80,
                    fullHeight = $('body').height(),
                    imgNaturalWidth,
                    isOversized,
                    modalWidth;

                if(!$originalImg.length) {
                    return;
                }

                imgNaturalWidth = $originalImg[0].naturalWidth;
                isOversized = imgNaturalWidth > itemWidth;
                modalWidth = Math.min(winWidth, imgNaturalWidth);

                $previewArea.toggleClass('clickable', isOversized);

                if(!isOversized) {
                    return;
                }

                $previewArea.on('click', function(){
                    var $modalBody;

                    $('.upload-ia-modal-bg').remove();

                    // remove any previous unnecessary content before inserting the preview image
                    $modalBody = $largeDisplay.find('.modal-body');
                    $modalBody.empty().append($originalImg.clone());

                    $largeDisplay
                        .on('opened.modal', function(){

                            // prevents the rest of the page from scrolling when modal is open
                            $('.tao-item-scope.tao-preview-scope').css('overflow', 'hidden');

                            $largeDisplay.css({
                                width: modalWidth,
                                height: fullHeight,
                                left: (modalWidth - itemWidth -40) / -2
                            });

                        })
                        .on('closed.modal', function(){
                            // make the page scrollable again
                            $('.tao-item-scope.tao-preview-scope').css('overflow', 'auto');

                        })
                        .modal({modalOverlayClass: 'modal-bg upload-ia-modal-bg'});

                });
            });

        };

        reader.onloadstart = function onloadstart() {
            instructionMgr.removeInstructions(interaction);
            $container.find('.progressbar').progressbar('value', 0);
        };

        reader.onprogress = function onprogress(e) {
            var percentProgress = Math.ceil(Math.round(e.loaded) / Math.round(e.total) * 100);
            $container.find('.progressbar').progressbar('value', percentProgress);
        };

        reader.readAsDataURL(file);

    };

    var _resetGui = function _resetGui(interaction) {
        var $container = containerHelper.get(interaction);
        $container.find('.file-name').text(__('No file selected'));
        $container.find('.btn-info').text(__('Browse...'));
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     */
    var render = function render(interaction) {
        var changeListener, self = this, $input;
        var $container = containerHelper.get(interaction);
        _resetGui(interaction);

        instructionMgr.appendInstruction(interaction, _initialInstructions);

        //init response
        interaction.data('_response', {base: null});

        changeListener = function (e) {
            var file = e.target.files[0];

            // Are you really sure something was selected
            // by the user... huh? :)
            if (typeof(file) !== 'undefined') {
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
            $(this).blur();
            return false;
        });
    };

    var resetResponse = function resetResponse(interaction) {
        _resetGui(interaction);
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
        var filename, $container = containerHelper.get(interaction);

        if (response.base !== null) {
            filename = (typeof response.base.file.name !== 'undefined') ? response.base.file.name :
                'previously-uploaded-file';
            $container.find('.file-name').empty()
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
        $(document).off('.commonRenderer');
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
    var getCustomData = function getCustomData (interaction, data) {
        return _.merge(data || {}, {
            accept : uploadHelper.getExpectedTypes(interaction, true).join(',')
        });
    };

    return {
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
        resetGui: _resetGui
    };

});
