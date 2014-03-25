define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice'
], function(stateFactory, Question, formElement, formTpl){

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    ChoiceInteractionStateQuestion.prototype.addOptionForm = function(){

        var _widget = this.widget;

        _widget.$form.html(formTpl({
            shuffle : !!_widget.element.attr('shuffle')
        }));
        
        formElement.initShuffle(_widget);
    };
    
    return ChoiceInteractionStateQuestion;
});