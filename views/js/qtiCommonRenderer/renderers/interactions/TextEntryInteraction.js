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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/textEntryInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/patternMask',
    'util/locale',
    'polyfill/placeholders',
    'ui/tooltip'
], function($, _, __, tpl, containerHelper, instructionMgr, pciResponse, patternMaskHelper, locale){
    'use strict';

    /**
     * Prepare the feedback tooltip for the text input
     * @param {jQuery} $input
     * @param {String} theme
     * @param {String} message
     * @param {Boolean} [forceCreation=false]
     * @param {Boolean} [hidden=false]
     */
    var createTooltip = function createTooltip($input, theme, message, forceCreation, hidden){
        if(forceCreation || !$input.data('qtip')){
            $input.qtip({
                theme : theme,
                content : {
                    text : message
                },
                show : {
                    event : 'custom'
                },
                hide : {
                    event : 'custom'
                }
            });
        }else{
            $input.qtip('option', 'content.text', message);
            $input.qtip('option', 'theme', 'info');
        }
        if(!hidden){
            $input.qtip('show');
        }
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     *
     * @param {object} interaction
     */
    var render = function render(interaction){
        var attributes = interaction.getAttributes(),
            $input = interaction.getContainer(),
            expectedLength,
            updateConstraintTooltip,
            patternMask = interaction.attr('patternMask'),
            maxChars = parseInt(patternMaskHelper.parsePattern(patternMask,'chars'),10);

        //setting up the width of the input field
        if(attributes.expectedLength){
            //adding 2 chars to include reasonable padding size
            expectedLength = parseInt(attributes.expectedLength) + 2;
            $input.css('width', expectedLength + 'ch');
            $input.css('min-width', expectedLength + 'ch');
        }

        //checking if there's a placeholder for the input
        if(attributes.placeholderText){
            $input.attr('placeholder', attributes.placeholderText);
        }

        if(maxChars){

            updateConstraintTooltip = function updateConstraintTooltip(){
                var count = $input.val().length;
                var message;
                if(count >= maxChars){
                    $input.addClass('maxed');
                    createTooltip($input, 'warning', __('%d/%d', count, maxChars), true);
                }else{
                    if(count){
                        message = __('%d/%d', count, maxChars);
                    }else{
                        message = __('%d characters allowed', maxChars);
                    }
                    if($input.hasClass('maxed')){
                        $input.removeClass('maxed');
                        createTooltip($input, 'info', message, true);
                    }else{
                        createTooltip($input, 'info', message);
                    }
                }
            };

            $input
                .attr('maxlength', maxChars)
                .on('focus.commonRenderer keydown.commonRenderer', updateConstraintTooltip)
                .on('keyup.commonRenderer', function(){
                    updateConstraintTooltip();
                    containerHelper.triggerResponseChangeEvent(interaction);
                })
                .on('blur.commonRenderer', function(){
                    $input.qtip('hide');
                });

        }else if(attributes.patternMask){

            //set up the tooltip plugin for the input
            createTooltip($input, 'error', __('This is not a valid answer'), true, true);

            $input.on('keyup.commonRenderer', _.debounce(function(){
                var regex = new RegExp(attributes.patternMask);
                if(regex.test($input.val())){
                    $input.removeClass('invalid').qtip('hide');
                } else {
                    $input.addClass('invalid').qtip('show');//adding the class invalid prevent the invalid response to be submitted
                }
                containerHelper.triggerResponseChangeEvent(interaction);
            }, 600)).on('keydown.commonRenderer', function(){
                //hide the error message while the test taker is inputing an error (let's be indulgent, she is trying to fix her error)
                $input.qtip('hide');
            });

        }else{
            $input.on('keyup.commonRenderer', function(){
                containerHelper.triggerResponseChangeEvent(interaction);
            });
        }
    };

    var resetResponse = function resetResponse(interaction){
        interaction.getContainer().val('');
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     *
     * Special value: the empty object value {} resets the interaction responses
     *
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function setResponse(interaction, response){

        var responseValue;

        try{
            responseValue = pciResponse.unserialize(response, interaction);
        }catch(e){
        }

        if(responseValue && responseValue.length){
            interaction.getContainer().val(responseValue[0]);
        }
    };

    /**
     * Return the response of the rendered interaction
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     *
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function getResponse(interaction){
        var ret = {'base' : {}},
        value,
            $input = interaction.getContainer(),
            attributes = interaction.getAttributes(),
            baseType = interaction.getResponseDeclaration().attr('baseType'),
            numericBase = attributes.base || 10;
        
        if($input.hasClass('invalid') || (attributes.placeholderText && $input.val() === attributes.placeholderText)){
            //invalid response or response equals to the placeholder text are considered empty
            value = '';
        }else{
            if (baseType === 'integer') {
                value = locale.parseInt($input.val(), numericBase);
            } else if (baseType === 'float') {
                value = locale.parseFloat($input.val());
            } else if (baseType === 'string') {
                value = $input.val();
            }
        }

        ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;

        return ret;
    };

    var destroy = function destroy(interaction){
        //remove event
        $(document).off('.commonRenderer');
        containerHelper.get(interaction).off('.commonRenderer');

        //remove instructions
        instructionMgr.removeInstructions(interaction);

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

    return {
        qtiClass : 'textEntryInteraction',
        template : tpl,
        render : render,
        getContainer : containerHelper.get,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse,
        destroy : destroy,
        setState : setState,
        getState : getState
    };
});
