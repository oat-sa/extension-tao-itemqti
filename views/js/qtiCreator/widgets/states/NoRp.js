define(['taoQtiItem/qtiCreator/widgets/states/factory'], function(stateFactory){
    return stateFactory.create('norp', ['answer', 'active'], function(){
        throw new Error('state "norp" prototype init method must be implemented');
    },function(){
        throw new Error('state "norp" prototype exit method must be implemented');
    });
});