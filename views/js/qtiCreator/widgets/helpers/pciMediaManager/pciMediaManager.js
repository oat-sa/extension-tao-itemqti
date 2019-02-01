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
        var $form       = widget.$form,
            options     = widget.options,
            interaction = widget.element,
            configChangeCallback;

        var isAudio            = false,
            defaultVideoHeight = 270,
            defaultAudioHeight = 30,
            $heightContainer;

        var mediaProps         = interaction.properties.media || {},
            mediaPropsDefaults = {
                autostart:      false,
                loop:           false,
                maxPlays:       2,
                replayTimeout:  5,
                pause:          false,
                uri:            null,
                type:           null,
                height:         defaultVideoHeight,
                width:          480
            };

        mediaProps = _.defaults(mediaProps, mediaPropsDefaults);
        interaction.properties.media = mediaProps;

        /**
         * Switch to audio mode:
         * update height and disable the field
         */
        function switchToAudio(){
            isAudio = true;

            $heightContainer.hide();
            mediaProps.height = defaultAudioHeight;
        }

        /**
         * Switch to video mode:
         * update height and enable the field
         */
        function switchToVideo(){
            if(isAudio){
                isAudio = false;
                mediaProps.height = defaultVideoHeight;
                $heightContainer.show();
            }
        }

        /**
         * Switch mode based on file type
         */
        function switchMode(){
            if (/audio/.test(mediaProps.type)) {
                switchToAudio();
            } else {
                switchToVideo();
            }
        }

        /**
         * Set up the file upload component
         */
        function setUpUploader() {

            var $src = $form.find('input[name=uri]');
            var $uploadTrigger = $form.find('.selectMediaFile');

            var openResourceMgr = function openResourceMgr(){
                $uploadTrigger.resourcemgr({
                    title : __('Please select a media file (video or audio) from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                    appendContainer: options.mediaManager.appendContainer,
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
                    select : function select(e, files){
                        if(files && files.length){
                            // set uri field content and maybe detect and set media type here
                            mediaProps.type = files[0].mime;
                            $form.find('input[name=uri]')
                                .val(files[0].file)
                                .trigger('change');
                        }
                    },
                    open : function open(){
                        //hide tooltip if displayed
                        if($src.data('$tooltip')){
                            $src.blur().data('$tooltip').hide();
                        }
                    },
                    close : function close(){
                        //triggers validation :
                        $src.blur();
                    }
                });

            };
            $uploadTrigger.on('click', openResourceMgr);
        }

        configChangeCallback = _.debounce(function confchangeCallback(boundInteraction, value, name) {
            mediaProps[name] = value;
            boundInteraction.triggerPci('configChange', [boundInteraction.getProperties()]);
        }, 500);

        /**
         * The pciMediaManager helper
         */
        return {
            /**
             * Init the helper
             */
            init: function init() {
                $heightContainer = $('.height-container', $form);
                switchMode();
                setUpUploader();
            },

            /**
             * Get the Widget form for the media setting
             * @returns {String}
             */
            getForm: function getForm() {
                return formTpl({
                    autostart:      !!mediaProps.autostart,
                    loop:           !!mediaProps.loop,
                    maxPlays:       parseInt(mediaProps.maxPlays, 10),
                    replayTimeout:  parseInt(mediaProps.replayTimeout, 10),
                    pause:          !!mediaProps.pause,
                    uri:            mediaProps.uri,
                    type:           mediaProps.type,
                    width:          mediaProps.width,
                    height:         mediaProps.height
                });
            },

            /**
             * Get the change callbacks for the form options
             */
            getChangeCallbacks: function getChangeCallbacks() {
                return {
                    autostart:      configChangeCallback,
                    loop:           configChangeCallback,
                    maxPlays:       configChangeCallback,
                    replayTimeout:  configChangeCallback,
                    pause:          configChangeCallback,
                    width:          configChangeCallback,

                    height: function height(boundInteraction, value, name){
                        if(!isAudio){
                            configChangeCallback(boundInteraction, value, name);
                        }
                    },

                    uri: function uri(boundInteraction, value){
                        if(mediaProps.uri !== value){
                            mediaProps.uri = value;

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
            }
        };
    };

    return pciMediaManager;
});
