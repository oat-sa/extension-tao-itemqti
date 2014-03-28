define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/inlineChoice'
], function(stateFactory, Question, formElement, formTpl){

    var InlineChoiceInteractionStateQuestion = stateFactory.extend(Question);

    InlineChoiceInteractionStateQuestion.prototype.addNewChoiceButton = function(){

        var widget = this.widget,
            $addChoice = widget.$container.find('.add-option'),
            interaction = widget.element;

        //init add choice button once only
        if(!$addChoice.data('initialized')){

            $addChoice.on('click.qti-widget', function(e){

                e.stopPropagation();

                //add a new choice
                var choice = interaction.createChoice();

                //append render choice:
                $(this).closest('tr').before(widget.renderChoice(choice));
                widget.buildChoice(choice, {
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

    InlineChoiceInteractionStateQuestion.prototype.addOptionForm = function(){
        
        var _widget = this.widget;

        _widget.$form.html(formTpl({
            shuffle : !!_widget.element.attr('shuffle')
        }));
        
        formElement.initShuffle(_widget);
    };

    return InlineChoiceInteractionStateQuestion;
});