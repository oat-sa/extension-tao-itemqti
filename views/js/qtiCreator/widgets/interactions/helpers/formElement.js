define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiItem/core/Element',
    'ui/tooltip'
], function($, _, formElement, Element){

    var _scoreTooltipContent = {
        required : 'this is required',
        invalid : 'the score format is not numeric'
    };

    var formElementHelper = {
        init : function(widget){
            formElement.initWidget(widget.$form);
        },

        /**
         * Helps you to synchrnonize min/max widgets so the min isn't greater than the max, etc.
         * @param {Object} widget - the interacion's widget (where widget.element is the interaction)
         * @param {String} [attributeNameMin = minChoices] - the name of the min field and attribute
         * @param {String} [attributeNameMax = maxChoices] - the name of the max field and attribute
         * @param {Function} [getMax = _.size] - how to get the max value from the choices lists (in attributes)
         */
        syncMaxChoices : function(widget, attributeNameMin, attributeNameMax, getMax){

            attributeNameMin = attributeNameMin || 'minChoices';
            attributeNameMax = attributeNameMax || 'maxChoices';
            getMax = getMax || _.size;
            var $min = widget.$form.find('input[name=' + attributeNameMin + ']'),
                $max = widget.$form.find('input[name=' + attributeNameMax + ']');

            var _syncMaxChoices = function(){
                var newOptions = {max : getMax(widget.element.getChoices())};
                $min.incrementer('options', newOptions).keyup();
                $max.incrementer('options', newOptions).keyup();
            };

            widget.on('choiceCreated', function(data){

                if(data.interaction.serial === widget.element.serial){
                    _syncMaxChoices();
                }

            }).on('deleted', function(data){

                if(data.parent.serial === widget.element.serial &&
                    Element.isA(data.element, 'choice')){

                    _syncMaxChoices();
                }
            });

        },

        //set float (used for score)
        setScore : function($scoreInput, options){
            options = _.defaults(options || {}, {
                required : false,
                empty : function(){
                },
                set : function(){
                },
                key : function(){
                    return $(this).attr('name');
                },
                tooltipContent : _scoreTooltipContent
            });

            if($scoreInput.data('hasqtip') === undefined){
                $scoreInput.qtip({
                    show: {
                        event : 'custom'
                    },
                    hide: {
                        event : 'custom'
                    },
                    theme : 'error',
                    position: {
                        container: $scoreInput.parent()
                    },
                    content: {
                        text: ''
                    }
                });
            }

            var value = $scoreInput.val(),
                score = parseFloat(value),
                key = options.key.call($scoreInput[0]);

            if(value === ''){
                if(options.required){
                    //missing required score value!
                    $scoreInput.qtip('set', 'content.text', options.tooltipContent.required);
                    $scoreInput.qtip('show');
                }else{
                    $scoreInput.qtip('hide');
                    options.empty(key);
                }
            }else if(!isNaN(score)){
                //is a correct number
                $scoreInput.qtip('hide');
                options.set(key, score);
            }else{
                //invalid input!
                $scoreInput.qtip('set', 'content.text', options.tooltipContent.invalid);
                $scoreInput.qtip('show');
            }

        }
        //set text (used for controlled pattern, especially id)
    };

    return formElementHelper;
});
