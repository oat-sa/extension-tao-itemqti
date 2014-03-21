define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/states/Map',
    'lodash'
], function(stateFactory, Map, _){

    var ChoiceInteractionStateMap = stateFactory.create(Map, function(){
        
         this.widget.$container.find('[data-edit="map"]').show();
        
        //check if the interaction response has a correct define and show correct if so:
        var response = this.widget.element.getResponseDeclaration();
        if(_.size(response)){
            this.widget.$container.find('[data-edit="correct"]').show();
        }
        
    }, function(){
        
        this.widget.$container.find('[data-edit="map"], [data-edit="correct"]').hide();
    });

    return ChoiceInteractionStateMap;
});