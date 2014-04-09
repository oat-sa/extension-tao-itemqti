/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'raphael',
    'scale.raphael',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/hotspotInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper'
], function($, _, __, raphael, scaleRaphael, tpl, graphic,  pciResponse, Helper){

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     * 
     * @param {object} interaction
     */
    var render = function render(interaction){
        var $container = Helper.getContainer(interaction);
        var background = interaction.object.attributes;
        var baseUrl = this.getOption('baseUrl') || '';
        
        interaction.paper = graphic.responsivePaper( 'graphic-paper-' + interaction.serial, {
            width  : background.width, 
            height : background.height,
            img :  baseUrl + background.data,
            container : $container
        });

        //call render choice for each interaction's choices
        _.forEach(interaction.getChoices(), _.partial(_renderChoice, interaction));

        //set up the constraints instructions
        _setInstructions(interaction);
    };


    /**
     * Render a choice inside the paper. 
     * Please note that the choice renderer isn't implemented separately because it relies on the Raphael paper instead of the DOM.
     * @param {Paper} paper - the raphael paper to add the choices to
     * @param {Object} interaction
     * @param {Object} choice - the hotspot choice to add to the interaction
     */
    var _renderChoice  =  function _renderChoice(interaction, choice){
        var shape = choice.attributes.shape;
        var coords = choice.attributes.coords;

        var rElement = graphic.createElement(interaction.paper, shape, coords, {
            id : choice.serial,
            title : __('Select this area')
        })
        .click(function(){
            if(this.active){
                graphic.updateElementState(this, 'basic', __('Select this area'));
                this.active = false;
            } else {
                graphic.updateElementState(this, 'active', __('Click again to remove'));
                this.active = true;
            }
            Helper.validateInstructions(interaction, { choice : choice, target : this });
        });
    };

    /** 
     * Set the instructions regarding the constrains (here min and maxChoices.
     * @private
     * @param {Object} interaction
     */
    var _setInstructions = function _setInstructions(interaction){

        var min = interaction.attr('minChoices'),
            max = interaction.attr('maxChoices'),
            choiceCount = _.size(interaction.getChoices()),
            minInstructionSet = false,
            msg;
    

        //if maxChoice = 0, inifinite choice possible
        if(max > 0 && max < choiceCount){
            if(max === min){
                minInstructionSet = true;
                msg = (max <= 1) ? __('You must select exactly %d choice', max) : __('You must select exactly %d choices', max);

                Helper.appendInstruction(interaction, msg, function(data){
                                        
                    if(_getRawResponse(interaction).length >= max){
                        this.setLevel('success');
                        if(this.checkState('fulfilled')){
                            this.update({
                                level : 'warning',
                                message : __('Maximum choices reached'),
                                timeout : 2000,
                                start : function(){
                                    if(data.target.active){
                                        graphic.highlightError(data.target);
                                    }
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
            } else if(max > min){
                msg = (max <= 1) ? __('You can select maximum %d choice', max) : __('You can select maximum %d choices', max);
                Helper.appendInstruction(interaction, msg, function(data){

                    if(_getRawResponse(interaction).length >= max){
                        this.setLevel('success');
                        this.setMessage(__('Maximum choices reached'));
                        if(this.checkState('fulfilled')){
                            this.update({
                                level : 'warning',
                                timeout : 2000,
                                start : function(){
                                    if(data.target.active){
                                        graphic.highlightError(data.target);
                                    }
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
            msg = (min <= 1) ? __('You must at least %d choice', min) : __('You must select at least %d choices', max);
            Helper.appendInstruction(interaction, msg, function(){
                if(_getRawResponse(interaction).length >= min){
                    this.setLevel('success');
                }else{
                    this.reset();
                }
            });
        }
    };
  
    /**
     * Get the response from the interaction
     * @private
     * @param {Object} interaction
     * @returns {Array} the response in raw format
     */ 
    var _getRawResponse = function _getRawResponse(interaction){
        
       return _(interaction.getChoices())
        .map(function(choice){
            var rElement = interaction.paper.getById(choice.serial);
            return (rElement && rElement.active === true) ? choice.attributes.identifier : false;
       })
        .filter(_.isString)
        .value();
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
     * Special value: the empty object value {} resets the interaction responses
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){
        
        var responseValues;
        if(response && interaction.paper){

            try{
                responseValues = pciResponse.unserialize(response, interaction);
            } catch(e){}
            
            if(_.isArray(responseValues)){
                _.forEach(interaction.getChoices(), function(choice){
                    var rElement;
                    if(_.contains(responseValues, choice.attributes.identifier)){
                        rElement = interaction.paper.getById(choice.serial);
                        if(rElement){
                            rElement.active = true;
                            graphic.updateElementState(rElement, 'active', __('Click again to remove')); 
                        }
                    }
                });
            }
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
        _.forEach(interaction.getChoices(), function(choice){
            var element = interaction.paper.getById(choice.serial);
            if(element){
                element.active = false;
                graphic.updateElementState(element, 'basic'); 
            }
        });
    };


    /**
     * Return the response of the rendered interaction
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
        var raw = _getRawResponse(interaction);
        var response =  pciResponse.serialize(_getRawResponse(interaction), interaction);
        return response;
    };

    /**
     * Expose the common renderer for the hotspot interaction
     * @exports qtiCommonRenderer/renderers/interactions/HotspotInteraction
     */
    return {
        qtiClass : 'hotspotInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse
    };
});
