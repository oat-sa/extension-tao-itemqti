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
    'taoQtiItem/apipCreator/editor/form/formHelper',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo/spoken',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo/spokenAudioFile',
    'ui/resourcemgr'
], function ($, formHelper, formTpl, audioFileTpl) {
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

        formHelper.initEvents(this, $container);

        $container.on('click', '.js-remove-audio-file-form', function () {
            var index = $(this).data('audio-file-index');

            that.accessElementInfo.removeAttribute('audioFileInfo[' + index + ']');
            that.buildAudioFileForm($container);
        });
        that.buildAudioFileForm($container);
        formHelper.initResourceMgr(this, $container, {
            params : {
                filters : 'audio/mpeg3,audio/x-mpeg-3,audio/mpeg,audio/wav,audio/mp3,audio/x-wav,application/octet-stream'
            },
            select : function (e, files) {
                if (files && files.length) {
                    var index = that.accessElementInfo.getAttributeNum('audioFileInfo') + 1;

                    that.accessElementInfo.setAttribute('audioFileInfo[' + index + '].mimeType', files[0].mime);
                    that.accessElementInfo.setAttribute('audioFileInfo[' + index + '].fileHref', files[0].file);
                    that.buildAudioFileForm($container);
                }
            },
            $uploadTrigger : $container.find('.js-add-audio-file')
        });
    };

    Form.prototype.buildAudioFileForm = function buildAudioFileForm($container) {
        var that = this,
            $audioFileForm,
            audioFormTemplateIndex = 1,
            numberOfAudioFiles = this.accessElementInfo.getAttributeNum('audioFileInfo');

        $container.find('.js-audio-file-form-container').hide().empty();
        for (audioFormTemplateIndex; audioFormTemplateIndex <= numberOfAudioFiles; audioFormTemplateIndex++) {
            $audioFileForm = $(audioFileTpl({
                "num" : audioFormTemplateIndex,
                "fileHref" : this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].fileHref'),
                "duration" : this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].duration'),
                "startTime" : this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].startTime')
            }));
            
            $audioFileForm.find('select[name$="voiceType"]')
                .val(this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].voiceType'));
            $audioFileForm.find('select[name$="voiceSpeed"]')
                .val(this.accessElementInfo.getAttribute('audioFileInfo[' + audioFormTemplateIndex + '].voiceSpeed'));
        
            $container.find('.js-audio-file-form-container').append($audioFileForm).show();
        }
    };

    return Form;
});