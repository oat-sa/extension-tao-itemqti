define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/textEntry',
    'taoQtiItem/qtiCreator/model/choices/SimpleChoice'
], function(stateFactory, Question, formElement, formTpl, Choice){

    var TextEntryInteractionStateQuestion = stateFactory.extend(Question, function(){

        var $mainOption = this.widget.$container.find('.main-option'),
            $original = this.widget.$original;
        
        //listener to children choice widget change and update the original interaction placehoder
        $(document).on('choiceTextChange.qti-widget.question', function(){
            $original.width($mainOption.width());
        });

    }, function(){
        
        $(document).off('.qti-widget.question');
    });

    TextEntryInteractionStateQuestion.prototype.addNewChoiceButton = function(){

        var _widget = this.widget,
            $addChoice = _widget.$container.find('.add-option'),
            interaction = _widget.element;

        //init add choice button once only
        if(!$addChoice.data('initialized')){

            $addChoice.on('click.qti-widget', function(e){

                e.stopPropagation();

                //add a new choice
                var choice = new Choice();
                interaction.addChoice(choice);      
                  
                //append render choice:
                $(this).closest('tr').before(_widget.renderChoice(choice));
                _widget.buildChoice(choice, {
                    ready : function(widget){
                        //transition state directly back to "question"
                        widget.changeState('question');
                    }
                });
            });

            //set button as initialized
            $addChoice.data('initialized', true);
        }
    };

    TextEntryInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget;

        _widget.$form.html(formTpl({
            shuffle : !!_widget.element.attr('shuffle')
        }));
        
        //follow other interaction like choice interaction for example of implementation

    };

    return TextEntryInteractionStateQuestion;
});