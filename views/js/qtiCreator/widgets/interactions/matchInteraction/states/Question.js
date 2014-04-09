define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/match'
], function(stateFactory, Question, formElement, formTpl){

    var MatchInteractionStateQuestion = stateFactory.extend(Question);

    MatchInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget;

        _widget.$form.html(formTpl({
            shuffle : !!_widget.element.attr('shuffle')
        }));
        
        formElement.initShuffle(_widget);
    };

    return MatchInteractionStateQuestion;
});