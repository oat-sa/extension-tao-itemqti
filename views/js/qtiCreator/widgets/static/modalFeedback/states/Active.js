define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Active', 'ui/modal'], function(stateFactory, Active){

    var StaticStateActive = stateFactory.create(Active, function(){
        
        this.widget.$container.modal();
        
    },function(){
    });

    return StaticStateActive;
});