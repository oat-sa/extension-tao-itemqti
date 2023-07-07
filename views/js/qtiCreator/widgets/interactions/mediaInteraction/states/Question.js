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
 * Copyright (c) 2016-2023 (original work) Open Assessment Technologies SA
 */

/**
 * The Question state of the media interaction
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'services/features',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/media',
    'ui/mediaEditor/mediaEditorComponent',
    'ui/resourcemgr',
    'ui/tooltip',
    'url-polyfill'
], function ($, _, __, features, stateFactory, Question, formElement, formTpl, mediaEditorComponent) {
    'use strict';
    /**
     * media Editor instance if has been initialized
     * @type {null}
     */
    let mediaEditor = null;

    const initQuestionState = function initQuestionState() {
        this.widget.renderInteraction();
    };

    const exitQuestionState = function exitQuestionState() {
        this.widget.destroyInteraction();
    };

    const getIsAudio = function getIsAudio(interaction) {
        return /audio/.test(interaction.object.attr('type'));
    };

    const MediaInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the attribute form : file, type, size, etc.
     */
    MediaInteractionStateQuestion.prototype.initForm = function initForm() {
        const widget = this.widget;
        const $form = widget.$form;
        const $container = widget.$original;
        const options = widget.options;
        const interaction = widget.element;
        const isFlaAvailable = features.isVisible('taoQtiItem/creator/interaction/media/property/fla');
        let isAudio = getIsAudio(interaction);
        const defaultVideoHeight = 270;
        const defaultAudioHeight = 30;

        /**
         * Each change triggers an re rendering of the interaction
         */
        const reRender = _.debounce(function reRender() {
            interaction.attr('responseIdentifier', interaction.attr('responseIdentifier'));
            widget.destroyInteraction();
            widget.renderInteraction();
        }, 1000);

        /**
         * Switch to audio mode:
         * update height and disable the field
         */
        const switchToAudio = function switchToAudio() {
            isAudio = true;

            interaction.object.attr('height', defaultAudioHeight);
            if (mediaEditor) {
                mediaEditor.destroy();
            }
        };

        const videoResponsiveWidth = () => {
            const originalSize = interaction.mediaElement.getMediaOriginalSize();
            if (!originalSize.width) {
                // video is not loaded yet
                return 0;
            }
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
                    const scaleHeight =
                        (Math.max(height, 200) - $container.find('.media-container .controls').height()) /
                        originalSize.height;
                    scale = Math.min(scaleHeight, scaleWidth);
                }
                width = Math.round(100 / (containerWidth / (scale * originalSize.width)));
            }
            return width;
        };

        const createMediaEditor = ($panel, width, height, onChange) => {
            if (mediaEditor) {
                mediaEditor.destroy();
            }
            mediaEditor = mediaEditorComponent(
                $panel,
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
                }
            ).on('change', onChange);
        };

        /**
         * Switch to video mode:
         * update height and enable the field
         */
        const switchToVideo = function switchToVideo() {
            if (isAudio) {
                isAudio = false;
                interaction.object.attr('height', defaultVideoHeight);
            }
            interaction.removeClass('hide-player');

            $container.off('playerready').on('playerready', function () {
                let width = interaction.object.attr('width');
                let height = interaction.object.attr('height');
                if (!/%/.test(width)) {
                    width = videoResponsiveWidth(widget);
                    if (!width) {
                        return;
                    }
                    height = 0;
                    interaction.object.removeAttr('height');
                }
                const onChange = _.debounce(nMedia => {
                    if (interaction.object.attr('width') !== `${nMedia['width']}%`) {
                        const newWidth = `${Math.round(nMedia['width'])}%`;
                        interaction.object.attr('width', newWidth);
                        interaction.mediaElement.resize(newWidth, 'auto');
                    }
                }, 200);
                createMediaEditor($form.find('.media-sizer-panel'), width, height, onChange);
            });
        };

        /**
         * Switch mode based on file type
         */
        const switchMode = function switchMode() {
            if (getIsAudio(interaction)) {
                switchToAudio();
            } else {
                switchToVideo();
            }
        };

        /**
         * Set up the file upload component
         */
        const setUpUploader = function setUpUploader() {
            const $src = $form.find('input[name=data]');
            const $uploadTrigger = $form.find('.selectMediaFile');
            const openResourceMgr = function openResourceMgr() {
                $uploadTrigger.resourcemgr({
                    title: __('Please select a media file (video or audio) from the resource manager. You can add files from your computer with the button "Add file(s)".'),
                    appendContainer: options.mediaManager.appendContainer,
                    mediaSourcesUrl: options.mediaManager.mediaSourcesUrl,
                    browseUrl: options.mediaManager.browseUrl,
                    uploadUrl: options.mediaManager.uploadUrl,
                    deleteUrl: options.mediaManager.deleteUrl,
                    downloadUrl: options.mediaManager.downloadUrl,
                    fileExistsUrl: options.mediaManager.fileExistsUrl,
                    params: {
                        uri: options.uri,
                        lang: options.lang,
                        filters:
                            'video/mp4,video/avi,video/ogv,video/mpeg,video/ogg,video/quicktime,video/webm,video/x-ms-wmv,video/x-flv,audio/mp3,audio/vnd.wav,audio/ogg,audio/vorbis,audio/webm,audio/mpeg,application/ogg,audio/aac,audio/wav,audio/flac'
                    },
                    pathParam: 'path',
                    select: function (e, files) {
                        if (files && files.length) {
                            // set data field content and maybe detect and set media type here
                            interaction.object.attr('type', files[0].mime);
                            $src.val(files[0].file).trigger('change');
                        } else {
                            $src.trigger('noselection');
                        }
                    },
                    open: function () {
                        //hide tooltip if displayed
                        if ($src.data('$tooltip')) {
                            $src.blur().data('$tooltip').hide();
                        }
                    },
                    close: function () {
                        //triggers validation :
                        $src.blur();
                    }
                });
            };

            $uploadTrigger.on('click', openResourceMgr);

            //if empty, open file manager immediately
            if (!$src.val()) {
                openResourceMgr();
            }
        };

        const setUpCallbacks = function setUpCallbacks() {
            //init data change callbacks
            const callbacks = {
                autostart: function autostart(boundInteraction, attrValue, attrName) {
                    interaction.attr(attrName, attrValue);
                    if (attrValue === false) {
                        // reset subpanel properties to defaults
                        interaction.removeAttr('data-autostart-delay-ms');
                        interaction.removeClass('hide-player');
                        $container.removeClass('dimmed');
                        interaction.removeClass('sequential');
                    } else if (isFlaAvailable) {
                        interaction.attr('data-autostart-delay-ms', 0);
                    }
                    renderForm();
                    reRender();
                },

                autostartDelayMs: function autostartDelayMs(boundInteraction, attrValue) {
                    const attrValueNumeric = parseInt(attrValue, 10);
                    const attrValueNumericMs = Number.isNaN(attrValueNumeric) ? 0 : attrValueNumeric * 1000;
                    interaction.attr('data-autostart-delay-ms', attrValueNumericMs);
                },

                hidePlayer: function hidePlayer(boundInteraction, attrValue) {
                    // checkbox represents 'display media player' in UI, so attrValue must be inverted to set hide-player
                    interaction.toggleClass('hide-player', !attrValue);
                    $container.toggleClass('dimmed', !attrValue);

                    // reset dependent properties
                    // hidden audio player should not be pausable, and visible one should not use delay (UX)
                    if (attrValue === false) {
                        $container.removeClass('pause');
                        interaction.removeClass('pause');
                    } else if (isFlaAvailable) {
                        interaction.attr('data-autostart-delay-ms', 0);
                    }
                    renderForm();
                },

                sequential: function sequential(boundInteraction, attrValue) {
                    interaction.toggleClass('sequential', attrValue);

                    // reset dependent properties
                    // sequential audio must not use loop or maxPlays greater than 1
                    if (attrValue === true) {
                        interaction.attr('loop', false);
                        interaction.attr('maxPlays', 0);
                    }
                    renderForm();
                },

                loop: function loop(boundInteraction, attrValue, attrName) {
                    interaction.attr(attrName, attrValue);
                },

                maxPlays: function maxPlays(boundInteraction, attrValue, attrName) {
                    interaction.attr(attrName, attrValue);
                },

                pause: function pause(boundInteraction, attrValue) {
                    if (attrValue) {
                        if (!$container.hasClass('pause')) {
                            $container.addClass('pause');
                            interaction.addClass('pause');
                        }
                    } else {
                        $container.removeClass('pause');
                        interaction.removeClass('pause');
                    }
                },

                data: function data(boundInteraction, attrValue, attrName) {
                    let value;
                    let youTubeUrl;
                    let parsedUrl;
                    if (interaction.object.attr(attrName) !== attrValue) {
                        interaction.object.attr(attrName, attrValue);
                        interaction.object.removeAttr('width');
                        interaction.object.removeAttr('height');

                        value = $.trim(attrValue).toLowerCase();

                        if (/^http(s)?:\/\/(www\.)?youtu/.test(value)) {
                            if (attrValue.indexOf('&' > 0)) {
                                youTubeUrl = new URL(attrValue);
                                parsedUrl = new URL(youTubeUrl.origin + youTubeUrl.pathname);
                                parsedUrl.searchParams.append('v', youTubeUrl.searchParams.get('v'));
                                this.value = parsedUrl.toString();
                            }
                            interaction.object.attr('type', 'video/youtube');
                            switchToVideo();
                        } else if (/audio/.test(interaction.object.attr('type'))) {
                            switchToAudio();
                        } else {
                            switchToVideo();
                        }

                        renderForm();
                        reRender();
                    }
                }
            };

            formElement.setChangeCallbacks($form, interaction, callbacks, {
                invalidate: true
            });
        };

        /**
         * Initialize form template and insert it to the DOM (replacing any existing form)
         * Can be called again, as needed
         */
        const renderForm = function renderForm() {
            $form.html(
                formTpl({
                    //tpl data for the interaction
                    isAudio: isAudio,
                    isFlaAvailable: isFlaAvailable,
                    autostart: !!interaction.attr('autostart'),
                    sequential: !!interaction.hasClass('sequential'),
                    hidePlayer: !!interaction.hasClass('hide-player'),
                    autostartDelayMs: Math.floor(parseInt(interaction.attr('data-autostart-delay-ms'), 10) / 1000),
                    loop: !!interaction.attr('loop'),
                    maxPlays: parseInt(interaction.attr('maxPlays'), 10),
                    pause: !!interaction.hasClass('pause'),
                    // tpl data for the "object", this part is going to be reused by the "objectWidget"
                    // @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10173
                    data: interaction.object.attr('data'),
                    type: interaction.object.attr('type') //use the same as the uploadInteraction, contact jerome@taotesting.com for this
                })
            );
            // re-wire all form controls & tooltips
            formElement.initWidget($form);
            switchMode();
            setUpUploader();
            setUpCallbacks();
        };
        renderForm();
    };

    return MediaInteractionStateQuestion;
});
