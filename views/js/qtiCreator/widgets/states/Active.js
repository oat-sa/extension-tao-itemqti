define(['taoQtiItem/qtiCreator/widgets/states/factory'], function(stateFactory){
    return stateFactory.create('active', function(){
        throw new Error('state "active" prototype init method must be implemented');
    },function(){
        throw new Error('state "active" prototype exit method must be implemented');
    });
});