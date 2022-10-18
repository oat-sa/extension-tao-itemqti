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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicInteraction/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic'
], function ($, _, __, Widget, GraphicWidget, states, GraphicHelper) {
    'use strict';

    /**
     * The Widget that provides components used by the QTI Creator for the GraphicAssociate Interaction.
     *
     * @extends taoQtiItem/qtiCreator/widgets/interactions/Widget
     * @extends taoQtiItem/qtiCreator/widgets/interactions/GraphicInteraction/Widget
     *
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/Widget
     */
    const GraphicAssociateInteractionWidget = _.extend(Widget.clone(), GraphicWidget, {
        /**
         * Set up the widget
         * @see {taoQtiItem/qtiCreator/widgets/interactions/Widget#initCreator}
         * @param {Object} options - extra options
         * @param {String} options.baseUrl - the resource base url
         * @param {jQueryElement} options.choiceForm = a reference to the form of the choices
         */
        initCreator: function (options) {
            this.baseUrl = options.baseUrl;
            this.choiceForm = options.choiceForm;

            this.registerStates(states);

            //call parent initCreator
            Widget.initCreator.call(this);

            const paper = this.createPaper(() => this.scaleChoices());
            if (paper) {
                this.element.paper = paper;
                this.createChoices();
            }
        },
        /**
         * Called back on paper resize to scale the choices coords
         */
        scaleChoices: function () {
            if (this.element.paper) {
                const interaction = this.element;
                const choices = interaction.getChoices();
                _.forEach(choices, choice => {
                    choice.attr(
                        'coords',
                        GraphicHelper.qtiCoords(
                            interaction.paper.getById(choice.serial),
                            interaction.paper,
                            interaction.object.attr('width')
                        )
                    );
                });
            }
        },
        /**
         * Gracefull destroy the widget
         * @see {taoQtiItem/qtiCreator/widgets/Widget#destroy}
         */
        destroy: function () {
            const $container = this.$original;
            const $item = $container.parents('.qti-item');

            //stop listening the resize
            $item.off(`resize.gridEdit.${this.element.serial}`);
            $(window).off(`resize.qti-widget.${this.element.serial}`);
            $container.off(`resize.qti-widget.${this.element.serial}`);

            //call parent destroy
            Widget.destroy.call(this);
        }
    });

    return GraphicAssociateInteractionWidget;
});
