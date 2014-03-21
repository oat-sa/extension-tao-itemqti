define([
    'lodash',
    'jquery',
    'tpl!taoQtiCommonRenderer/tpl/interactions/extendedTextInteraction',
    'taoQtiCommonRenderer/helpers/Helper',
    'i18n',
    'polyfill/placeholders'
], function(_, $, tpl, Helper, __){


    /**
     * Setting the pattern mask for the input, for browsers which doesn't support this feature
     * @param {jQuery} $element
     * @param {string} pattern
     * @returns {undefined}
     */
    var _setPattern = function($element, pattern){
        var patt = new RegExp('^'+pattern+'$');
        
        //test when some data is entering in the input field
        //@todo plug the validator + tooltip
        $element.on('keyup', function(){
            $element.removeClass('field-error');
            if(!patt.test($element.val())){
                $element.addClass('field-error');
            }
        });
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     * 
     * @param {object} interaction
     */
    var render = function(interaction){
        var attributes = interaction.getAttributes(),
            $container = interaction.getContainer(),
            response = interaction.getResponseDeclaration(),
            multiple = !!(attributes.maxStrings && (response.attr('cardinality') === 'multiple' || response.attr('cardinality') === 'ordered'));
        var $el, expectedLength, expectedLines, placeholderType;       
 
        //if the input is textarea
        if(!multiple){
            $el = $container.find('textarea');
            
            //set the width(cols) on textarea 
            if(attributes.expectedLength){
                expectedLength = parseInt(attributes.expectedLength, 10);
                if(expectedLength > 0){
                    $el.attr('cols', expectedLength);
                }
            }

            //set the height(lines) on textarea 
            if(attributes.expectedLines){
                expectedLines = parseInt(attributes.expectedLines, 10);
                if(expectedLines > 0){
                    $el.attr('rows', expectedLines);
                }
            }

            //setting the pattern mask for the textarea
            if(attributes.patternMask){
                _setPattern($el, attributes.patternMask);
            }

            //setting the placeholder for the textarea
            if(attributes.placeholderText){
                $el.attr('placeholder', attributes.placeholderText);            
            }
            
        } else {
            $el = $container.find('input');

            //setting the checking for minimum number of answers
            if(attributes.minStrings){
                //get the number of filled inputs
                var _getNumStrings = function($element){
                    var num = 0;
                    $element.each(function(){
                        if($(this).val() !== ''){
                            num++;
                        }
                    });
                    return num;
                };
                var minStrings = parseInt(attributes.minStrings);

                if(minStrings>0){
                    $el.on('blur', function(){
                        setTimeout(function(){
                            //checking if the user was clicked outside of the input fields
                            if(!$el.is(':focus') && _getNumStrings($el)<minStrings){
                                Helper.appendNotification(interaction, __('The minimum number of answers is  ')+' : '+minStrings, 'warning');
                            }
                        }, 100);
                    });
                }
            }
            
            //set the fields width
            if(attributes.expectedLength){
                expectedLength = parseInt(attributes.expectedLength, 10);

                if(expectedLength > 0){
                    $el.each(function(){
                        $(this).css('width', expectedLength + 'em');
                    });
                }
            }
            
            //set the fileds pattern mask
            if(attributes.patternMask){
                $el.each(function(){
                    _setPattern($(this), attributes.patternMask);
                });
            }
            
            //set the fileds placeholder
            if(attributes.placeholderText){
                /**
                 * The type of the fileds placeholder:
                 * multiple - set placeholder for each field
                 * first - set placeholder only for first field
                 * none - dont set placeholder
                 */
                placeholderType = 'first';
                
                if(placeholderType === 'multiple'){
                    $el.each(function(){
                        $(this).attr('placeholder', attributes.placeholderText);
                    });
                } else if (placeholderType === 'first'){
                    $el.first().attr('placeholder', attributes.placeholderText);
                }
            }
        }
    };
    
    var _resetResponse = function(interaction){
        interaction.getContainer().find('input, textarea').val('');
    };

    /**
     * Set the response to the rendered interaction.
     * 
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343  
     * 
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     * 
     * Special value: the empty object value {} resets the interaction responses
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){

        var _setMultipleVal = function(identifier, value){
            interaction.getContainer().find('#'+identifier).val(value);
        };
        
        var _setVal = function(value){
            interaction.getContainer().find('textarea').val(value);
        };

        var baseType = interaction.getResponseDeclaration().attr('baseType');
        
        if(response.base && response.base[baseType]){
            _setVal(response.base[baseType]);
        } else if (response.list && response.list[baseType]){
            for(var i in response.list[baseType]){
                var identifier = typeof response.list.identifier === 'undefined'?'':response.list.identifier[i];
                _setMultipleVal(identifier + '_' + i, response.list[baseType][i]);
            }
        } else if (_.isEmpty(response)){
            _resetResponse(interaction);
        } else {
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
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
     * 
     * @param {object} interaction
     * @returns {object}
     */
    var getResponse = function(interaction){
        var $container = interaction.getContainer(),
            attributes = interaction.getAttributes(),
            responseDeclaration = interaction.getResponseDeclaration(),
            baseType = responseDeclaration.attr('baseType'),
            numericBase = attributes.base || 10,
            multiple = !!(attributes.maxStrings && (responseDeclaration.attr('cardinality') === 'multiple' || responseDeclaration.attr('cardinality') === 'ordered')),
            ret = multiple ? {list:{}} : {base:{}};
    
        if(multiple){
            var values = [];
            $container.find('input').each(function(i){
                $el = $(this);
                
                if(attributes.placeholderText && $el.val() === attributes.placeholderText){
                    values[i] = '';
                } else {
                    if(baseType==='integer'){
                        values[i] = parseInt($el.val(), numericBase);
                        values[i] = isNaN(values[i]) ? '' : values[i];
                    } else if(baseType==='float'){
                        values[i] = parseFloat($el.val());
                        values[i] = isNaN(values[i]) ? '' : values[i];
                    } else if(baseType==='string'){
                        values[i] = $el.val();
                    }
                }
            });

            ret.list[baseType] = values;
        } else {
            var value = '',
                $el = $container.find('textarea');
            
            if(attributes.placeholderText && $el.val() === attributes.placeholderText){
                value = '';
            } else {
                if(baseType==='integer'){
                    value = parseInt($el.val(), numericBase);
                } else if(baseType==='float'){
                    value = parseFloat($el.val());
                } else if(baseType==='string'){
                    value = $el.val();
                }
            }

            ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;
        }
        
        return ret;
    };

    return {
        qtiClass : 'extendedTextInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse
    };
});
