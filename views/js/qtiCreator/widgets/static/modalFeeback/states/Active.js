define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Active', 'ui/modal'], function(stateFactory, Active){

    var StaticStateActive = stateFactory.create(Active, function(){
        console.log(this.widget.element);
        
        this.widget.$container.modal();
        
    },function(){
    });

    return StaticStateActive;
});