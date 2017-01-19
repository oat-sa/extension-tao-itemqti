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
define([
    'jquery',
    'lodash',

    // fixme: we should package a lightweight media player as a proper PCI shared lib with no dependencies
    // an option is to refactor the current media player with:
    // - a dependency injection for jquery & lodash (to use the PCI shared ones)
    // - a provider loader to avoid registering the youtube player that loads against Window
    // and create a bundle for the PCI
    'core/promise',
    'ui/mediaplayer'

], function($, _, Promise, mediaplayer) {
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
     * xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
     * @param timesPlayed
     * @param maxPlays
     * @returns {boolean}
     */
    var canBePlayed = function canBePlayed(timesPlayed, maxPlays) {
        return maxPlays === 0 || maxPlays > timesPlayed;
    };

    /**
     * Resize video player elements to fit container size
     * @param {Object} mediaElement - player instance
     * @param {jQuery} $container   - container element to adapt
     */
    var resize = _.debounce(function resize(mediaElement, $container, maxWidth) {
        var newWidth, newHeight;
        if (mediaElement){

            newHeight = $container.height();
            newWidth  = $container.width();
            newWidth  = (maxWidth && newWidth > maxWidth) ? maxWidth : newWidth;

            mediaElement.resize(newWidth, newHeight);
        }
    }, 200);

    /**
     * xxxx xxxx xxxx
     */
    return function mediaPlayerFactory(options) {
        var $container  = options.$container,
            mediaElement,
            timesPlayed = 0,

            // media
            url         = options.url || '',
            type        = options.type || defaults.type,
            width       = options.width || defaults.video.width,
            height      = options.height || defaults.video.height,

            // player options
            autostart       = !!options.autostart,
            pause           = !!options.pause,
            loop            = !!options.loop,
            maxPlays        = options.maxPlays || 0,
            replayTimeout   = options.replayTimeout || 0;

        /**
         * xxxx xxxx xxxx
         */
        return {
            getMediaElement: function getMediaElement() {
                return mediaElement;
            },

            render: function render() {
                var self = this;

                return new Promise(function(resolve) {

                    //intialize the player if not yet done
                    var initMediaPlayer = function initMediaPlayer(){
                        if (!mediaElement) {
                            mediaElement = mediaplayer({
                                url: url,
                                type: type,
                                canPause: pause,
                                maxPlays: maxPlays,
                                replayTimeout: replayTimeout,
                                width: width,
                                height: height,
                                volume: 100,
                                autoStart: autostart && canBePlayed(timesPlayed, maxPlays),
                                loop: loop,
                                renderTo: $container,
                                _debugMode: false
                            })
                                .on('render', function() {
                                    resize(mediaElement, $container, width);

                                    $(window).off('resize.pciMediaPlayer')
                                        .on('resize.pciMediaPlayer', function () {
                                            resize(mediaElement, $container, width);
                                        });

                                    resolve();
                                })
                                .on('ready', function() {
                                    /**
                                     * @event playerready
                                     */
                                    $container.trigger('playerready');
                                })
                                .on('ended', function() {
                                    timesPlayed++; // todo: use mediaElement getTimesPlayed?

                                    if (!canBePlayed(timesPlayed, maxPlays) ) {
                                        this.disable();
                                    }
                                });
                            self.element = mediaElement;
                        }
                    };

                    // todo: find what to do with this
                    /**
                    if(_.size(media.attributes) === 0){
                        //TODO move to afterCreate
                        media.attr('type', defaults.type);
                        media.attr('width', $container.innerWidth());

                        media.attr('height', defaults.video.height);
                        media.attr('data', '');
                    }
                    */

                    initMediaPlayer();
                });
            },

            destroy: function destroy() {
                if (mediaElement) {
                    mediaElement.destroy();
                    mediaElement = null;
                }

                $(window).off('resize.pciMediaPlayer');
            }
        };
    };



});
