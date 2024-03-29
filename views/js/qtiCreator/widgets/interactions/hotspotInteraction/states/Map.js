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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicScorePopup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/graphicScoreMappingForm',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/deleter',
    'ui/tooltip'
], function (
    $,
    _,
    __,
    stateFactory,
    Map,
    commonRenderer,
    instructionMgr,
    graphicHelper,
    PciResponse,
    answerStateHelper,
    grahicScorePopup,
    mappingFormTpl,
    formElement,
    deleter,
    tooltip
) {
    'use strict';

    /**
     * Initialize the state.
     */
    const initMapState = function initMapState() {
        const widget = this.widget;
        const interaction = widget.element;
        const response = interaction.getResponseDeclaration();

        //really need to destroy before ?
        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);

        if (!interaction.paper) {
            return;
        }

        //add a specific instruction
        instructionMgr.appendInstruction(interaction, __('Please the score of each hotspot choice.'));
        interaction.responseMappingMode = true;

        //here we do not use the common renderer but the creator's widget to get only a basic paper with the choices
        interaction.paper = widget.createPaper();
        widget.createChoices();

        initResponseMapping(widget);

        //set the current corrects responses on the paper
        commonRenderer.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));
    };

    /**
     * Exit the map state
     */
    const exitMapState = function exitMapState() {
        const widget = this.widget;
        const interaction = widget.element;

        if (!interaction.paper) {
            return;
        }

        //destroy the common renderer
        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);
        instructionMgr.removeInstructions(interaction);

        //initialize again the widget's paper
        interaction.paper = widget.createPaper();
        widget.createChoices();
    };

    /**
     * Set up all elements to set the response mapping.
     * TODO this method needs to be split
     * @param {Oject} widget - the current widget
     */
    function initResponseMapping(widget) {
        const scoreTexts = {};
        const interaction = widget.element;
        const $container = widget.$original;
        const isResponsive = $container.hasClass('responsive');
        const $imageBox = $('.main-image-box', $container);
        const response = interaction.getResponseDeclaration();
        const mapEntries = response.getMapEntries();
        let corrects = _.values(response.getCorrect());

        //get the shape of each choice
        _.forEach(interaction.getChoices(), function (choice) {
            const shape = interaction.paper.getById(choice.serial);
            const $popup = grahicScorePopup(interaction.paper, shape, $imageBox, isResponsive);
            let scoreDefault = true;
            if (mapEntries[choice.id()]) {
                scoreDefault = false;
            }
            const score = mapEntries[choice.id()] || response.mappingAttributes.defaultValue || '0';

            //create an SVG  text from the default mapping value
            scoreTexts[choice.serial] = graphicHelper
                .createShapeText(interaction.paper, shape, {
                    id: `score-${choice.serial}`,
                    content: score,
                    style: 'score-text-default',
                    shapeClick: true
                })
                .data('default', scoreDefault);

            //create manually the mapping form (detached)
            const $form = $(
                mappingFormTpl({
                    identifier: choice.id(),
                    correctDefined: answerStateHelper.isCorrectDefined(widget),
                    correct: _.includes(response.getCorrect(), choice.id()),
                    score: score,
                    scoreMin: response.getMappingAttribute('lowerBound'),
                    scoreMax: response.getMappingAttribute('upperBound')
                })
            );

            //set up the form data binding
            formElement.setChangeCallbacks($form, response, {
                score: function (responseParam, value) {
                    const scoreText = scoreTexts[choice.serial];
                    if (value === '') {
                        responseParam.removeMapEntry(choice.id());
                        scoreText.attr({ text: response.mappingAttributes.defaultValue }).data('default', true);
                    } else {
                        responseParam.setMapEntry(choice.id(), value, true);
                        scoreText.attr({ text: value }).data('default', false);
                    }
                },
                correct: function (responseParam, value) {
                    if (value === true) {
                        if (!_.includes(corrects, choice.id())) {
                            corrects.push(choice.id());
                            shape.active = true;
                            graphicHelper.updateElementState(shape, 'active');
                        }
                    } else {
                        corrects = _.without(corrects, choice.id());
                        shape.active = false;
                        graphicHelper.updateElementState(shape, 'basic');
                    }
                    responseParam.setCorrect(corrects);
                }
            });

            shape.click(function () {
                $('.mapping-editor', $container).hide();
                $popup.show();
            });

            $popup.append($form);
        });

        //set up ui components used by the form
        deleter($container);
        tooltip.lookup($container);

        interaction.paper.getById(`bg-image-${interaction.serial}`).click(function () {
            $('.mapping-editor', $container).hide();
        });

        //the click on the cross hides the popup
        $('.mapping-editor', $container).on('click', '.closer', function () {
            $(this).parent('.mapping-editor').hide();
        });

        //update the elements on attribute changes
        widget.on('mappingAttributeChange', function (data) {
            if (data.key === 'defaultValue') {
                _.forEach(scoreTexts, function (scoreText) {
                    if (scoreText.data('default') === true) {
                        scoreText.attr({ text: data.value });
                    }
                });
            }
        });
    }

    /**
     * The map answer state for the hotspot interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Map
     * @exports taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Map
     */
    return stateFactory.create(Map, initMapState, exitMapState);
});
