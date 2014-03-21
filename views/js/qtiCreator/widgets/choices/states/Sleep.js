define(['taoQtiItemCreator/widgets/states/factory', 'taoQtiItemCreator/widgets/states/Sleep'], function(stateFactory, Sleep){
    
    var ChoiceStateSleep = stateFactory.create(Sleep, function(){
        
        var _widget = this.widget;
        
        _widget.$container.on('click.qti-widget', function(e){
            
            //call interaction active?
//            e.stopPropagation();
            //init
        });
        
    }, function(){
        
        //remove hover outline box display
    });
    
    return ChoiceStateSleep;
});