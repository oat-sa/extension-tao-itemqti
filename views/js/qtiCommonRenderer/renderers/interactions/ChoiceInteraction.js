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
    'lodash',
    'jquery',
    'i18n',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/choiceInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper'
], function(_, $, __, tpl, instructionMgr,  pciResponse, Helper){
    'use strict';

    /**
     * 'pseudo-label' is technically a div that behaves like a label.
     * This allows the usage of block elements inside the fake label
     *
     * @private 
     * @param {Object} interaction - the interaction instance
     */
    var _pseudoLabel = function(interaction){

        var $container = Helper.getContainer(interaction);

        $container.off('.commonRenderer');

        $container.on('click.commonRenderer', '.qti-choice', function(e){

            e.preventDefault();
            e.stopPropagation();//required toherwise any tao scoped ,i/form initialization might prevent it from working

            var $box = $(this);
            var $radios = $box.find('input:radio').not('[disabled]').not('.disabled');
            var $checkboxes = $box.find('input:checkbox').not('[disabled]').not('.disabled');

            if($radios.length){
                $radios.not(':checked').prop('checked', true);
                $radios.trigger('change');
            }

            if($checkboxes.length){
                $checkboxes.prop('checked', !$checkboxes.prop('checked'));
                $checkboxes.trigger('change');
            }

            instructionMgr.validateInstructions(interaction, {choice : $box});
            Helper.triggerResponseChangeEvent(interaction);

        });

    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10278
     * 
     * @param {Object} interaction - the interaction instance
     */
    var render = function(interaction){
        _pseudoLabel(interaction);

        //set up the constraints instructions
        instructionMgr.minMaxChoiceInstructions(interaction, Helper.getContainer(interaction), {
            min: interaction.attr('minChoices'),
            max: interaction.attr('maxChoices'),
            getResponse : _getRawResponse,
            onError : function(data){
                var $choice, $input, $li, $icon;
                if(data && data.choice){
                    $choice = data.choice;
                    $input = $choice.find('.real-label > input');
                    $li = $choice.css('color', '#BA122B');
                    $icon = $choice.find('.real-label > span').css('color', '#BA122B').addClass('cross error');

                    _.delay(function(){
                        $input.prop('checked', false);
                        $li.removeAttr('style');
                        $icon.removeAttr('style').removeClass('cross');
                        Helper.triggerResponseChangeEvent(interaction);
                    }, 150);
                }
            }
        }); 
    };

    /**
     * Reset the responses previously set
     *  
     * @param {Object} interaction - the interaction instance
     */
    var resetResponse = function(interaction){
        Helper.getContainer(interaction).find('.real-label > input').prop('checked', false);
    };

    /**
     * Set a new response to the rendered interaction. 
     * Please note that it does not reset previous responses.
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10278
     * 
     * @param {Object} interaction - the interaction instance
     * @param {0bject} response - the PCI formated response
     */
    var setResponse = function(interaction, response){

        var $container = Helper.getContainer(interaction);

        try{
            _.each(pciResponse.unserialize(response, interaction), function(identifier){
                $container.find('.real-label > input[value=' + identifier + ']').prop('checked', true);
            });
            instructionMgr.validateInstructions(interaction);
        }catch(e){
            throw new Error('wrong response format in argument : ' + e);
        }
    };

    /**
     * Get the responses from the DOM.
     * @private
     * @param {Object} interaction - the interaction instance
     * @returns {Array} the list of choices identifiers
     */
    var _getRawResponse = function(interaction){
        var values = [];
        Helper.getContainer(interaction).find('.real-label > input[name=response-' + interaction.getSerial() + ']:checked').each(function(){
            values.push($(this).val());
        });
        return values;
    };

    /**
     * Return the response of the rendered interaction
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10278
     * 
     * @param {Object} interaction - the interaction instance
     * @returns {Object} the response formated in PCI
     */
    var getResponse = function(interaction){
        return pciResponse.serialize(_getRawResponse(interaction), interaction);
    };

    /**
     * Set additionnal data to the template
     * 
     */
    var getCustomData = function(interaction, data){
        return _.merge(data || {}, {
            horizontal : (interaction.attr('orientation') === 'horizontal')
        });
    };

     /**
     * Expose the common renderer for the choice interaction
     * @exports qtiCommonRenderer/renderers/interactions/ChoiceInteraction
     */
    return {
        qtiClass : 'choiceInteraction',
        template : tpl,
        getData : getCustomData,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse,
        destroy : Helper.destroy,
        setState : Helper.setState,
        getState : Helper.getState
    };
});
