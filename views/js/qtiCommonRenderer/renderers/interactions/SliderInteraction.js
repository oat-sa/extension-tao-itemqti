define([
    'lodash',
    'jquery',
    'tpl!taoQtiCommonRenderer/tpl/interactions/sliderInteraction',
    'taoQtiCommonRenderer/renderers/Helper',
    'jqueryui'
], function(_, $, tpl, Helper){
    'use strict';   
    
    var _slideTo = function(options){
        options.sliderCurrentValue.find('.qti_slider_cur_value').text(options.value);
        options.sliderValue.val(options.value);
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10333
     * 
     * @param {object} interaction
     */
    var render = function(interaction){
       
        var attributes = interaction.getAttributes(),
            $container = interaction.getContainer(),
            $el = $('<div />').attr({'id': attributes.identifier + '_qti_slider'}), //slider element
            $sliderLabels = $('<div />').attr({'id': attributes.identifier + 'qti_slider_values', 'class': 'qti_slider_values'}),
            $sliderCurrentValue = $('<div />').attr({'id': attributes.identifier + '_qti_slider_cur_value'}), //show the current selected value
            $sliderValue = $('<input />').attr({'type':'hidden', 'id': attributes.identifier + '_qti_slider_value'}); //the input that always holds the slider value
            
        //getting the options
        var orientation = 'horizontal',
            reverse = typeof attributes.reverse !== 'undefined' && attributes.reverse ? true : false, //setting the slider whether to be reverse or not 
            min = parseInt(attributes.lowerBound),
            max = parseInt(attributes.upperBound),
            step = typeof attributes.step !== 'undefined' && attributes.step ? parseInt(attributes.step) : 1, //default value as per QTI standard
            steps = (max-min) / step; //number of the steps

        //add the containers
        $sliderCurrentValue.append('<span class="qti_slider_cur_value_text">Current value: </span>')
                           .append('<span class="qti_slider_cur_value"></span>');
                   
        $sliderLabels.append('<span class="slider_min">' + (!reverse ? min : max) + '</span>')
                    .append('<span class="slider_max">' + (!reverse ? max : min) + '</span>');
        
        interaction.getContainer().append($el)
                                .append($sliderLabels)
                                .append($sliderCurrentValue)
                                .append($sliderValue);

        //setting the orientation of the slider
        if(typeof attributes.orientation !== 'undefined' &&  $.inArray(attributes.orientation, ['horizontal', 'vertical']) > -1){
            orientation = attributes.orientation;
        }

        var sliderSize = 0;

        if(orientation === 'horizontal'){
            $container.addClass('qti_slider_horizontal');
        }else {
            var maxHeight = 300;
            sliderSize = steps * 20;
            if(sliderSize > maxHeight){
                sliderSize = maxHeight;
            }
            $container.addClass('qti_slider_vertical');
            $el.height(sliderSize + 'px');
            $sliderLabels.height(sliderSize + 'px');
        }

        //set the middle value if the stepLabel attribute is enabled
        if(typeof attributes.stepLabel !== 'undefined' && attributes.stepLabel){
            var middleStep = parseInt(steps / 2),
                leftOffset = (100 / steps) * middleStep,
                middleValue = reverse ? max - (middleStep * step) : min + (middleStep * step);
        
            if(orientation === 'horizontal'){
                $sliderLabels.find('.slider_min').after('<span class="slider_middle" style="left:'+ leftOffset +'%">' + middleValue + '</span>');
            }else {
                $sliderLabels.find('.slider_min').after('<span class="slider_middle" style="top:'+ leftOffset +'%">' + middleValue + '</span>');
            }
            
        }

        //create the slider
        $el.slider({
            value : reverse ? max : min,
            min : min,
            max : max,
            step : step,
            orientation : orientation,
            animate : 'fast',
            slide : function(event, ui){
                var val = ui.value;
                if((reverse)){
                    val = (max + min) - ui.value;
                }
                val = Math.round(val * 1000) / 1000;
                _slideTo({
                    'value': val,
                    'sliderValue': $sliderValue,
                    'sliderCurrentValue': $sliderCurrentValue
                });
            }
        });
        
        _slideTo({
            'value': min,
            'sliderValue': $sliderValue,
            'sliderCurrentValue': $sliderCurrentValue
        });
    };
    
    var _resetResponse = function(interaction){
        var attributes = interaction.getAttributes(),
            $el = $('#' + attributes.identifier + '_qti_slider'),
            $sliderValue = $('#'+ attributes.identifier + '_qti_slider_value'),
            $sliderCurrentValue = $('#'+ attributes.identifier + '_qti_slider_cur_value'),
            min = parseInt(attributes.lowerBound),
            max = parseInt(attributes.upperBound),
            reverse = typeof attributes.reverse !== 'undefined' && attributes.reverse ? true : false,
            startValue = reverse ? max : min;
    
        _slideTo({
            'value': min,
            'sliderValue': $sliderValue,
            'sliderCurrentValue': $sliderCurrentValue
        });
        
        $el.slider({'value' : startValue, 'animation' : false}).slider('refresh');
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
        var baseType = interaction.getResponseDeclaration().attr('baseType'),
            attributes = interaction.getAttributes(),
            $sliderValue = $('#'+ attributes.identifier + '_qti_slider_value'),
            $sliderCurrentValue = $('#'+ attributes.identifier + '_qti_slider_cur_value'),
            $el = $('#'+ attributes.identifier + '_qti_slider'),
            min = parseInt(attributes.lowerBound),
            max = parseInt(attributes.upperBound),
            reverse = typeof attributes.reverse !== 'undefined' && attributes.reverse ? true : false;
        
        if(response.base && response.base[baseType]){
            var value = reverse ? (max + min) - response.base[baseType] : response.base[baseType];
            
             _slideTo({
                'value': response.base[baseType],
                'sliderValue': $sliderValue,
                'sliderCurrentValue': $sliderCurrentValue
            });
            
            $el.slider({'value' : value, 'animation' : false}).slider('refresh');
        }else if(_.isEmpty(response)){
            _resetResponse(interaction);
        }else{
            throw new Error('wrong response format in argument: ');
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
            attributes = interaction.getAttributes(),
            baseType = interaction.getResponseDeclaration().attr('baseType'),
            min = parseInt(attributes.lowerBound),
            $sliderValue = $('#'+ attributes.identifier + '_qti_slider_value');
    
        if(baseType==='integer'){
            value = parseInt($sliderValue.val());
        } else if(baseType==='float'){
            value = parseFloat($sliderValue.val());
        }

        ret.base[baseType] = isNaN(value) ? min : value;
        
        return ret;
    };

    return {
        qtiClass : 'sliderInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse
    };
});
