define(['jquery', 'taoQtiItem/qtiCreator/widgets/states/factory'], function($, stateFactory){
    
    return stateFactory.create('active', function(){
        
        var _widget = this.widget,
            itemWidget = this.widget.element.getRelatedItem().data('widget');
       
        //move to sleep state by clicking everywhere outside the interaction 
        $('#item-editor-panel').on('click.active', function(e){
            if(!$.contains(_widget.$container[0], e.target)){
                _widget.changeState('sleep');
            }
        }).on('styleedit.active', function(){
            _widget.changeState('sleep');
        });
        
        itemWidget.$container.on('resizestart.gridEdit.active beforedragoverstart.gridEdit.active', function(){
            _widget.changeState('sleep');
        });
        
    },function(){
        
        var itemWidget = this.widget.element.getRelatedItem().data('widget');
        
        this.widget.$container.off('.active');
        $('#item-editor-panel').off('.active');
        
        this.widget.offEvents('otherActive');
        
        itemWidget.$container.off('.active');
    });
});
