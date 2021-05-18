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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technologies SA;
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
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HottextInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/placeholder',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'tpl!taoQtiItem/qtiCreator/tpl/interactions/hottextInteraction.score'
], function($, _, __, stateFactory, Map, commonRenderer, answerStateHelper, instructionMgr, formElement, placeholder, PciResponse, scoreTpl){
    'use strict';

    /**
     * Initialize the state.
     */
    function initMapState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var corrects  = _.values(response.getCorrect());

        //really need to destroy before ?
        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);

        //add a specific instruction
        instructionMgr.appendInstruction(interaction, __('Please enter the score for the given hottexts.'));

        //set the current mapping mode, needed by the common renderer
        interaction.responseMappingMode = true;

        //must be done prior to the render to override clicks
        createScoreForm(interaction, widget.$container);

        //use the common Renderer
        commonRenderer.render.call(interaction.getRenderer(), interaction);

        commonRenderer.setResponse(interaction, PciResponse.serialize(corrects, interaction));

        //each response change leads to an update of the scoring form
        widget.$container.on('responseChange.qti-widget', function(e, data){
            var type  = response.attr('cardinality') === 'single' ? 'base' : 'list';
            if(data && data.response &&  data.response[type]){
                response.setCorrect(data.response[type].identifier);
            }
        });

        //change the correct state
        widget.on('metaChange', function(meta){
            if(meta.key === 'defineCorrect'){
                toggleCorrectState(widget.$container, meta.value);
                if(meta.value === false){
                    response.setCorrect([]);
                }
            }
        });
        toggleCorrectState(widget.$container, answerStateHelper.defineCorrect(response));

        widget.on('mappingAttributeChange', function(data){
            if(data.key === 'defaultValue'){
                placeholder.score(widget, data.value);
            }
        });
        placeholder.score(widget);
    }

    /**
     * Exit the map state
     */
    function exitMapState(){
        var widget      = this.widget;
        var interaction = widget.element;
        var $container  = widget.$container;

        $container.off('responseChange.qti-widget');

        $('.score', $container).remove();

        toggleCorrectState($container, true);

        //destroy the common renderer
        commonRenderer.resetResponse(interaction);
        commonRenderer.destroy(interaction);
        instructionMgr.removeInstructions(interaction);

        //always restore the checkbox to readonly before leaving the state
        this.widget.$original.find('.hottext-checkmark > input').prop('disabled', 'disabled');
    }

    function toggleCorrectState($container, enable){
        if(enable){
            $('.hottext-checkmark > input', $container)
                .removeProp('disabled')
                .removeClass('disabled');
        } else {
            $('.hottext-checkmark > input', $container)
                .prop('disabled', true)
                .prop('checked', false)
                .addClass('disabled');
        }
    }

    function createScoreForm(interaction, $container){
        var callbacks = {};
        var response = interaction.getResponseDeclaration();
        var mapEntries = response.getMapEntries();

        //do not trigger the responseChange in the score field
        $('.hottext', $container).on('click', function(e){
            if($(e.target).hasClass('score') || answerStateHelper.defineCorrect(response) === false){
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });

        _.forEach(interaction.getChoices(), function(choice){
            var id = choice.serial + '-score';
            var inputVal = typeof mapEntries[choice.id()] !== 'undefined' ? mapEntries[choice.id()] : '';
            var $hottext = $('[data-serial="' + choice.serial + '"]', $container);

            if($hottext.length){
                $hottext.append(scoreTpl({
                    id : id,
                    value : inputVal
                }));

                callbacks[id] = function(res, value){
                    if(value === ''){
                        res.removeMapEntry(choice.id());
                    } else {
                        res.setMapEntry(choice.id(), value, true);
                    }
                };
            }
        });
        formElement.setChangeCallbacks($container, response, callbacks);
    }


    /**
     * The map answer state for the HottextInteraction
     * @extends taoQtiItem/qtiCreator/widgets/states/Map
     * @exports taoQtiItem/qtiCreator/widgets/interactions/hottextInteraction/states/Map
     */
    return  stateFactory.create(Map, initMapState, exitMapState);
});
