define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Active'], function(stateFactory, Active){

    var StaticStateActive = stateFactory.create(Active, function(){
    },function(){
    });

    return StaticStateActive;
});