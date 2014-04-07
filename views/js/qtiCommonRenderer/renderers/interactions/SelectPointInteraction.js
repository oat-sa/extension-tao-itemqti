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
], function($, _, __, raphael, scaleRaphael, tpl, graphic, pciResponse, Helper){

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
     
        //create the paper
        interaction.paper = graphic.responsivePaper( 'graphic-paper-' + interaction.serial, {
            width       : background.width, 
            height      : background.height,
            img         : this.getOption('baseUrl') + background.data,
            imgId       : 'bg-image-' + interaction.serial,
            container   : $container
        });

        //enable to select the paper to position a target
        _enableSelection(interaction);

        //set up the constraints instructions
        _setInstructions(interaction);

        /**
         * scale the raphael paper
         * @private
         */
        function resizePaper(){
            interaction.paper.changeSize($container.width(), background.height, false, false);
        }
    };

    /**
     * Make the image clickable and place targets at the given position.
     * @private
     * @param {object} interaction
     */
    var _enableSelection = function _enableSelection(interaction){
        var $container = Helper.getContainer(interaction);
        var image = interaction.paper.getById('bg-image-' + interaction.serial);
        image.click(function(event){
            var rwidth, rheight, wfactor;

            //var position = $container.find('.main-image-box').offset();
            //console.log(position);
            //console.log(event.pageX, position.left);
            //var point = {
                //y : event.layerY,
                //x : event.layerX
            //};
        
            var point = graphic.clickPoint($container.find('.main-image-box'), event);

            //recalculate point coords in case of scaled image.
            if(interaction.paper.w && interaction.paper.w !== interaction.paper.width){
                if(interaction.paper.width > interaction.paper.w){
                    rwidth = (interaction.paper.width - interaction.paper.w) / 2;
                    point.x = Math.round(event.layerX - rwidth);
                }else{
                    wfactor = interaction.paper.w / interaction.paper.width;
                    point.x = Math.round(event.layerX * wfactor);

                    rheight = (interaction.paper.height - (interaction.paper.height * (2 - wfactor))) / 2;
                    point.y = Math.round((event.layerY * wfactor) - rheight);
                }
            }

            _addPoint(interaction, point, function(target){
                Helper.validateInstructions(interaction, {target : target});
            });
        });
    };

    /**
     * Add a new point to the paper
     * @private
     * @param {Object} interaction
     * @param {Object} point - the point to add to the paper
     * @param {Number} point.x - point's x coord
     * @param {Number} point.y - point's y coord 
     * @param {Function} cb - call on change, added/removed
     */
    var _addPoint = function _addPoint(interaction, point, cb){
        var x = point.x >= 9 ? point.x - 9 : 0;
        var y = point.y >= 9 ? point.y - 9 : 0;

        var target = interaction.paper
            .path(graphic.getTargetPath())
            .transform('T' + (point.x - 9) + ',' + (point.y - 9))
            .attr({
                'fill' : graphic.states.success.fill,
                'width' : 1,
                'stroke-width' : 0,
                'cursor' : 'pointer',
                'title' : _('Click again to remove')
            })


        //create an invisible rect over the target to ensure path selection
        var layer = interaction.paper
            .rect(point.x - 9, point.y - 9, 18, 18)
            .attr({'fill' :  '#ffffff', opacity : 0, cursor: 'pointer'} )
            .hover(function(){
                target.attr({'fill' : graphic.states.hover.stroke});
            }, function(){
                target.attr({'fill' : graphic.states.success.fill});
            })
            .click(function(){
                this.remove();
                target.remove();
                if(typeof cb === 'function'){
                    cb();
                }
            });
            //.hover(function(){
                //graphic.trigger(target, 'mouseover');
            //}, function(){
                //graphic.trigger(target, 'mouseout');
            //})
            //.click(function(){
                //this.remove();
                //graphic.trigger(target, 'click');
            //});

            
        

        layer.data('point', point);

        if(typeof cb === 'function'){
            cb(target);
        }
    };

    /** 
     * Set the instructions regarding the constrains, here min and maxChoices.
     * @private
     * @param {Object} interaction
     */
    var _setInstructions = function _setInstructions(interaction){

        var min = interaction.attr('minChoices'),
            max = interaction.attr('maxChoices'),
            msg;

        //if maxChoice = 0, inifinite choice possible
        if(max > 0 && max === min){
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
                                highlightError(data.target);
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

        }else if(max > 0 && max > min){
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
                                highlightError(data.target);
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
        }else if(min > 0){
            msg = (min <= 1) ? __('You must at least %d choice', min) : __('You must select at least %d choices', max);
            Helper.appendInstruction(interaction, msg, function(){
                if(_getRawResponse(interaction).length >= min){
                    this.setLevel('success');
                }else{
                    this.reset();
                }
            });
        }

        function highlightError(target){
            if(target){
                target.attr({'fill' : graphic.states.error.fill});
                _.delay(function(){
                    target.attr({'fill' : graphic.states.success.fill});
                }, 800);
            }
        }
    };

    /**
     * Get the responses from the interaction
     * @private 
     * @param {Object} interaction
     * @returns {Array} of points
     */
    var _getRawResponse = function _getRawResponse(interaction){
        var points = [];
        interaction.paper.forEach(function(element){
            var point = element.data('point');
            if(typeof point === 'object' && point.x && point.y){
                points.push([point.x, point.y]);
            }
        });
        return points;
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
            }catch(e){
            }

            if(_.isArray(responseValues)){
                _(responseValues)
                    .flatten()
                    .map(function(value, index){
                    if(index % 2 === 0){
                        return {x : value, y : responseValues[index + 1]};
                    }
                })
                .filter(_.isObject)
                .forEach(_.partial(_addPoint, interaction));
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
        var raw = _getRawResponse(interaction);
        var response = pciResponse.serialize(_getRawResponse(interaction), interaction);
        return response;
    };

    /**
     * Expose the common renderer for the interaction
     * @exports qtiCommonRenderer/renderers/interactions/SelectPointInteraction
     */
    return {
        qtiClass : 'selectPointInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse
    };
});

