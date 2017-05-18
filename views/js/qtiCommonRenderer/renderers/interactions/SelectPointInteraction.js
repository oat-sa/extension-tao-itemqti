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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * The Common Render for the Select Point Interaction
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/promise',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/selectPointInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager'
], function($, _, __, Promise, tpl, graphic, pciResponse, containerHelper, instructionMgr){
    'use strict';

    /**
     * Get the responses from the interaction
     * @private
     * @param {Object} interaction
     * @returns {Array} of points
     */
    var getRawResponse = function getRawResponse(interaction){
        var points = [];
        interaction.paper.forEach(function(element){
            var point = element.data('point');
            if(typeof point === 'object' && point.x && point.y){
                points.push([Math.round(point.x), Math.round(point.y)]);
            }
        });
        return points;
    };

    var addPoint = function addPoint(interaction, point){
        var maxChoices      = interaction.attr('maxChoices');
        var pointChange     = function pointChange(target){
            if(interaction.isTouch && target && target.getBBox){
                graphic.createTouchCircle(interaction.paper, target.getBBox());
            }
            containerHelper.triggerResponseChangeEvent(interaction);
            instructionMgr.validateInstructions(interaction, { target : target });
        };

        if(maxChoices > 0 && getRawResponse(interaction).length >= maxChoices){
            instructionMgr.validateInstructions(interaction);
        } else {
            graphic.createTarget(interaction.paper, {
                point : point,
                create : pointChange,
                remove : pointChange
            });
        }
    };

    /**
     * Make the image clickable and place targets at the given position.
     * @private
     * @param {object} interaction
     */
    var enableSelection = function enableSelection(interaction){
        var $container      = containerHelper.get(interaction);
        var $imageBox       = $container.find('.main-image-box');
        var isResponsive    = $container.hasClass('responsive');
        var image           = interaction.paper.getById('bg-image-' + interaction.serial);

        interaction.paper.isTouch = false;

        //used to see if we are in a touch context
        image.touchstart(function(){
            interaction.paper.isTouch = true;
            image.untouchstart();
        });

        //get the point on click
        image.click(function imageClicked(event){
            addPoint(interaction, graphic.getPoint(event, interaction.paper, $imageBox, isResponsive));
        });
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     */
    var render = function render(interaction){
        var self = this;

        return new Promise(function(resolve){
            var $container = containerHelper.get(interaction);
            var background = interaction.object.attributes;

            $container
                .off('resized.qti-widget.resolve')
                .one('resized.qti-widget.resolve', resolve);

            //create the paper
            interaction.paper = graphic.responsivePaper( 'graphic-paper-' + interaction.serial, interaction.serial, {
                width       : background.width,
                height      : background.height,
                img         : self.resolveUrl(background.data),
                imgId       : 'bg-image-' + interaction.serial,
                container   : $container
            });

            //enable to select the paper to position a target
            enableSelection(interaction);

            //set up the constraints instructions
            instructionMgr.minMaxChoiceInstructions(interaction, {
                min: interaction.attr('minChoices'),
                max: interaction.attr('maxChoices'),
                choiceCount : false,
                getResponse : getRawResponse,
                onError : function(data){
                    if(data){
                        graphic.highlightError(data.target, 'success');
                    }
                }
            });
        });
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
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){

        var responseValues;
        if(response && interaction.paper){

            try{
                responseValues = pciResponse.unserialize(response, interaction);
            } catch(e) {
                return;
            }

            _(responseValues)
                .filter(function(point){
                    return _.isArray(point) && point.length === 2;
                })
                .forEach(function(point){
                    addPoint(interaction, { x : point[0], y : point[1] });
                });
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
    var resetResponse = function resetResponse(interaction){
        interaction.paper.forEach(function(element){
            var point = element.data('point');
            if(typeof point === 'object'){
                graphic.trigger(element, 'click');
            }
        });
    };


    /**
     i* Return the response of the rendered interaction
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
    var getResponse = function(interaction){
        return pciResponse.serialize(getRawResponse(interaction), interaction);
    };

    /**
     * Clean interaction destroy
     * @param {Object} interaction
     */
    var destroy = function destroy(interaction){
        var $container;
        if(interaction.paper){
            $container = containerHelper.get(interaction);

            $(window).off('resize.qti-widget.' + interaction.serial);
            $container.off('resize.qti-widget.' + interaction.serial);

            interaction.paper.clear();
            instructionMgr.removeInstructions(interaction);

            $('.main-image-box', $container).empty().removeAttr('style');
            $('.image-editor', $container).removeAttr('style');
        }

        //remove all references to a cache container
        containerHelper.reset(interaction);
    };

    /**
     * Set the interaction state. It could be done anytime with any state.
     *
     * @param {Object} interaction - the interaction instance
     * @param {Object} state - the interaction state
     */
    var setState  = function setState(interaction, state){
        if(_.isObject(state)){
            if(state.response){
                interaction.resetResponse();
                interaction.setResponse(state.response);
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
        return state;
    };


    /**
     * Expose the common renderer for the interaction
     * @exports qtiCommonRenderer/renderers/interactions/SelectPointInteraction
     */
    return {
        qtiClass:      'selectPointInteraction',
        template:      tpl,
        render:        render,
        getContainer:  containerHelper.get,
        setResponse:   setResponse,
        getResponse:   getResponse,
        resetResponse: resetResponse,
        destroy:       destroy,
        setState:      setState,
        getState:      getState
    };
});

