define(['taoQtiItemCreator/widgets/states/factory'], function(stateFactory){
    return stateFactory.create('sleep', function(){
        throw new Error('state "sleep" prototype init method must be implemented');
    },function(){
        throw new Error('state "sleep" prototype exit method must be implemented');
    });
});