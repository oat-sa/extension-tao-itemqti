define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active'
], function(stateFactory, Active){
    
    return stateFactory.extend(Active, function(){
        
        var _widget = this.widget;
        
        _widget.beforeStateInit(function(e, element, state){
            
            var serial = element.getSerial();
            if(state.name === 'active' && serial !== _widget.serial){
                //call sleep whenever other widget is active
                _widget.changeState('sleep');
            }
            
        }, 'otherActive');
        
        _widget.$container.on('click.active', function(e){
           e.stopPropagation(); 
        });
        $('#item-editor-panel').on('click.active', function(){
            _widget.changeState('sleep');
        });
        
    }, function(){
        
        this.widget.$container.off('.active');
        $('#item-editor-panel').off('.active');
        
        this.widget.offEvents('otherActive');
    });
    
});