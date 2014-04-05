define(['taoQtiItem/qtiCreator/widgets/states/factory'], function(stateFactory){
    return stateFactory.create('active', function(){
        
        var _widget = this.widget;
        
        _widget.beforeStateInit(function(e, element, state){
            var serial = element.getSerial();
            if(state.name === 'active' && serial !== _widget.serial){
                //when it does not click on itself, check if the newly activated element is its own composing element:
                var composingElts = _widget.element.getComposingElements();
                if(!composingElts[serial]){
                    _widget.changeState('sleep');
                }
            }
        }, 'otherActive');
        
    },function(){
        
        this.widget.offEvents('otherActive');
    });
});