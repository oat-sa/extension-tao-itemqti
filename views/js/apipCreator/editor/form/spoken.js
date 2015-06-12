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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'i18n',
    'taoQtiItem/apipCreator/editor/form/formHelper',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo/spoken',
    'helpers',
    'handlebars',
    'ui/resourcemgr'
], function ($, __, formHelper, formTpl, helpers, Handlebars) {
    'use strict';

    function Form(accessElementInfo) {
        this.accessElementInfo = accessElementInfo;
    }

    Form.prototype.render = function render() {
        var tplData = {
            spokenText : formHelper.getAttributeValue(this, 'spokenText'),
            textToSpeechPronunciation : formHelper.getAttributeValue(this, 'textToSpeechPronunciation')
        };
        return formTpl(tplData);
    };

    /**
     * Initialize form events.
     * @param {object} $container jQuery element. Popup container.
     * @returns {undefined}
     */
    Form.prototype.initEvents = function initEvents($container) {
        var that = this;

        that.audioFormTemplate = Handlebars.compile($container.find("#audio-file-template").html());

        formHelper.initEvents(this, $container);

        $container.on('click', '.js-remove-audio-file-form', function () {
            var index = $(this).data('audio-file-index');

            that.accessElementInfo.removeAttribute('audioFileInfo[' + index + ']');
            that.buildAudioFileForm($container);
        });
        that.buildAudioFileForm($container);
        that.initResourceMgr($container);
    };

    Form.prototype.buildAudioFileForm = function buildAudioFileForm($container) {
        var that = this,
            audioFormTemplateIndex = 1,
            numberOfAudioFiles = this.accessElementInfo.getAttributeNum('audioFileInfo');
        
        $container.find('.js-audio-file-form-container').hide().empty();
        for (audioFormTemplateIndex; audioFormTemplateIndex <= numberOfAudioFiles; audioFormTemplateIndex++) {
            $container.find('.js-audio-file-form-container').append(that.audioFormTemplate({
                "num" : audioFormTemplateIndex,
                "fileHref" : this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].fileHref'),
                "duration" : this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].duration'),
                "startTime" : this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].startTime')
            }));
            $container.find('.js-audio-file-form-container').show();
        }
    };

    /**
     * Initialize resource manager (for uploading and selecting video files)
     * @param {object} $container jQuery element. Popup container.
     * @returns {undefined}
     */
    Form.prototype.initResourceMgr = function initResourceMgr($container) {
        var that = this,
            $uploadTrigger = $container.find('.js-add-audio-file');

        $uploadTrigger.on('click', function () {
            $uploadTrigger.resourcemgr({
                title : __('Please select a video file from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                appendContainer : '#mediaManager',
                mediaSourcesUrl : helpers._url('getMediaSources', 'QtiCreator', 'taoQtiItem'),
                browseUrl : helpers._url('files', 'ItemContent', 'taoItems'),
                uploadUrl : helpers._url('upload', 'ItemContent', 'taoItems'),
                deleteUrl : helpers._url('delete', 'ItemContent', 'taoItems'),
                downloadUrl : helpers._url('download', 'ItemContent', 'taoItems'),
                fileExistsUrl : helpers._url('fileExists', 'ItemContent', 'taoItems'),
                params : {
                    uri : that.accessElementInfo.apipItem.options.id,
                    lang : "en-US", //TODO set user language
                    filters : 'audio/mpeg3,audio/x-mpeg-3,audio/mpeg,audio/wav,audio/mp3,audio/x-wav,application/octet-stream'
                },
                pathParam : 'path',
                select : function (e, files) {
                    if (files && files.length) {
                        var index = that.accessElementInfo.getAttributeNum('audioFileInfo') + 1;

                        that.accessElementInfo.setAttribute('audioFileInfo[' + index + '].mimeType', files[0].mime);
                        that.accessElementInfo.setAttribute('audioFileInfo[' + index + '].fileHref', files[0].file);
                        that.buildAudioFileForm($container);
                    }
                }
            });
        });
    };

    return Form;
});