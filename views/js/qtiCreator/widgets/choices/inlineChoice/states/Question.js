define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.content',
    'taoQtiItem/qtiCreator/editor/htmlEditor',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement'
], function(stateFactory, QuestionState, contentToolbarTpl, htmlEditor, formElement){

    var ChoiceStateQuestion = stateFactory.create(QuestionState, function(){

        var _widget = this.widget;

        //show option form
        _widget.$container.on('click.question', function(){
            _widget.changeState('choice');
        });

        //allow quick edit of internal element (toggle shuffle/fix, delete choices via minit-toolbar)
        this.createToolbar().show();

        this.buildEditor();

        //switchable to choice(click), answer(toolbar), deleting(toolbar), sleep (OK button) 

    }, function(){

        //disable/destroy editor, hide mini-toolbar
        this.destroyEditor();
        this.widget.$container.find('[data-edit="question"]').hide();

        //!! very important, always unbind the event on exit!
        this.widget.$container.off('.question');
    });

    ChoiceStateQuestion.prototype.createToolbar = function(){

        var _widget = this.widget,
            $toolbar = _widget.$container.find('td:last');
        
        if(!$toolbar.data('initialized')){
            
            //set toolbar button behaviour:
            formElement.initShufflePinToggle(_widget);
            formElement.initDelete(_widget);
            
            $toolbar.data('initialized', true);
        }

        return $toolbar;
    };

    ChoiceStateQuestion.prototype.buildEditor = function(){

        var _widget = this.widget,
            $editableContainer = _widget.$container.children('td:first');
        
        $editableContainer.attr('contentEditable', true);
        
        $editableContainer.on('keyup.qti-widget', function(){
            _widget.element.val($(this).text());
        }).on('focus.qti-widget', function(){
            _widget.changeState('choice')
        });
    };

    ChoiceStateQuestion.prototype.destroyEditor = function(){
        this.widget.$container.find('td').removeAttr('contentEditable');
    };
    
    return ChoiceStateQuestion;
});