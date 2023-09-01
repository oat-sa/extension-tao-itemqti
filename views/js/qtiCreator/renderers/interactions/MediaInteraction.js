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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/interactions/mediaInteraction'
], function(_, MediaInteraction, MediaInteractionWidget, tpl){
    'use strict';

    MediaInteraction = _.clone(MediaInteraction);

    MediaInteraction.template = tpl;

    MediaInteraction.render = function(interaction, options){


        options = options || {};
        options.baseUrl = this.getOption('baseUrl');
        //options.choiceForm = this.getOption('choiceOptionForm');
        options.uri = this.getOption('uri');
        options.lang = this.getOption('lang');
        options.mediaManager = this.getOption('mediaManager');
        options.assetManager = this.getAssetManager();

        MediaInteractionWidget.build(
            interaction,
            MediaInteraction.getContainer(interaction),
            this.getOption('interactionOptionForm'),
            this.getOption('responseOptionForm'),//note : no response required...
            options
        );

        $(document).on('open-preview.qti-item', () => {
            interaction.mediaElement.execute('stop');
        });
    };

    return MediaInteraction;
});
