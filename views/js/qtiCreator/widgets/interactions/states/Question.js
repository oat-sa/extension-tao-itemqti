define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/addChoice',
    'i18n'
], function(stateFactory, Question, addChoiceTpl, __){

    var InteractionStateQuestion = stateFactory.create(Question, function(){

        //show option form
        this.addOptionForm();

        //allow quick edit of internal element (toggle shuffle/fix, delete choices via minit-toolbar)

        //init add choice button if needed
        this.addNewChoiceButton(this.widget);

        //switchable to choice(click), answer(toolbar), deleting(toolbar), sleep (OK button) 
        
    }, function(){
        
        this.widget.$form.empty();

        //disable/destroy editor, hide mini-toolbar
    });


    InteractionStateQuestion.prototype.addNewChoiceButton = function(){

        var widget = this.widget,
            $choiceArea = widget.$container.find('.choice-area'),
            interaction = widget.element;

        //init add choice button if needed
        if(!$choiceArea.children('.add-option').length){

            $choiceArea.append(addChoiceTpl({
                serial : this.serial,
                text : __('Add choice')
            }));

            $choiceArea.children('.add-option').on('click.qti-widget', function(e){

                e.stopPropagation();

                //add a new choice
                var choice = interaction.createChoice(),
                    $newChoicePlaceholder = $('<li>'),
                    qtiChoiceClassName = choice.qtiClass + '.' + interaction.qtiClass,
                    tplData = {
                    interaction : {
                        attributes : interaction.attributes
                    }
                };

                //append placeholder
                $(this).before($newChoicePlaceholder);

                //render the new choice
                choice.render(tplData, $newChoicePlaceholder, qtiChoiceClassName);
                choice.postRender({
                    ready : function(widget){
                        //transition state directly back to "question"
                        widget.changeState('question');
                    }
                }, qtiChoiceClassName);
            });

        }
    };

    InteractionStateQuestion.prototype.addOptionForm = function(){
        stateFactory.throwMissingRequiredImplementationError('addOptionForm');
    };

    return InteractionStateQuestion;
});