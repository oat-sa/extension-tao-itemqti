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
    'tpl!taoQtiItem/qtiCreator/widgets/helpers/pciMediaManager/propertiesForm'
], function( _, __, $, formTpl){
    'use strict';

    var pciMediaManager  = function pciMediaManagerFactory(widget) {
        var $form              = widget.$form;
        var $container         = widget.$original;
        var options            = widget.options;
        var interaction        = widget.element;
        var mediaProps         = interaction.properties.media;
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
            mediaProps.height = defaultAudioHeight;
        };

        /**
         * Switch to video mode:
         * update height and enable the field
         */
        var switchToVideo = function switchToVideo(){
            if(isAudio){
                isAudio = false;
                mediaProps.height = defaultVideoHeight;
                $heightContainer.show();
            }
        };

        /**
         * Switch mode based on file type
         */
        var switchMode = function switchMode(){
            if (/audio/.test(mediaProps.type)) {
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
                            mediaProps.type = files[0].mime;
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
        if (!mediaProps) {
            mediaProps = {
                height: defaultVideoHeight,
                autostart: false,
                loop: false,
                maxPlays: 10,
                object: {}
            };
            interaction.properties.mediaProps = mediaProps;
        }

        function configChangeCallback(boundInteraction, value, name) {
            mediaProps[name] = value;
            boundInteraction.triggerPci('configChange', [boundInteraction.getProperties()]);
        }

        return {
            getForm: function getForm() {
                return formTpl({
                    //tpl data for the interaction
                    autostart: !!mediaProps.autostart,
                    loop:      !!mediaProps.loop,
                    maxPlays:  parseInt(mediaProps.maxPlays, 10),
                    pause:     interaction.hasClass('pause'), //todo: wtf?!
                    data:      mediaProps.data,
                    type:      mediaProps.type, //use the same as the uploadInteraction, contact jerome@taotesting.com for this
                    width:     mediaProps.width,
                    height:    mediaProps.height

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
                        if(mediaProps.data !== value){
                            mediaProps.data = value;

                            value = $.trim(value).toLowerCase();

                            if (/^http(s)?:\/\/(www\.)?youtu/.test(value)) {
                                mediaProps.type = 'video/youtube';
                                switchToVideo();
                            } else if (/audio/.test(mediaProps.type)) {
                                switchToAudio();
                            } else {
                                switchToVideo();
                            }

                            if(mediaProps && (!mediaProps.width || parseInt(mediaProps.width, 10) <= 0)){
                                mediaProps.width = widget.$original.innerWidth();
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

    return pciMediaManager;
});
