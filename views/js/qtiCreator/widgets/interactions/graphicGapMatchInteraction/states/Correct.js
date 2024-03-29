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
 * Copyright (c) 2015-2023 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicGapMatchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse'
], function (_, __, stateFactory, Correct, commonRenderer, instructionMgr, PciResponse) {
    'use strict';

    /**
     * Initialize the state: use the common renderer to set the correct response.
     */
    function initCorrectState() {
        const widget = this.widget;
        const interaction = widget.element;
        const response = interaction.getResponseDeclaration();
        const corrects = _.values(response.getCorrect());

        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);

        if (!interaction.paper) {
            return;
        }

        //add a specific instruction
        instructionMgr.appendInstruction(interaction, __('Please fill the gap with the correct choices below.'));

        widget.createGapImgs();

        //use the common Renderer
        commonRenderer.render.call(interaction.getRenderer(), interaction);

        commonRenderer.setResponse(
            interaction,
            PciResponse.serialize(_.invokeMap(corrects, String.prototype.split, ' '), interaction)
        );

        widget.$container.on('responseChange.qti-widget', function (e, data) {
            if (data.response && data.response.list) {
                response.setCorrect(
                    _.map(data.response.list.directedPair, function (pair) {
                        return pair.join(' ');
                    })
                );
            }
        });
    }

    /**
     * Exit the correct state
     */
    function exitCorrectState() {
        const widget = this.widget;
        const interaction = widget.element;

        if (!interaction.paper) {
            return;
        }

        //stop listening responses changes
        widget.$container.off('responseChange.qti-widget');

        //destroy the common renderer
        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);
        instructionMgr.removeInstructions(interaction);

        //initialize again the widget's paper
        interaction.paper = null;
        interaction.paper = widget.createPaper(_.bind(widget.scaleGapList, widget));
        widget.createChoices();
        widget.createGapImgs();
    }

    /**
     * The correct answer state for the graphicGapMatch interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Correct
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Correct
     */
    return stateFactory.create(Correct, initCorrectState, exitCorrectState);
});
