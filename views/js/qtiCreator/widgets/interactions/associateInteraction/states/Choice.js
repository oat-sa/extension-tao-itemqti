define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Choice'
], function(stateFactory, Choice){

    var AssociateInteractionStateChoice = stateFactory.extend(Choice, function(){
        
        this.widget.$container.on('keyup', '.qti-choice', function(){
            //check height
            
            //update choice
        });
        
    }, function(){
        
    });

    return AssociateInteractionStateChoice;
});