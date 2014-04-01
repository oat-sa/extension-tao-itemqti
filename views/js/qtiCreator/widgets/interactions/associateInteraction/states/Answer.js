define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer'
], function(stateFactory, Answer){

    var AssociateInteractionStateAnswer = stateFactory.extend(Answer);

    AssociateInteractionStateAnswer.prototype.createResponseWidget = function(){

    };

    AssociateInteractionStateAnswer.prototype.removeResponseWidget = function(){
        
    };
    
    return AssociateInteractionStateAnswer;
});