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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA
 */

/**
 * The Question state of the media interaction
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/media',
    'ui/mediaEditor/mediaEditorComponent',
    'ui/resourcemgr',
    'ui/tooltip'
], function($, _, __, stateFactory, Question, formElement, formTpl, mediaEditorComponent){
    'use strict';
    /**
     * media Editor instance if has been initialized
     * @type {null}
     */
    var mediaEditor = null;

    var initQuestionState = function initQuestionState(){
        this.widget.renderInteraction();
    };

    var exitQuestionState = function exitQuestionState(){
        this.widget.destroyInteraction();
    };

    var MediaInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the attribute form : file, type, size, etc.
     */
    MediaInteractionStateQuestion.prototype.initForm = function initForm(){

        var widget             = this.widget;
        var $form              = widget.$form;
        var $container         = widget.$original;
        var options            = widget.options;
        var interaction        = widget.element;
        var isAudio            = false;
        var defaultVideoHeight = 270;
        var defaultAudioHeight = 30;
        var callbacks;
        var $heightContainer, $mediaSizerLabel;

        /**
         * Each change triggers an re rendering of the interaction
         */
        var reRender = _.debounce(function reRender(){
            interaction.attr('responseIdentifier', interaction.attr('responseIdentifier'));
            widget.destroyInteraction();
            widget.renderInteraction();
        }, 1000);

        /**
         * Switch to audio mode:
         * update height and disable the field
         */
        var switchToAudio = function switchToAudio(){
            isAudio = true;

            $heightContainer.hide();
            $mediaSizerLabel.hide();
            interaction.object.attr('height', defaultAudioHeight);
            if (mediaEditor) {
                mediaEditor.destroy();
            }
        };

        /**
         * Switch to video mode:
         * update height and enable the field
         */
        var switchToVideo = function switchToVideo(){
            if(isAudio){
                isAudio = false;
                interaction.object.attr('height', defaultVideoHeight);
                $heightContainer.show();
                $mediaSizerLabel.show();
            }
            $container.off('playerready').on('playerready', function () {
                const originalSize = interaction.mediaElement.getMediaOriginalSize();
                let width = interaction.object.attr('width');
                let height = interaction.object.attr('height');
                const containerWidth = $container.find('.media-container').width();
                // the default % and by that the size of the video is based on the original video size compared to the container size
                if (!width) {
                    width = Math.round(100 / (containerWidth / originalSize.width));
                } else if (height) {
                    // for old format (px and height is set) the default % is calculated on rendered width and height
                    const scaleWidth = width / originalSize.width;
                    let scale = scaleWidth;
                    if (!/youtube/.test(interaction.object.attr('type'))) {
                        const scaleHeight = (Math.max(height, 200) - $container.find('.media-container .controls').height()) / originalSize.height;
                        scale = Math.min(scaleHeight, scaleWidth);
                    }
                    width = Math.round(100 / (containerWidth / (scale * originalSize.width)));
                    interaction.object.removeAttr('height');
                    height = 0;
                }

                if (mediaEditor) {
                    mediaEditor.destroy();
                }
                const onChange = _.debounce((nMedia) => {
                    if (interaction.object.attr('width') !== (nMedia['width'] + '%')) {
                        interaction.object.attr('width', Math.round(nMedia['width']) + '%');
                        reRender();
                    }
                }, 200);
                mediaEditor = mediaEditorComponent($form.find('.media-sizer-panel'),
                    {
                        $node: $container.find('.media-container .media'),
                        $container: $container,
                        type: interaction.object.attr('type'),
                        width,
                        height,
                        responsive: true
                    },
                    {
                        mediaDimension: {
                            active: true,
                            showResponsiveToggle: false
                        }
                    })
                .on('change', onChange);
            });
        };

        /**
         * Switch mode based on file type
         */
        var switchMode = function switchMode(){
            if (/audio/.test(interaction.object.attr('type'))) {
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
                    select : function(e, files){
                        if(files && files.length){
                            // set data field content and maybe detect and set media type here
                            interaction.object.attr('type', files[0].mime);
                            $src.val(files[0].file).trigger('change');
                        }else{
                            $src.trigger('noselection');
                        }
                    },
                    open : function(){
                        //hide tooltip if displayed
                        if($src.data('$tooltip')){
                            $src.blur().data('$tooltip').hide();
                        }
                    },
                    close : function(){
                        //triggers validation :
                        $src.blur();
                    }
                });

            };

            $uploadTrigger.on('click', openResourceMgr);

            //if empty, open file manager immediately
            if(!$src.val()){
                openResourceMgr();
            }
        };

        //initialization binding
        //initialize your form here, you certainly gonna need to modify it:
        //append the form to the dom (this part should be almost ok)
        $form.html(formTpl({
            //tpl data for the interaction
            autostart: !!interaction.attr('autostart'),
            loop:      !!interaction.attr('loop'),
            maxPlays:  parseInt(interaction.attr('maxPlays'), 10),
            pause:     interaction.hasClass('pause'),
            // tpl data for the "object", this part is going to be reused by the "objectWidget"
            // @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10173
            data:      interaction.object.attr('data'),
            type:      interaction.object.attr('type') //use the same as the uploadInteraction, contact jerome@taotesting.com for this
        }));

        formElement.initWidget($form);

        $heightContainer = $('.height-container', $form);
        $mediaSizerLabel = $('.media-sizer-panel-label', $form);

        switchMode();

        //init data change callbacks
        callbacks = {
            autostart : function autostart(boundInteraction, attrValue, attrName){
                interaction.attr(attrName, attrValue);
                reRender();
            },

            loop : function loop(boundInteraction, attrValue, attrName){
                interaction.attr(attrName, attrValue);
                reRender();
            },

            maxPlays : function maxPlays(boundInteraction, attrValue, attrName){
                interaction.attr(attrName, attrValue);
                reRender();
            },

            pause : function pause(boundInteraction, attrValue){
                if(attrValue){
                    if(!$container.hasClass('pause')){
                        $container.addClass('pause');
                        interaction.addClass('pause');
                    }
                } else {
                    $container.removeClass('pause');
                    interaction.removeClass('pause');
                }
            },

            data : function data(boundInteraction, attrValue, attrName){
                var value;
                if(interaction.object.attr(attrName) !== attrValue){
                    interaction.object.attr(attrName, attrValue);

                    value = $.trim(attrValue).toLowerCase();

                    if (/^http(s)?:\/\/(www\.)?youtu/.test(value)) {
                        interaction.object.attr('type', 'video/youtube');
                        switchToVideo();
                    } else if (/audio/.test(interaction.object.attr('type'))) {
                        switchToAudio();
                    } else {
                        switchToVideo();
                    }

                    reRender();
                }
            }
        };

        formElement.setChangeCallbacks($form, interaction, callbacks, {
            invalidate : true
        });

        setUpUploader();
    };

    return MediaInteractionStateQuestion;
});
