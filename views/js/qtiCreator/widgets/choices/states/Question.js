define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.content',
    'taoQtiItem/qtiCreator/helper/htmlEditor',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement'
], function(stateFactory, QuestionState, contentToolbarTpl, htmlEditor, formElement){

    var ChoiceStateQuestion = stateFactory.create(QuestionState, function(){

        var _widget = this.widget;

        //add some event listeners
        _widget.$container.on('click.question', function(){
            //show option form
            _widget.changeState('choice');
        }).on('mouseenter.question', function(){
            //add listener to display proper hover style
            $(this).addClass('hover');
        }).on('mouseleave.question', function(){
            $(this).removeClass('hover');
        });

        //allow quick edit of internal element (toggle shuffle/fix, delete choices via minit-toolbar)
        this.createToolbar().show();

        this.buildEditor();

        //switchable to choice(click), answer(toolbar), deleting(toolbar), sleep (OK button) 

    }, function(){

        //remove the question state toolbar properly
        this.removeToolbar();

        //disable/destroy editor, hide mini-toolbar
        this.destroyEditor();

        //!! very important, always unbind the event on exit!
        this.widget.$container.off('.question');
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

            $container.append($toolbar);

            //set toolbar button behaviour:
            formElement.initShufflePinToggle(_widget);
            formElement.initDelete(_widget);
        }

        return $toolbar;
    };

    ChoiceStateQuestion.prototype.removeToolbar = function(){

        this.widget.$container.find('.mini-tlb[data-edit=question]').remove()
    };

    ChoiceStateQuestion.prototype.buildEditor = function(){

        var _widget = this.widget,
            $editableContainer = _widget.$container;

        //@todo set them in the tpl
        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                change : function(data){
                    _widget.element.body(data);
                },
                focus : function(){
                    _widget.changeState('choice');
                },
                data : {
                    container : _widget.element.getBody(),
                    widget : _widget
                }
            });
        }
    };

    ChoiceStateQuestion.prototype.destroyEditor = function(){
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    return ChoiceStateQuestion;
});