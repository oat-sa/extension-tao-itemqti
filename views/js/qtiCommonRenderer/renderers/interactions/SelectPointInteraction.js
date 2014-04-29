/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/selectPointInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper'
], function($, _, __, tpl, graphic, pciResponse, Helper){

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
        
        //create the paper
        interaction.paper = graphic.responsivePaper( 'graphic-paper-' + interaction.serial, {
            width       : background.width, 
            height      : background.height,
            img         : baseUrl + background.data,
            imgId       : 'bg-image-' + interaction.serial,
            diff        : $('.image-editor', $container).outerWidth() - $('.main-image-box', $container).outerWidth(),
            container   : $container
        });

        //enable to select the paper to position a target
        _enableSelection(interaction);

        //set up the constraints instructions
        Helper.minMaxChoiceInstructions(interaction, {
            min: interaction.attr('minChoices'),
            max: interaction.attr('maxChoices'),
            choiceCount : false,
            getResponse : _getRawResponse,
            onError : function(data){
                graphic.highlightError(data.target, 'success');
            }
        }); 
    };

    /**
     * Make the image clickable and place targets at the given position.
     * @private
     * @param {object} interaction
     */
    var _enableSelection = function _enableSelection(interaction){
        var $container = Helper.getContainer(interaction);
        var isResponsive = $container.hasClass('responsive');
        var $imageBox = $container.find('.main-image-box');
        var image = interaction.paper.getById('bg-image-' + interaction.serial);
        var isTouch = false;

        //used to see if we are in a touch context
        image.touchstart(function(){
            isTouch = true;
            image.untouchstart();
        });

        //get the point on click
        image.click(function imageClicked(event){
    
            //get the current mouse point, even on a responsive paper
            var point = graphic.getPoint(event, interaction.paper, $imageBox, isResponsive);
            
            //add the point to the paper
            _addPoint(interaction, point, function pointAdded (target){
                if(isTouch && target){
                    graphic.createTouchCircle(interaction.paper, target.getBBox());
                }
                Helper.triggerResponseChangeEvent(interaction);
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

        //create the target from a path
        var target = interaction.paper
            .path(graphic._style.target.path)
            .transform('T' + (point.x - 9) + ',' + (point.y - 9))
            .attr(graphic._style.target)
            .attr('title', _('Click again to remove'));


        //create an invisible rect over the target to ensure path selection
        var layer = interaction.paper
            .rect(point.x - 9, point.y - 9, 18, 18)
            .attr(graphic._style.layer)
            .hover(function(){
                if(!target.flashing){
                    graphic.setStyle(target, 'target-hover');
                }
            }, function(){
                if(!target.flashing){
                    graphic.setStyle(target, 'target-success');
                }
            })
            .click(function(){
                this.remove();
                target.remove();
                if(typeof cb === 'function'){
                    cb();
                }
            });


        layer.data('point', point);

        if(typeof cb === 'function'){
            cb(target);
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

