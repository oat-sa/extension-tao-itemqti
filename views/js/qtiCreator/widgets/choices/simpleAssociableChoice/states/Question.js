 define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.content',
    'taoQtiItem/qtiCreator/helper/htmlEditor',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement'
], function(stateFactory, QuestionState, contentToolbarTpl, htmlEditor, formElement){

    var ChoiceStateQuestion = stateFactory.extend(QuestionState, function(){
        
    }, function(){
        
    });

    ChoiceStateQuestion.prototype.createToolbar = function(){

        var _widget = this.widget,
            $container = _widget.$container,
            choice = _widget.element,
            interaction,
            $toolbar = $container.find('.mini-tlb');

        if(!$toolbar.length){

            interaction = choice.getInteraction();
            
            //add mini toolbars
            $toolbar = $(contentToolbarTpl({
                choiceSerial : choice.getSerial(),
                interactionSerial : interaction.getSerial(),
                fixed : choice.attr('fixed'),
                interactionShuffle : interaction.attr('shuffle')
            }));
            
            $container.children('.inner-wrapper').append($toolbar);
            
            //set toolbar button behaviour:
            formElement.initShufflePinToggle(_widget);
            formElement.initDelete(_widget);
        }

        return $toolbar;
    };
    
    return ChoiceStateQuestion;
});