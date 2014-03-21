define(['taoQtiItemCreator/widgets/states/factory', 'taoQtiItemCreator/widgets/states/Active'], function(stateFactory, Active){
    
    var ChoiceStateActive = stateFactory.create(Active, function(){
        
        //add active highlight
        
    },function(){
        
        //remove hover outline box display
        //remove active highlight
    });

    return ChoiceStateActive;
});