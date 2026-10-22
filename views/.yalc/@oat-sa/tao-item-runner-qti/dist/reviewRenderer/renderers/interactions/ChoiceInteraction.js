define(['jquery', 'taoQtiItem/qtiCommonRenderer/renderers/interactions/ChoiceInteraction', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter'], function ($, choiceInteraction, containerHelper, sizeAdapter) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    choiceInteraction = choiceInteraction && Object.prototype.hasOwnProperty.call(choiceInteraction, 'default') ? choiceInteraction['default'] : choiceInteraction;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    sizeAdapter = sizeAdapter && Object.prototype.hasOwnProperty.call(sizeAdapter, 'default') ? sizeAdapter['default'] : sizeAdapter;

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

    const render = interaction => {
        const $container = containerHelper.get(interaction);

        if (interaction.attr('orientation') === 'horizontal') {
            sizeAdapter.adaptSize($('.add-option, .result-area .target, .choice-area .qti-choice', $container));
        }
    };

    /**
     * Expose the common renderer for the choice interaction
     * @exports reviewRenderer/renderers/interactions/ChoiceInteraction
     */
    var ChoiceInteraction = Object.assign({}, choiceInteraction, {render});

    return ChoiceInteraction;

});
