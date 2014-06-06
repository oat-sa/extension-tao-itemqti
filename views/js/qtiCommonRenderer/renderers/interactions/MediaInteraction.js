/**
 * @author
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/mediaInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'mediaElement'
], function($, _, __, tpl, pciResponse, Helper, MediaElementPlayer) {

    var getMediaType = function(media) {
        var type = '';
        var mimetype = media.type;
        if(mimetype !== ''){
            if (mimetype.indexOf('youtube') !== -1) {
                type = 'video/youtube';
            } else if(mimetype.indexOf('video') === 0){
                type = 'video';
            } else if(mimetype.indexOf('audio') === 0){
                type = 'audio';
            }
        }
        return type;
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10391
     * 
     * @param {object} interaction
     */
    var render = function render(interaction, isCreator) {
        var $container = Helper.getContainer(interaction);

        if (isCreator) {
            //use this defaults when creating new empty item in the creator
            var mediaDefaults = {
                data: '',
                type: 'video/mp4',
                //type: 'video/youtube',
                width: 480,
                height: 270
            };
            _.defaults(interaction.object.attributes, mediaDefaults);
        }
        
        var media = interaction.object.attributes;
        var mimeType = media.type;
        var baseUrl = interaction.renderer.getOption('baseUrl');
        var mediaType = getMediaType(media);
        var playFromPauseEvent = false;
        var pauseFromClick = false;
        
        var mediaOptions = {
            defaultVideoWidth: 480,
            defaultVideoHeight: 270,
            videoWidth: media.width,
            videoHeight: media.height,
            audioWidth: media.width ? media.width : 400,
            audioHeight: 30,
            features: (mediaType ==='audio') ? ['playpause', 'current', 'duration', 'volume'] : ['current', 'duration', 'volume'],
            startVolume: 1,
            loop: interaction.attributes.loop ? interaction.attributes.loop : false,
            enableAutosize: true,
            alwaysShowControls: true,
            iPadUseNativeControls: false,
            iPhoneUseNativeControls: false,
            AndroidUseNativeControls: false,
            alwaysShowHours: false,
            enableKeyboard: false,
            pauseOtherPlayers: false,
            success: function(mediaElement, playerDom) {
                var audioPlayPauseControls = $(playerDom).closest('div.mejs-container').find('.mejs-playpause-button');
                
                $(audioPlayPauseControls).on('click', function(event) {
                    pauseFromClick = true;
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                });
                
                var bigPlayButtonLayerDetached = null;
                var flashOverlayDiv = null;

                if ($container.data('timesPlayed') === undefined) {
                    $container.data('timesPlayed', 0);
                }
                
                if (interaction.attributes.autostart && ((interaction.attributes.maxPlays===0) || $container.data('timesPlayed') < interaction.attributes.maxPlays) ) {
                    mediaElement.addEventListener('canplay', function() {
                        mediaElement.play();
                    }, false);
                }

                
                mediaElement.addEventListener('loadedmetadata', function() {
                    
                });
                
                
                mediaElement.addEventListener('ended', function(event) {
                    // this event does not get fired on Chrome under Linux, this is fixed in Chrome version 35 which at this moment is in beta,
                    //  there is a workaround by using the "timeupdate" event and the mediaElement.ended property,
                    //  but it brings a whole lot more problems, also timeupdate is not fired when flash fallback is used
                    $container.data('timesPlayed', $container.data('timesPlayed')+1);
                    Helper.triggerResponseChangeEvent(interaction);
                    if ((interaction.attr('maxPlays') === 0 ) || $container.data('timesPlayed') < interaction.attr('maxPlays')) {
                        if (mediaType=='audio') {
                            //
                        } else if (mediaType === 'video' && mediaElement.pluginType !== 'flash') {
                            var PlayButtonPlaceholder = $(playerDom).closest('div.mejs-container').find('.mejs-layers');
                            PlayButtonPlaceholder.append(bigPlayButtonLayerDetached);
                            
                            // fix problem with Chrome not being able to loop videos served by TAO's PHP
                            // !!!!! this fix works, BUT IT CAUSES THE MEDIA FILE TO BE RELOADED, WHICH WILL CAUSE MORE TRAFFIC OVER THE NETWORK
                            // THE FOLLOWING THREE LINES SHOULD BE REMOVED ONCE THE PHP METHOD SERVING MEDIA FILES IS FIXED TO SERVE PARTIALS REQUESTS
                            if (mediaIsServedByTAOsPHP && mediaOptions.loop) {
                                mediaElement.load();
                            }
                            
                        } else if (mediaType === 'video/youtube' || mediaElement.pluginType==='flash') {
                            flashOverlayDiv.remove();
                        }
                    }
                }, false);
                
                
                mediaElement.addEventListener('play', function(event) {
                    if (playFromPauseEvent === true) {
                        playFromPauseEvent = false;
                    } else {
                        if ((interaction.attributes.maxPlays!==0) && $container.data('timesPlayed') >= interaction.attributes.maxPlays) {
                            mediaElement.pause();
                            mediaElement.setSrc('');
                            if (mediaType === "video/youtube") {
                                $(playerDom).empty();
                            }
                        } else {
                            if (mediaType === 'audio') {
                                //
                            } else if (mediaType === 'video' && mediaElement.pluginType!=='flash') {
                                bigPlayButtonLayerDetached = $(playerDom).closest('div.mejs-container').find('.mejs-overlay-play').detach();
                            } else if(mediaType === 'video/youtube' || mediaElement.pluginType==='flash') {
                                var controlsHeight = $(playerDom).closest('div.mejs-container').find('div.mejs-controls').outerHeight();
                                $(playerDom).closest('div.mejs-container').find('.mejs-layers').append('<div class="flashOverlayDiv" style="background:#000; width: '+mediaOptions.videoWidth+'px; height: '+(mediaOptions.videoHeight-controlsHeight)+'px; z-iindex: 99; position:relative;"></div>');
                                flashOverlayDiv = $(playerDom).closest('div.mejs-container').find('.mejs-layers').find('.flashOverlayDiv');
                                flashOverlayDiv.css({'opacity': 0}); // need to have the background set to something and then set it to transparent with jquery because of... IE8 of course :)
                            }
                        }
                    }
                }, false);
                
                mediaElement.addEventListener('pause', function(event) {
                    // there is a "pause" event fired at the end of a movie and we need to differentiate it from pause event caused by a click
                    if (pauseFromClick) {
                        playFromPauseEvent = true;
                        pauseFromClick = false;
                        mediaElement.play();
                    }
                });
            },
            
            error: function(playerDom) {
                $(playerDom).closest('div.mejs-container').find('.me-cannotplay').remove();
            }
        };

        
        var meHtmlContainer = $container.children('.instruction-container').first();
        
        if (mediaOptions.videoWidth === undefined) {
            mediaOptions.videoWidth = mediaOptions.defaultVideoWidth;
        }
        if (mediaOptions.videoHeight === undefined) {
            mediaOptions.videoHeight = mediaOptions.defaultVideoHeight;
        }
        
        var mediaFullUrl = media.data;
        var mediaIsServedByTAOsPHP = false;
        
        if (mediaType === 'video' || mediaType === 'audio') {
            mediaFullUrl = media.data.trim();
            var mediaDataLower = mediaFullUrl.toLowerCase();
            if ( mediaDataLower.indexOf('http://www.') !== 0 && mediaDataLower.indexOf('http://') !== 0 && mediaDataLower.indexOf('www.') !== 0 ) {
                mediaFullUrl = baseUrl+mediaFullUrl;
                mediaIsServedByTAOsPHP = true;
            }
        }
        
        var meTagTypeAddition = mediaIsServedByTAOsPHP?' type="'+ mimeType +'" ':' ';
        

        var $meTag;
        if (mediaType === 'video') {
            $meTag = $('<video src="' + mediaFullUrl + '" width="' + mediaOptions.videoWidth + 'px" height="' + mediaOptions.videoHeight + 'px" '+meTagTypeAddition+' preload="metadata"></video>').appendTo(meHtmlContainer);
        } else if (mediaType === 'video/youtube') {
            $meTag = $('<video width="' + mediaOptions.videoWidth + 'px" height="' + mediaOptions.videoHeight + 'px" preload="none"> '+
                ' <source type="video/youtube" src="'+ mediaFullUrl +'" /> ' +
                '</video>').appendTo(meHtmlContainer);
        } else if (mediaType === 'audio') {
            $meTag = $('<audio src="' + mediaFullUrl + '" width="' + mediaOptions.audioWidth + 'px" '+meTagTypeAddition+' preload="metadata"></audio>').appendTo(meHtmlContainer);
        }
        
        $meTag.on('contextmenu', function(event) {
            event.preventDefault();
        })
        .on('click', function(event) {
            pauseFromClick = true;
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        
        
        if (isCreator) {
            new MediaElementPlayer($meTag, mediaOptions);
        } else {
            $container.on('responseSet', function(e, interaction, response){
                new MediaElementPlayer($meTag, mediaOptions);
            });
        }

    };
    
    var _destroy = function(interaction) {
        var $container = Helper.getContainer(interaction);
        $container.children('.instruction-container').empty();
        Helper.getContainer(interaction).removeData('timesPlayed', 0);
    };

    /**
     * Get the responses from the interaction
     * @private 
     * @param {Object} interaction
     * @returns {Array} of points
     */
    var _getRawResponse = function _getRawResponse(interaction) {
        return [ Helper.getContainer(interaction).data('timesPlayed') ];
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
     * Special value: the empty object value {} resets the interaction responses
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response) {
        if (response) {
            try {
                //try to unserialize the pci response
                var responseValues;
                responseValues = pciResponse.unserialize(response, interaction);
                Helper.getContainer(interaction).data('timesPlayed', responseValues[0]);
            } catch (e) {
                // something went wrong
            }
        }
    };

    /**
     * Reset the current responses of the rendered interaction.
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     * 
     * Special value: the empty object value {} resets the interaction responses
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var resetResponse = function resetResponse(interaction) {
        Helper.getContainer(interaction).data('timesPlayed', 0);
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
    var getResponse = function(interaction) {
        return  pciResponse.serialize(_getRawResponse(interaction), interaction);
    };

    /**
     * Expose the common renderer for the interaction
     * @exports qtiCommonRenderer/renderers/interactions/mediaInteraction
     */
    return {
        qtiClass: 'mediaInteraction',
        template: tpl,
        render: render,
        getContainer: Helper.getContainer,
        setResponse: setResponse,
        getResponse: getResponse,
        resetResponse: resetResponse,
        destroy: _destroy
    };
});
