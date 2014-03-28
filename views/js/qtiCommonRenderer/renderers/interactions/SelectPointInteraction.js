/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'raphael',
    'scale.raphael',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/selectPointInteraction',
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
        var bgImage;

        //TODO change image path
        if(raphael.type === 'SVG'){
            interaction.paper = scaleRaphael('graphic-paper-' + interaction.serial, background.width, background.height);
            bgImage = interaction.paper.image("/taoQtiItem/test/samples/test_base_www/" + background.data, 0, 0, background.width, background.height);
       
            //scale on creation
            resizePaper();
            
            //execute the resize every 100ms when resizing
            $(window).resize(_.throttle(resizePaper, 100));
        } else {

            //for VML rendering, we do not scale...
            interaction.paper = raphael('graphic-paper-' + interaction.serial, background.width, background.height);
            bgImage = interaction.paper.image("/taoQtiItem/test/samples/test_base_www/" + background.data, 0, 0, background.width, background.height);
        }
        bgImage.id = 'bg-image-' + interaction.serial;

        _enableSelection(interaction);

        //set up the constraints instructions
        _setInstructions(interaction);

        /**
         * scale the raphael paper
         * @private
         */
        function resizePaper(){
            interaction.paper.changeSize($container.width(), background.height, false, true);
        }
    };

    /**
     * WORK IN PROGRESS, set response
     */
    var _enableSelection = function _enableSelection(interaction){
        var $container = Helper.getContainer(interaction);
        var image = interaction.paper.getById('bg-image-' + interaction.serial);
        image.click(function(event){
            var rwidth, wfactor, hfactor;
            var point = {
                y : event.layerY,
                x : event.layerX
            };
            if(interaction.paper.w && interaction.paper.w !== interaction.paper.width){
                if(interaction.paper.width > interaction.paper.w){
                    rwidth = (interaction.paper.width - interaction.paper.w) / 2;
                    point.x = event.layerX - rwidth; 
                } else {
                    wfactor = interaction.paper.w / interaction.paper.width;
                    point.x = event.layerX * wfactor; 
                    point.y = event.layerY * wfactor;
                }
            }
            //if(interaction.paper.h && interaction.paper.h !== interaction.paper.height){
                //if(interaction.paper.height > interaction.paper.h){
                    //rheight = (interaction.paper.height - interaction.paper.h) / 2;
                    //point.y = event.layerY - rheight; 
                //} else {
                    //rheight = interaction.paper.h / interaction.paper.height;
                    //point.y = event.layerY * rheight; 
                //}
            //}

            //TODO factorize
            interaction.paper
                    .path(graphic.getTargetPath())
                    .translate(point.x - 9, point.y - 9)
                    .attr({ 
                        'fill' : '#3EA76F',
                        'width' : 1, 
                        'stroke-width' : 0
                    });
            //console.log('layer', event.layerX + ' : ' + event.layerY);
            //console.log('paper', interaction.paper);
            //console.log('point', JSON.stringify(point));
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
                                    highlightError(data.choice);
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
                                    highlightError(data.choice);
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

        function highlightError(choice){
            var rElement;
            if(choice && choice.serial){
                rElement = interaction.paper.getById(choice.serial);
                if(rElement.active){
                    graphic.updateElementState(rElement, 'error');
                    _.delay(function(){
                        graphic.updateElementState(rElement, 'active');
                    }, 600);
                }
            }
        }
    };
   
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
                        rElement.active = true;
                        graphic.updateElementState(rElement, 'active'); 
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
            var rElement = interaction.paper.getById(choice.serial);
            delete rElement.active;
            graphic.updateElementState(rElement, 'default'); 
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
        qtiClass : 'selectPointInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResonse : resetResponse
    };
});
