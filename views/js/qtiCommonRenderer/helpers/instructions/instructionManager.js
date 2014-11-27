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
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/Instruction',
], function(_, $, __, Instruction){
    'use strict';

    //stores the instructions
    var _instructions = {};

    /**
     * The instruction manager helps you in managing instructions and 
     * constraints on a QTI Element, usually an interaction or a choice.
     *
     * @exports qtiCommonRenderer/helpers/Instructions/instructionManager
     */
    var instructionManager = {

        /**
         * Validate the instructions of an element
         * @param {QtiElement} element - a QTI element like an interaction or a choice
         * @param {Object} [data] - any data to give to the instructions
         */
        validateInstructions : function(element, data){
            var serial = element.getSerial();
            if(_instructions[serial]){
                _.each(_instructions[serial], function(instruction){
                    instruction.validate(data || {});
                });
            }
        },

        /**
         * Add a new instructions to an element
         * @param {QtiElement} element - a QTI element like an interaction or a choice
         * @param {jQueryElement} $container - where the instruction is created 
         * @param {String} message - the message to give to display to the user when the instruction is validated
         * @param {Function} validateCallback - how to validate the instruction
         * @returns {Instruction} the created instruction
         */
        appendInstruction : function(element, $container, message, validateCallback){
            var serial = element.getSerial(),
                instruction = new Instruction(element, message, validateCallback);

            if(!_instructions[serial]){
                _instructions[serial] = {};
            }
            _instructions[serial][instruction.getId()] = instruction;

            instruction.create($('.instruction-container', $container));

            return instruction;
        },

        /**
         * Remove instructions from an element
         * @param {QtiElement} element - a QTI element like an interaction or a choice
         */
        removeInstructions : function(element){
            _instructions[element.getSerial()] = {};
            this.getContainer(element).find('.instruction-container').empty();
        },

        /**
         * Reset the instructions states for an element (but keeps configuration)
         * @param {Object} element - the qti object, ie. interaction, choice, etc.
         */
        resetInstructions : function(element){
            var serial = element.getSerial();
            if(_instructions[serial]){
                _.each(_instructions[serial], function(instruction){
                    instruction.reset();
                });
            }
        },

        /** 
         * Default instuction set with a min/max constraints.
         * @param {Object} interaction
         * @param {jQueryElement} $container 
         * @param {Object} options
         * @param {Number} [options.min = 0] - 
         * @param {Number} [options.max = 0] - 
         * @param {Function} options.getResponse - a ref to a function that get the raw response (array) from the interaction in parameter
         * @param {Function} [options.onError] - called by once an error occurs with validateInstruction data in parameters
         */
        minMaxChoiceInstructions : function(interaction, $container, options){

            var self = this,
                min = options.min || 0,
                max = options.max || 0,
                getResponse = options.getResponse,
                onError = options.onError || _.noop(),
                choiceCount = options.choiceCount === false ? false : _.size(interaction.getChoices()),
                minInstructionSet = false,
                msg;

            if(!_.isFunction(getResponse)){
                throw "invalid parameter getResponse";
            }

            //if maxChoice = 0, inifinite choice possible
            if(max > 0 && (choiceCount === false || max < choiceCount)){
                if(max === min){
                    minInstructionSet = true;
                    msg = (max <= 1) ? __('You must select exactly %d choice', max) : __('You must select exactly %d choices', max);

                    self.appendInstruction(interaction, $container, msg, function(data){

                        if(getResponse(interaction).length >= max){
                            this.setLevel('success');
                            if(this.checkState('fulfilled')){
                                this.update({
                                    level : 'warning',
                                    message : __('Maximum choices reached'),
                                    timeout : 2000,
                                    start : function(){
                                        onError(data);
                                    },
                                    stop : function(){
                                        this.update({level : 'success', message : msg});
                                    }
                                });
                            }
                            this.setState('fulfilled');
                        }else{
                            this.reset();
                        }
                    });
                }else if(max > min){
                    msg = (max <= 1) ? __('You can select maximum %d choice', max) : __('You can select maximum %d choices', max);
                    self.appendInstruction(interaction, $container, msg, function(data){

                        if(getResponse(interaction).length >= max){

                            this.setLevel('success');
                            this.setMessage(__('Maximum choices reached'));
                            if(this.checkState('fulfilled')){
                                this.update({
                                    level : 'warning',
                                    timeout : 2000,
                                    start : function(){
                                        onError(data);
                                    },
                                    stop : function(){
                                        this.setLevel('info');
                                    }
                                });
                            }

                            this.setState('fulfilled');
                        }else{
                            this.reset();
                        }
                    });
                }
            }

            if(!minInstructionSet && min > 0 && (choiceCount === false || min < choiceCount)){
                msg = (min <= 1) ? __('You must at least %d choice', min) : __('You must select at least %d choices', max);
                self.appendInstruction(interaction, $container, msg, function(){
                    if(getResponse(interaction).length >= min){
                        this.setLevel('success');
                    }else{
                        this.reset();
                    }
                });
            }
        }
    };
    return instructionManager;
});

