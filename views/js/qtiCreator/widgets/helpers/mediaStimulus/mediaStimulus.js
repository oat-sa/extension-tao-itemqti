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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

/**
 * This helper allow to use the resource manager in a PCI creator widget
 */
define([
    'lodash',
    'i18n',
    'jquery',
    'tpl!taoQtiItem/qtiCreator/widgets/helpers/mediaStimulus/propertiesForm'
], function( _, __, $, formTpl){
    'use strict';

    var mediaStimulus  = function mediaStimulusFactory(widget) {
        var $form              = widget.$form;
        var $container         = widget.$original;
        var options            = widget.options;
        var interaction        = widget.element;
        var isAudio            = false;
        var defaultVideoHeight = 270;
        var defaultAudioHeight = 30;
        var $heightContainer;

        /**
         * Switch to audio mode:
         * update height and disable the field
         */
        var switchToAudio = function switchToAudio(){
            isAudio = true;

            $heightContainer.hide();
            interaction.properties.mediaStimulus.height = defaultAudioHeight;
        };

        /**
         * Switch to video mode:
         * update height and enable the field
         */
        var switchToVideo = function switchToVideo(){
            if(isAudio){
                isAudio = false;
                interaction.properties.mediaStimulus.height = defaultVideoHeight;
                $heightContainer.show();
            }
        };

        /**
         * Switch mode based on file type
         */
        var switchMode = function switchMode(){
            if (/audio/.test(interaction.properties.mediaStimulus.type)) {
                switchToAudio();
            } else {
                switchToVideo();
            }
        };

        /**
         * Set up the file upload component
         */
        var setUpUploader = function setUpUploader() {

            var $src = $form.find('input[name=data]');
            var $uploadTrigger = $form.find('.selectMediaFile');
            var openResourceMgr = function openResourceMgr(){
                $uploadTrigger.resourcemgr({
                    title : __('Please select a media file (video or audio) from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                    appendContainer: options.mediaManager.appendContainer, // todo: WTF ?!
                    mediaSourcesUrl: options.mediaManager.mediaSourcesUrl,
                    browseUrl:       options.mediaManager.browseUrl,
                    uploadUrl:       options.mediaManager.uploadUrl,
                    deleteUrl:       options.mediaManager.deleteUrl,
                    downloadUrl:     options.mediaManager.downloadUrl,
                    fileExistsUrl:   options.mediaManager.fileExistsUrl,
                    params : {
                        uri : options.uri,
                        lang : options.lang,
                        filters : 'video/mp4,video/avi,video/ogv,video/mpeg,video/ogg,video/quicktime,video/webm,video/x-ms-wmv,video/x-flv,audio/mp3,audio/vnd.wav,audio/ogg,audio/vorbis,audio/webm,audio/mpeg,application/ogg,audio/aac,audio/wav,audio/flac'
                    },
                    pathParam : 'path',
                    select : function(e, files){
                        if(files && files.length){
                            // set data field content and maybe detect and set media type here
                            interaction.properties.mediaStimulus.type = files[0].mime;
                            $form.find('input[name=data]')
                                .val(files[0].file)
                                .trigger('change');
                        }
                    },
                    open : function(){
                        //hide tooltip if displayed
                        if($src.data('qtip')){
                            $src.blur().qtip('hide');
                        }
                    },
                    close : function(){
                        //triggers validation :
                        $src.blur();
                    }
                });

            };

            $uploadTrigger.on('click', openResourceMgr);

        };

        // default values
        if (! interaction.properties.mediaStimulus) {
            interaction.properties.mediaStimulus = {};
        }


        function configChangeCallback(boundInteraction, value, name) {
            boundInteraction.properties.mediaStimulus[name] = value;
            boundInteraction.triggerPci('configChange', [boundInteraction.getProperties()]);
        }

        return {
            getForm: function getForm() {
                return formTpl({
                    //tpl data for the interaction
                    autostart: !!interaction.properties.mediaStimulus.autostart,
                    loop:      !!interaction.properties.mediaStimulus.loop,
                    maxPlays:  parseInt(interaction.properties.mediaStimulus.maxPlays, 10),
                    pause:     interaction.hasClass('pause'), //todo: wtf?!
                    data:      interaction.properties.mediaStimulus.data,
                    type:      interaction.properties.mediaStimulus.type, //use the same as the uploadInteraction, contact jerome@taotesting.com for this
                    width:     interaction.properties.mediaStimulus.width,
                    height:    interaction.properties.mediaStimulus.height

                });
            },

            getChangeCallbacks: function getChangeCallbacks() {
                return {
                    autostart:  configChangeCallback,
                    loop:       configChangeCallback,
                    maxPlays:   configChangeCallback,
                    width:      configChangeCallback,

                    height: function height(boundInteraction, value, name){
                        if(!isAudio){
                            configChangeCallback(boundInteraction, value, name);
                        }
                    },

                    // todo: wtf ?!
                    pause : function pause(boundInteraction, value){
                        if(value){
                            if(!$container.hasClass('pause')){
                                $container.addClass('pause');
                                boundInteraction.addClass('pause');
                            }
                        } else {
                            $container.removeClass('pause');
                            boundInteraction.removeClass('pause');
                        }
                    },

                    data : function data(boundInteraction, value){
                        if(boundInteraction.properties.mediaStimulus.data !== value){
                            boundInteraction.properties.mediaStimulus.data = value;

                            value = $.trim(value).toLowerCase();

                            if (/^http(s)?:\/\/(www\.)?youtu/.test(value)) {
                                boundInteraction.object.attr('type', 'video/youtube');
                                switchToVideo();
                            } else if (/audio/.test(boundInteraction.object.attr('type'))) {
                                switchToAudio();
                            } else {
                                switchToVideo();
                            }

                            if(boundInteraction.object && (!boundInteraction.object.attr('width') || parseInt(boundInteraction.object.attr('width'), 10) <= 0)){
                                boundInteraction.object.attr('width', widget.$original.innerWidth());
                            }
                            boundInteraction.triggerPci('configChange', [boundInteraction.getProperties()]);
                        }
                    }
                };
            },

            init: function init() {
                switchMode();
                setUpUploader();
            }

            //todo: shall this implement some kind of destroy ?
        };
    };

    return mediaStimulus;
});
