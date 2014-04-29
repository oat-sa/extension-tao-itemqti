define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/HotspotInteraction',
    'taoQtiItem/qtiCreator/model/choices/HotspotChoice'
], function($, _, editable, editableInteraction, Interaction, Choice){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                'shuffle' : false,
                'maxChoices' : 0,
                'minChoices' : 0,
                'object' : {
                    'width'  : '100%',
                    'height' : '100%'  
                }
            };
        },

        afterCreate : function(){
            var relatedItem = this.getRelatedItem();
            var isResponsive = relatedItem.data('responsive');

            if(isResponsive === true){
                relatedItem.addClass('responsive');
            }
            this.createChoice();
            this.createResponse({
                baseType:'identifier',
                cardinality:'single'
            });
        },

        createChoice : function(attr){
            var choice = new Choice('', attr);

            this.addChoice(choice);
            choice.buildIdentifier('hotspot');
            
            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }
            
            $(document).trigger('choiceCreated.qti-widget', {'choice' : choice, 'interaction' : this});
           
            return choice;
        }
    });
    return Interaction.extend(methods);
});


