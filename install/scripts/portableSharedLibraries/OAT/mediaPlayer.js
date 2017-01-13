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

    // fixme: we should find package a lightweight media player as a proper shared lib with no dependencies
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

    return function mediaPlayerFactory(options) {
        var $container  = options.$container,
            maxPlays    = options.maxPlays || 0,
            autostart   = !!options.autostart,
            loop        = !!options.loop,
            media       = options.media;

        var mediaElement;

        /**
         * xxxxx xxxx  xxxx xxx
         */
        return {
            render: function render() {
                var self = this;
                return new Promise(function(resolve) {
                    var $item = $container.parents('.qti-item'); // todo: wtf?!


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
                        if (mediaElement){

                            height = $container.find('.media-container').height();
                            width =  $container.find('.media-container').width();

                            mediaElement.resize(width, height);
                        }
                    }, 200);


                    //intialize the player if not yet done
                    var initMediaPlayer = function initMediaPlayer(){
                        if (!mediaElement) {
                            mediaElement = mediaplayer({
                                // url: url && self.resolveUrl(url),
                                url: media.url || '',
                                type: media.type || defaults.type,
                                canPause: $container.hasClass('pause'), //fixme: wtf?!
                                maxPlays: maxPlays,
                                width: media.width,
                                height: media.height,
                                volume: 100,
                                autoStart: autostart && canBePlayed(),
                                loop: loop,
                                renderTo: $container,
                                _debugMode: true
                            })
                                .on('render', function() {

                                    resize();

                                    $(window).off('resize.mediaInteraction')
                                        .on('resize.mediaInteraction', resize);

                                    $item.off('resize.gridEdit')
                                        .on('resize.gridEdit', resize);

                                    resolve();
                                })
                                .on('ready', function() {
                                    /**
                                     * @event playerready
                                     */
                                    $container.trigger('playerready');
                                })
                                .on('ended', function() {
                                    $container.data('timesPlayed', $container.data('timesPlayed') + 1);

                                    // todo: wtf to do with this ?
                                    // containerHelper.triggerResponseChangeEvent(interaction);

                                    if (!canBePlayed() ) {
                                        this.disable();
                                    }
                                });
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
                    // mediaElement.render();
                });
            },

            //todo: how does this fit into the PCI lifecycle
            destroy: function destroy(interaction) {
                var $container = containerHelper.get(interaction);

                if (mediaElement) {
                    mediaElement.destroy();
                    mediaElement = null;
                }

                $('.instruction-container', $container).empty();
                $('.media-container', $container).empty();

                $container.removeData('timesPlayed');

                $(window).off('resize.video');

                //remove all references to a cache container
                containerHelper.reset(interaction);
            }
        };
    };



});
