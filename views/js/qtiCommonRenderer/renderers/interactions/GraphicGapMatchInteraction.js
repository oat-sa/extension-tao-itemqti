/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/graphicGapMatchInteraction',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/gapImg',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper'
], function($, _, __, tpl, gapImgTpl, graphic,  pciResponse, Helper){

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     * 
     * @param {object} interaction
     */
    var render = function render(interaction){
        var $container = Helper.getContainer(interaction);
        var $gapList = $('ul', $container);
        var background = interaction.object.attributes;

        //create the paper
        interaction.paper = graphic.responsivePaper( 'graphic-paper-' + interaction.serial, {
            width  : background.width, 
            height : background.height,
            img : "/taoQtiItem/test/samples/test_base_www/" + background.data,      //TODO path 
            container : $container,
            resize : function(newWidth){
                $gapList.width( ((newWidth < background.width ?  newWidth : background.width) ) + 'px');
            } 
        });
        
        //call render choice for each interaction's choices
        _.forEach(interaction.getChoices(), _.partial(_renderChoice, interaction));

        //create the list of gap images
        _renderGapList(interaction, $gapList);

        //set up the constraints instructions
        _setInstructions(interaction);
    };


    /**
     * Render a choice inside the paper. 
     * Please note that the choice renderer isn't implemented separately because it relies on the Raphael paper instead of the DOM.
     *
     * @private
     * @param {Paper} paper - the raphael paper to add the choices to
     * @param {Object} interaction
     * @param {Object} choice - the hotspot choice to add to the interaction
     */
    var _renderChoice  =  function _renderChoice(interaction, choice){
        var shape = choice.attributes.shape;
        var coords = choice.attributes.coords;
       
        //create the shape 
        var rElement = graphic.createElement(interaction.paper, shape, coords, {
            id : choice.serial,
            title : __('Select an image first'),
            hover : false
        })
        .data('max', choice.attributes.matchMax ) 
        .click(function onClickShape(){
        
            // check if can make the shape selectable on click
            if(_isMatchable(this) && this.selectable === true){ 
                _selectShape(interaction, this);
                Helper.validateInstructions(interaction, { choice : choice });
            }
        });
    };

    /**
     * Render the list of gap choices
     * @private
     * @param {Object} interaction
     * @param {jQueryElement} $orderList - the list than contains the orderers
     */
    var _renderGapList = function _renderGapList(interaction, $gapList){

        //append the template by gap image        
        _.forEach(interaction.getGapImgs(), function(gapImg){
            $gapList.append(gapImgTpl(gapImg));
        });

        //activate the gap filling 
        $gapList.children('li').click(function onClickGapImg (e){
            e.preventDefault();
            var $elt = $(this);
            if(!$elt.hasClass('disabled')){
            
                //toggle tha active state of the gap images
                if($elt.hasClass('active')){
                    $elt.removeClass('active');
                    _shapesUnSelectable(interaction);
                } else {                
                    $gapList.children('li').removeClass('active'); 
                    $elt.addClass('active');
                    _shapesSelectable(interaction);
                }
            }
        });
    };

    /**
     * Select a shape (a gap image must be active)
     * @private
     * @param {Object} interaction
     * @param {Raphael.Element} element - the selected shape
     */
    var _selectShape = function _selectShape(interaction, element){
        var $img, gapFiller, id, 
            bbox, startx,
            matching, currentCount;
            
        //lookup for the active element
        var $container = Helper.getContainer(interaction);
        var $gapList = $('ul', $container);
        var $active = $gapList.find('.active:first');
        if($active.length){
            
            //the macthing elements are linked to the shape
            id = $active.data('identifier');
            matching = element.data('matching') || [];
            matching.push(id); 
            element.data('matching', matching); 
            currentCount = matching.length;

            //the image to clone
            $img = $active.find('img');    
            
            //extract some coords for positioning
            bbox = element.getBBox();
            startx = parseInt($active.width(), 10) * $gapList.children().index($active);
            
            //create an image into the paper and move it to the selected shape
            gapFiller = graphic.createBorderedImage(interaction.paper, {
                    url     :  $img.attr('src'),
                    left    : startx,
                    top     : interaction.paper.height,
                    width   : $img.width(),
                    height  : $img.height()
                })
                .data('identifier', id)
                .toFront()
                .move(bbox.x + (2 * (currentCount)), bbox.y + (2 * (currentCount)))
                .click(function(){

                    if($gapList.find('.active').length > 0){

                        //simulate a click on the shape
                        graphic.trigger(element, 'click');

                    } else {
                        //update the element matching array
                        element.data('matching', _.remove(element.data('matching') || [], this.data('identifier')));

                        //and remove the filler
                        gapFiller.remove();
                    }
                });

            //then reset the state of the shapes and the gap images
            _shapesUnSelectable(interaction);
            $gapList.children().removeClass('active');
        }
    };

    /**
     * Makes the shapes selectable (at least thos who can still accept matches)
     * @private
     * @param {Object} interaction
     */
    var _shapesSelectable = function _shapesSelectable(interaction){
        _.forEach(interaction.getChoices(), function(choice){
            var element = interaction.paper.getById(choice.serial);
            if(_isMatchable(element)){
                element.selectable = true;
                graphic.updateElementState(element, 'selectable', __('Select the area to add the image'));
            }
        });
    };

    /**
     * Makes all the shapes UNselectable
     * @private
     * @param {Object} interaction
     */
    var _shapesUnSelectable = function _shapesUnSelectable(interaction){
        _.forEach(interaction.getChoices(), function(choice){
            var element = interaction.paper.getById(choice.serial);
            if(element){
                element.selectable = false;
                graphic.updateElementState(element, 'basic');
            }
        });
    };

    /**
     * Check if a shape can accept matches
     * @private
     * @param {Raphael.Element} element - the shape
     * @returns {Boolean} true if the element is matchable
     */
    var _isMatchable = function(element){
        var matchable = false;
        var matching, matchMax;
        if(element){
            matchMax = element.data('max') || 1;
            matching = element.data('matching') || [];
            matchable = (matchMax === 0 || matchMax > matching.length);
        }
        return matchable;
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
                        graphic.updateElementState(rElement, 'active', __('Click again to remove')); 
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
        qtiClass : 'graphicGapMatchInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResonse : resetResponse
    };
});
