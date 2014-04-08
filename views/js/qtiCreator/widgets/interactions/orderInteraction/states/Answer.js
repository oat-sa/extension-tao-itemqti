define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer'
], function(stateFactory, Answer){

    var OrderInteractionStateAnswer = stateFactory.create(Answer, function(){
        //currently only allow "correct" state
        this.widget.changeState('correct');
        
        this.widget.$container.addClass('runtime');
        
    }, function(){
        
        this.widget.$container.removeClass('runtime');
    });

    return OrderInteractionStateAnswer;
});