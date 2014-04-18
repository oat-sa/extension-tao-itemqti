define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Sleep'], function(stateFactory, SleepState){
    
    var TextBlockStateSleep = stateFactory.create(SleepState, function(){}, function(){});
    
    return TextBlockStateSleep;
});