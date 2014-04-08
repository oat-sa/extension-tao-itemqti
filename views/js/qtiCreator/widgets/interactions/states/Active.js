define(['taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Active'], function(stateFactory, Active){

    var InteractionStateActive = stateFactory.create(Active, function(){
        
        var _widget = this.widget;
        
        _widget.beforeStateInit(function(e, element, state){
            var serial = element.getSerial();
            if(state.name === 'active' && serial !== _widget.serial){
                //when it does not click on itself, check if the newly activated element is its own composing element:
                var composingElts = _widget.element.getComposingElements();
                if(!composingElts[serial]){
                    //hide the interaction completely
                    //hide all widgets: toolbar, prompt & choice widgets
                    _widget.changeState('sleep');
                }
            }
        }, 'otherActive');
        
        _widget.$container.addClass('edit-active');
        
    },function(){
        
        var _widget = this.widget;
        
        _widget.$container.removeClass('edit-active');
        
        _widget.offEvents('otherActive');
    });

    return InteractionStateActive;
});