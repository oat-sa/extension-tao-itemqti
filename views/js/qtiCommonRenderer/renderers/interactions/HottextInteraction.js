define([
    'lodash',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/hottextInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'i18n'
], function(_, $, tpl, Helper, pciResponse, __){
    'use strict';


    /**
     * 'pseudo-label' is technically a div that behaves like a label.
     * This allows the usage of block elements inside the fake label
     */
    var pseudoLabel = function(interaction){

        var setChoice = function($choice){
            var $inupt = $choice.find('input');
            if($inupt.prop('checked')){
                $inupt.prop('checked', false);
            }else{
                $inupt.prop('checked', true);
            }
            Helper.validateInstructions(interaction, {choice : $choice});
        };

        Helper.getContainer(interaction).find('.hottext').on('click', function(e){
            setChoice($(this));
            e.preventDefault();
        });

        Helper.getContainer(interaction).find('input').on('click', function(e){
            Helper.validateInstructions(interaction, {choice : $(this).parents('.hottext')});
            e.stopPopagation();
        });
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10278
     * 
     * @param {object} interaction
     */
    var render = function(interaction){
        pseudoLabel(interaction);
        _setInstructions(interaction);
    };

    var _setInstructions = function(interaction){

        var min = interaction.attr('minChoices'),
            max = interaction.attr('maxChoices'),
            body = interaction.getBody(),
            choiceCount = 0,
            minInstructionSet = false;

        for(var el in body.getElements()){
            choiceCount++;
        }

        //if maxChoice = 1, use the radio gorup behaviour
        //if maxChoice = 0, inifinite choice possible
        if(max > 1 && max < choiceCount){

            var highlightInvalidInput = function($choice){
                var $input = $choice.find('input'),
                    $span = $choice.css('color', '#BA122B'),
                    $icon = $choice.find('>label>span').css('color', '#BA122B').addClass('cross error');

                setTimeout(function(){
                    $input.prop('checked', false);
                    $span.removeAttr('style');
                    $icon.removeAttr('style').removeClass('cross');
                }, 150);
            };

            if(max === min){
                minInstructionSet = true;
                var msg = __('You must select exactly') + ' ' + max + ' ' + __('choices');
                Helper.appendInstruction(interaction, msg, function(data){
                    if(_getRawResponse(interaction).length >= max){
                        this.setLevel('success');
                        if(this.checkState('fulfilled')){
                            this.update({
                                level : 'warning',
                                message : __('Maximum choices reached'),
                                timeout : 2000,
                                start : function(){
                                    highlightInvalidInput(data.choice);
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
                Helper.appendInstruction(interaction, __('You can select maximum') + ' ' + max + ' ' + __('choices'), function(data){

                    if(_getRawResponse(interaction).length >= max){
                        this.setMessage(__('Maximum choices reached'));
                        if(this.checkState('fulfilled')){
                            this.update({
                                level : 'warning',
                                timeout : 2000,
                                start : function(){
                                    highlightInvalidInput(data.choice);
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

        if(!minInstructionSet && min > 0 && min < choiceCount){
            Helper.appendInstruction(interaction, __('You must select at least') + ' ' + min + ' ' + __('choices'), function(){
                if(_getRawResponse(interaction).length >= min){
                    this.setLevel('success');
                }else{
                    this.reset();
                }
            });
        }
    };

    var _resetResponse = function(interaction){
        Helper.getContainer(interaction).find('input').prop('checked', false);
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

        var $container = Helper.getContainer(interaction);

        if(pciResponse.isEmpty(response)){
            _resetResponse(interaction);
        }else{
            _.each(pciResponse.unserialize(response, interaction), function(identifier){
                $container.find('input[value=' + identifier + ']').prop('checked', true);
            });
        }

        Helper.validateInstructions(interaction);
    };

    var _getRawResponse = function(interaction){
        var values = [];
        Helper.getContainer(interaction).find('input:checked').each(function(){
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
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     * 
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){
        return pciResponse.serialize(_getRawResponse(interaction), interaction);
    };

    return {
        qtiClass : 'hottextInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse
    };
});
