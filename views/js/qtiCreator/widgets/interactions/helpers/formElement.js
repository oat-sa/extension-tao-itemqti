define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tooltipster'
], function(_, formElement){
    
    var _scoreTooltipContent = {
        required:'this is required',
        invalid:'the score format is not numeric'
    };
    
    var formElementHelper = {
        init : function(widget){
            formElement.initWidget(widget.$form);
        },
        initShuffle : function(widget){

            var interaction = widget.element;

            widget.$form.find('[data-role=shuffle]').on('change', function(){

                var $choiceShuffleButtons = widget.$container.find('[data-role="shuffle-pin"]');

                if($(this).prop('checked')){
                    interaction.attr('shuffle', true);
                    $choiceShuffleButtons.show();
                }else{
                    interaction.attr('shuffle', false);
                    $choiceShuffleButtons.hide();
                }
            });
        },
        setScore:function($scoreInput, options){
            
            options = _.defaults(options || {}, {
                required:false,
                empty:function(){},
                set:function(){},
                key:function(){
                    return $(this).attr('name');
                },
                tooltipContent:{}
            });
            
            if(!$scoreInput.hasClass('tooltipstered')){
                $scoreInput.tooltipster({
                    theme : 'tao-error-tooltip',
                    content : _scoreTooltipContent.invalid,
                    delay : 350,
                    trigger : 'custom'
                });
            }
            
            var value = $scoreInput.val(),
                score = parseFloat(value),
                key = options.key.call($scoreInput[0]);

            if(value === ''){
                if(options.required){
                    //missing required score value!
                    $scoreInput.tooltipster('content', _scoreTooltipContent.required);
                    $scoreInput.tooltipster('show');
                }else{
                    $scoreInput.tooltipster('hide');
                    options.empty(key);
                }
            }else if(!isNaN(score)){
                //is a correct number
                $scoreInput.tooltipster('hide');
                options.set(key, score);
            }else{
                //invalid input!
                $scoreInput.tooltipster('content', _scoreTooltipContent.invalid);
                $scoreInput.tooltipster('show');
            }
            
        }
    };

    return formElementHelper;
});