define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/static/states/Sleep'], function(stateFactory, SleepState){

    var PrintedVariableStateSleep = stateFactory.extend(SleepState, function(){}, function(){});

    return PrintedVariableStateSleep;
});