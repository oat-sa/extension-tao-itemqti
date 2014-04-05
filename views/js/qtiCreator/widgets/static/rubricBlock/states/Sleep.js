define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Sleep'], function(stateFactory, SleepState){
    
    var RubriBlockStateSleep = stateFactory.create(SleepState, function(){}, function(){});
    
    return RubriBlockStateSleep;
});