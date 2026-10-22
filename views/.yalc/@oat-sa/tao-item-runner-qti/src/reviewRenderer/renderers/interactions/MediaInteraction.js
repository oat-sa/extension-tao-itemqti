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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Ansul Sharma <ansultaotesting.com>
 */
import $ from 'jquery';
import _ from 'lodash';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import pciResponse from 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse';
import mediaInteraction from 'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction';
import mediaplayer from 'ui/mediaplayer';

const defaults = {
    type: 'video/mp4',
    video: {
        height: 270
    }
};

/**
 * Init rendering, called after template injected into the DOM
 * All options are listed in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10391
 *
 * @param {object} interaction
 * @returns {Promise<any>}
 */
function render(interaction) {
    return new Promise((resolve) => {
        const $container = containerHelper.get(interaction);
        const media = interaction.object;
        const $item = $container.parents('.qti-item');
        const url = media.attr('data') || '';

        /**
         * Resize video player elements to fit container size
         * @param {Object} mediaElement - player instance
         */
        const resize = _.debounce(() => {
            if (interaction.mediaElement) {
                const height = $container.find('.media-container').height();
                const width = $container.find('.media-container').width();

                interaction.mediaElement.resize(width, height);
            }
        }, 200);

        //intialize the player if not yet done
        const initMediaPlayer = () => {
            if (!interaction.mediaElement) {
                interaction.mediaElement = mediaplayer({
                    url: url && this.resolveUrl(url),
                    type: media.attr('type') || defaults.type,
                    canPause: true,
                    canSeek: true,
                    width: media.attr('width'),
                    height: media.attr('height'),
                    autoStart: false,
                    loop: false,
                    renderTo: $('.media-container', $container)
                })
                    .on('render', () => {
                        resize();

                        $(window)
                            .off('resize.mediaInteraction')
                            .on('resize.mediaInteraction', resize);

                        $item.off('resize.gridEdit').on('resize.gridEdit', resize);

                        /**
                         * @event playerrendered
                         */
                        $container.trigger('playerrendered');
                    })
                    .on('ready', () => {
                        /**
                         * @event playerready
                         */
                        $container.trigger('playerready');

                        // declare the item ready when player is ready to play.
                        resolve();
                    })
                    .on(
                        'update',
                        _.throttle(() => {
                            containerHelper.triggerResponseChangeEvent(interaction);
                        }, 1000)
                    )
                    .on('ended', () => {
                        containerHelper.triggerResponseChangeEvent(interaction);
                    });
            }
        };

        if (_.size(media.attributes) === 0) {
            //TODO move to afterCreate
            media.attr('type', defaults.type);
            media.attr('width', $container.innerWidth());

            media.attr('height', defaults.video.height);
            media.attr('data', '');
        }

        //initialize the component
        $container.on('responseSet', () => {
            initMediaPlayer();
        });

        //gives a small chance to the responseSet event before initializing the player
        initMediaPlayer();
    });
}

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
 * @param {Object} interaction
 * @param {Object} response
 */
function setResponse(interaction, response) {
    if (response) {
        try {
            const responseValues = pciResponse.unserialize(response, interaction);
            const timesPlayed = parseInt(responseValues[0], 10);
            containerHelper.get(interaction).data('timesPlayed', timesPlayed);
        } catch (e) {
            // something went wrong
        }
    }
}

/**
 * Expose the common renderer for the media interaction
 * @exports reviewRenderer/renderers/interactions/mediaInteraction
 */
export default Object.assign({}, mediaInteraction, { render, setResponse });