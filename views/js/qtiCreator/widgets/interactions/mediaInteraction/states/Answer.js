define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState'
], function(stateFactory, Answer, answerStateHelper){

    //does not much sense for mediaInteraction (same remark for uploadInteraction)
    //I would recommend disabling the answer button completely and remove this file if no longer required
    
    var MediaInteractionStateAnswer = stateFactory.extend(Answer, function(){
        
        var _widget = this.widget;
        
        //forward to one of the available sub state, according to the response processing template
        answerStateHelper.forward(_widget);
        
    }, function(){
        
        var _widget = this.widget;
        
    });
    
    return MediaInteractionStateAnswer;
});