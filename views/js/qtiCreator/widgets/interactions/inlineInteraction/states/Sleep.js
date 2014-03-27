define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Sleep'], function(stateFactory, SleepState){
    
    var InlineInteractionStateSleep = stateFactory.create(SleepState, function(){
        
        var _widget = this.widget;
        console.log(_widget.$original);
        _widget.$original.on('click.qti-widget.sleep', function(e){
            console.log('dd');
            e.stopPropagation();
            //if active == false do this: (else nothing)
            //show toolbar, prompt widget and choice widgets and property form

            //init default mode: question
            _widget.changeState('question');
            
        });
        
    }, function(){
        
        //remove hover outline box display
    });
    
    return InlineInteractionStateSleep;
});