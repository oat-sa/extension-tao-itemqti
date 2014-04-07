define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Active'], function(stateFactory, Active){

    var TextStateActive = stateFactory.create(Active, function(){
    },function(){
    });

    return TextStateActive;
});