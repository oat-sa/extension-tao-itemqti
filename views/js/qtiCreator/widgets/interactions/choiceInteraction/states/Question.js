define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice'
], function(stateFactory, Question, formElement, formTpl){

    var ChoiceInteractionStateQuestion = stateFactory.extend(Question);

    ChoiceInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget;

        _widget.$form.html(formTpl({
            shuffle : !!_widget.element.attr('shuffle'),
            maxChoices : parseInt(_widget.element.attr('maxChoices')),
            minChoices : parseInt(_widget.element.attr('minChoices'))
        }));
        
        formElement.initShuffle(_widget);
        formElement.init(_widget);
    };
    
    return ChoiceInteractionStateQuestion;
});