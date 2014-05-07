define([
'taoQtiItem/qtiCreator/widgets/states/factory',
'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState'
], function(stateFactory, Answer, answerStateHelper){

    var SliderInteractionStateAnswer = stateFactory.extend(Answer, function(){
        
        var _widget = this.widget;
        
        
    }, function(){
        var _widget = this.widget;
    });
    return SliderInteractionStateAnswer;
});