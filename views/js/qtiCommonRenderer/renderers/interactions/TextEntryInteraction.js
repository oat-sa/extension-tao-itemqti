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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
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
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     *
     * @param {object} interaction
     */
    var render = function(interaction){
        var attributes = interaction.getAttributes(),
            $el = interaction.getContainer();

        var expectedLength,
            patternMask = interaction.attr('patternMask'),
            maxWords = parseInt(patternMaskHelper.parsePattern(patternMask,'words'),10),
            maxChars = parseInt(patternMaskHelper.parsePattern(patternMask,'chars'),10);

        //setting up the width of the input field
        if(attributes.expectedLength){
            //adding 2 chars to include reasonable padding size
            expectedLength = parseInt(attributes.expectedLength) + 2;
            $el.css('width', expectedLength + 'ch');
            $el.css('min-width', expectedLength + 'ch');
        }

        //checking if there's a placeholder for the input
        if(attributes.placeholderText){
            $el.attr('placeholder', attributes.placeholderText);
        }

        if(maxWords || maxChars){

            var createTooltip = function createTooltip(theme, message, forceCreation, hidden){
                if(forceCreation || !$el.data('qtip')){
                    $el.qtip({
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
                    $el.qtip('option', 'content.text', message);
                    $el.qtip('option', 'theme', 'info');
                }
                if(!hidden){
                    $el.qtip('show');
                }
            };

            var updateConstraintTooltip = function updateConstraintTooltip(){
                var count = $el.val().length;
                var message;
                if(count >= maxChars){
                    $el.addClass('invalid');
                    createTooltip('warning', __('maximum chars reached'), true);
                }else{
                    if(count){
                        message = __('%d of %d chars maximum', count, maxChars);
                    }else{
                        message = __('%d chars allowed', maxChars);
                    }
                    if($el.hasClass('invalid')){
                        console.log('created');
                        $el.removeClass('invalid');
                        createTooltip('info', message, true);
                    }else{
                        console.log('updated');
                        createTooltip('info', message);
                    }
                }
            };

            $el.attr('maxlength', maxChars);

            $el.on('keyup.commonRenderer keydown.commonRenderer', function(){
                updateConstraintTooltip();
            }).on('focus.commonRenderer', function(){
                updateConstraintTooltip();
            }).on('blur.commonRenderer', function(){
                $el.qtip('hide');
            });

        }else if(attributes.patternMask){

            //set up the tooltip plugin for the input
            $el.qtip({
                theme : 'error',
                show : {
                    event : 'custom'
                },
                hide : {
                    event : 'custom'
                },
                content: {
                    text: __('This is not a valid answer')
                }
            });

            $el.on('keyup.commonRenderer', function(){

                var regex = new RegExp(attributes.patternMask);
                if(regex.test($el.val())){
                    $el.removeClass('invalid').qtip('hide');
                } else {
                    $el.addClass('invalid').qtip('show');//adding the class invalid prevent the invalid response to be submitted
                }

            }).on('keydown.commonRenderer', function(){
                //hide the error message while the test taker is inputing an error (let's be indulgent, she is trying to fix her error)
                $el.qtip('hide');
            });
        }

        $el.on('keyup.commonRenderer', function(){
            //TODO validate before submit response change?
            containerHelper.triggerResponseChangeEvent(interaction);
        });
    };

    var resetResponse = function(interaction){
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
    var setResponse = function(interaction, response){

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
    var getResponse = function(interaction){
        var ret = {'base' : {}},
        value,
            $el = interaction.getContainer(),
            attributes = interaction.getAttributes(),
            baseType = interaction.getResponseDeclaration().attr('baseType'),
            numericBase = attributes.base || 10;
        
        if($el.hasClass('invalid') || (attributes.placeholderText && $el.val() === attributes.placeholderText)){
            //invalid response or response equals to the placeholder text are considered empty
            value = '';
        }else{
            if (baseType === 'integer') {
                value = locale.parseInt($el.val(), numericBase);
            } else if (baseType === 'float') {
                value = locale.parseFloat($el.val());
            } else if (baseType === 'string') {
                value = $el.val();
            }
        }

        ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;

        return ret;
    };

    var destroy = function(interaction){
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
