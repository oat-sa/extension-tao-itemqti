define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState'
], function(stateFactory, Answer, answerStateHelper){

    function initAnswerState(){
        console.log('init answer state');
        answerStateHelper.forward(this.widget);
    }
    
    function exitAnswerState(){

    }

    return stateFactory.extend(Answer, initAnswerState, exitAnswerState);
});
