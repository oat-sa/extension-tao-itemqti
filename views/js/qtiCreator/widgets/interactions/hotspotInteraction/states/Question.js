define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphic',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice'
], function(stateFactory, Question, graphic, formElement, formTpl){

    var initQuestionState = function initQuestionState(){
        console.log('init', this, arguments);
        graphic.createSideBar(this.widget.$container); 
    };

    var exitQuestionState = function initQuestionState(){
        console.log('exit', this, arguments);
    };
    
    var HotspotInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    

    HotspotInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget;

        _widget.$form.html(formTpl({
            maxChoices : parseInt(_widget.element.attr('maxChoices'), 10),
            minChoices : parseInt(_widget.element.attr('minChoices'), 10)
        }));
        
        formElement.initShuffle(_widget);
        formElement.init(_widget);
    };
    
    return HotspotInteractionStateQuestion;
});
