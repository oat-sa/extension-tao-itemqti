define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/MediaInteraction'
], function(_, editable, editableInteraction, Interaction){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                autostart : false,
                minPlays : 0,
                maxPlays : 0,
                loop : false
            };
        },
        afterCreate : function(){
            //function that will immediately be called after its creation in the item creator
            
            //nothing special to do here ?
        },
        createChoice : function(){
            throw 'mediaInteraction does not have any choices';
        }
    });
    return Interaction.extend(methods);
});


