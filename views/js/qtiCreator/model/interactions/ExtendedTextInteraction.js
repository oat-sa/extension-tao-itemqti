define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/ExtendedTextInteraction'
], function(editable, editableInteraction, Interaction){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                format: 'plain'
            };
        },
        afterCreate : function(){
            this.createResponse({
                baseType: 'string',
                cardinality: 'single'
            });
        },
        createChoice : function(){
            throw "extendedTextInteraction does not have any choices";
        }
    });
    return Interaction.extend(methods);
});


