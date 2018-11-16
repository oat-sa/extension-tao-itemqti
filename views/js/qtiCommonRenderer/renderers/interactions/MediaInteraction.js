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
 * Copyright (c) 2014-2018 (original work) Open Assessment Technlogies SA
 *
 */

/**
 * Common renderer for the QTI media interaction.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/promise',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/mediaInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'ui/mediaplayer'
], function($, _, __, Promise, tpl, pciResponse, containerHelper, mediaplayer) {
    'use strict';


    //some default values
    var defaults = {
        type   : 'video/mp4',
        video : {
            width: 480,
            height: 270
        },
        audio : {
            width: 400,
            height: 30
        }
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10391
     *
     * @param {object} interaction
     * @fires playerrendered when the player is at least rendered
     * @fires playerready when the player is sucessfully loaded and configured
     */
    var render = function render(interaction) {
        var self = this;
        return new Promise(function(resolve) {

            var $container = containerHelper.get(interaction);
            var media      = interaction.object;
            var $item      = $container.parents('.qti-item');
            var maxPlays   = parseInt(interaction.attr('maxPlays'), 10) || 0;
            var url        = media.attr('data') || '';


            //check if the media can be played (using timesPlayed and maxPlays)
            var canBePlayed = function canBePlayed(){
                var current = parseInt($container.data('timesPlayed'), 10);
                return maxPlays === 0 || maxPlays > current;
            };


            /**
            * Resize video player elements to fit container size
            * @param {Object} mediaElement - player instance
            * @param {jQueryElement} $container   - container element to adapt
            */
            var resize = _.debounce(function resize () {
                var width, height;
                if (interaction.mediaElement){

                    height = $container.find('.media-container').height();
                    width =  $container.find('.media-container').width();

                    interaction.mediaElement.resize(width, height);
                }
            }, 200);


            //intialize the player if not yet done
            var initMediaPlayer = function initMediaPlayer(){
                if (!interaction.mediaElement) {
                    interaction.mediaElement = mediaplayer({
                        url: url && self.resolveUrl(url),
                        type: media.attr('type') || defaults.type,
                        canPause: $container.hasClass('pause'),
                        maxPlays: maxPlays,
                        canSeek: !maxPlays,
                        width: media.attr('width'),
                        height: media.attr('height'),
                        volume: 100,
                        autoStart: !!interaction.attr('autostart') && canBePlayed(),
                        loop: !!interaction.attr('loop'),
                        renderTo: $('.media-container', $container)
                    })
                    .on('render', function() {

                        resize();

                        $(window).off('resize.mediaInteraction')
                            .on('resize.mediaInteraction', resize);

                        $item.off('resize.gridEdit')
                            .on('resize.gridEdit', resize);

                        /**
                         * @event playerrendered
                         */
                        $container.trigger('playerrendered');
                    })
                    .on('ready', function() {
                       /**
                        * @event playerready
                        */
                        $container.trigger('playerready');

                        if (!canBePlayed() ) {
                            this.disable();
                        }

                        // declare the item ready when player is ready to play.
                        resolve();
                    })
                    .on('update', _.throttle(function(){
                        containerHelper.triggerResponseChangeEvent(interaction);
                    }, 1000))
                    .on('ended', function() {
                        $container.data('timesPlayed', $container.data('timesPlayed') + 1);
                        containerHelper.triggerResponseChangeEvent(interaction);

                        if (!canBePlayed() ) {
                            this.disable();
                        }
                    });
                }
            };



            if(_.size(media.attributes) === 0){
                //TODO move to afterCreate
                media.attr('type', defaults.type);
                media.attr('width', $container.innerWidth());

                media.attr('height', defaults.video.height);
                media.attr('data', '');
            }

            //set up the number of times played
            if (!$container.data('timesPlayed')) {
                $container.data('timesPlayed', 0);
            }

            //initialize the component
            $container.on('responseSet', function() {
                initMediaPlayer();
            });

            //gives a small chance to the responseSet event before initializing the player
            initMediaPlayer();
        });
    };

    /**
     * Destroy the current interaction
     * @param {Object} interaction
     */
    var destroy = function(interaction) {
        var $container = containerHelper.get(interaction);

        if (interaction.mediaElement) {
            interaction.mediaElement.destroy();
            interaction.mediaElement = null;
        }

        $('.instruction-container', $container).empty();
        $('.media-container', $container).empty();

        $container.removeData('timesPlayed');

        $(window).off('resize.video');

        //remove all references to a cache container
        containerHelper.reset(interaction);
    };

    /**
     * Get the responses from the interaction
     * @private
     * @param {Object} interaction
     * @returns {Array} of points
     */
    var _getRawResponse = function _getRawResponse(interaction) {
        return [containerHelper.get(interaction).data('timesPlayed') || 0];
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
        var responseValues;
        if (response) {
            try {
                //try to unserialize the pci response
                responseValues = pciResponse.unserialize(response, interaction);
                containerHelper.get(interaction).data('timesPlayed', responseValues[0]);
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
        containerHelper.get(interaction).data('timesPlayed', 0);
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
     * Set the interaction state. It could be done anytime with any state.
     *
     * @param {Object} interaction - the interaction instance
     * @param {Object} state - the interaction state
     */
    var setState  = function setState(interaction, state){

        /**
         * Restore the media player state
         * @private
         * @param {Object} [state]
         * @param {Boolean} [state.muted] - is the player muted
         * @param {Number} [state.volume] - the current volume
         * @param {Number} [state.position] - the position to seek to
         */
        var restorePlayerState = function restorePlayerState(playerState){
            if(playerState && interaction.mediaElement){

                //Volume
                if(_.isNumber(playerState.volume)){
                    interaction.mediaElement.setVolume(playerState.volume);
                }

                //Muted state (always after the volume)
                if(_.isBoolean(playerState.muted)){
                    interaction.mediaElement.mute(playerState.muted);
                    interaction.mediaElement.startMuted = playerState.muted;
                }

                //Position
                if(playerState.position && playerState.position > 0){
                    interaction.mediaElement.seek(playerState.position);
                    if(!interaction.attr('autostart')){
                        interaction.mediaElement.pause();
                    }
                }
            }
        };

        if(_.isObject(state)){
            if(state.response){
                interaction.resetResponse();
                interaction.setResponse(state.response);
            }

            if (_.isPlainObject(state.player) && interaction.mediaElement) {
                if(interaction.mediaElement.is('ready')){
                    restorePlayerState(state.player);
                } else {
                    interaction.mediaElement.on('ready.state', function(){
                        interaction.mediaElement.off('ready.state');
                        restorePlayerState(state.player);
                    });
                }
            }
        }
    };

    /**
     * Get the interaction state.
     *
     * @param {Object} interaction - the interaction instance
     * @returns {Object} the interaction current state
     */
    var getState = function getState(interaction){
        var state =  {};
        var response =  interaction.getResponse();

        if(response){
            state.response = response;
        }

        //collect player's state
        if(interaction.mediaElement) {
            state.player = {
                position : interaction.mediaElement.getPosition(),
                muted    : interaction.mediaElement.is('muted'),
                volume   : interaction.mediaElement.getVolume()
            };
        }
        return state;
    };


    /**
     * Expose the common renderer for the interaction
     * @exports qtiCommonRenderer/renderers/interactions/MediaInteraction
     */
    return {
        qtiClass        : 'mediaInteraction',
        template        : tpl,
        render          : render,
        getContainer    : containerHelper.get,
        setResponse     : setResponse,
        getResponse     : getResponse,
        resetResponse   : resetResponse,
        destroy         : destroy,
        setState        : setState,
        getState        : getState
    };
});
