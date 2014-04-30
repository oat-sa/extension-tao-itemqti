define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/GraphicGapMatchInteraction'
], function($, _, editable, editableInteraction, Interaction){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        
        /**
         * Set the default values for the model 
         */ 
        getDefaultAttributes : function(){
            return {
                'maxChoices' : 0,
                'minChoices' : 0,
                'object' : {
                    'width'  : '100%',
                    'height' : '100%'  
                }
            };
        },

        /**
         * Once the interaction model is created, 
         * we set the responsivness and create a default response 
         */ 
        afterCreate : function(){
            var relatedItem = this.getRelatedItem();
            var isResponsive = relatedItem.getMeta('responsive');

            if(isResponsive === true){
                this.addClass('responsive');
            }
            this.createResponse({
                baseType:'identifier',
                cardinality:'single'
            });
        },
    });
    return Interaction.extend(methods);
});


