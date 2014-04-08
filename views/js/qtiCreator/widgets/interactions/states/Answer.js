define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Answer'
], function(stateFactory, Answer){

    var InteractionStateAnswer = stateFactory.create(Answer, function(){
        
        //add class runtime to display hover style
        this.widget.$container.addClass('runtime');
        
    }, function(){
        
        //remove runtime style
        this.widget.$container.removeClass('runtime');
    });
    
    return InteractionStateAnswer;
});