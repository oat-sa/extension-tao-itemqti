define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'taoQtiItem/qtiCreator/widgets/choices/helpers/formElement'
], function(stateFactory, QuestionState, formElement){

    var ChoiceStateQuestion = stateFactory.extend(QuestionState);

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