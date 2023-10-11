define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/TextEntryInteraction'
], function(editable, editableInteraction, Interaction){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                base : 10,
                placeholderText : ''
            };
        },
        afterCreate : function(){
            this.createResponse({
                baseType:'string',
                cardinality:'single'
            });
        },
        createChoice : function(){
            throw new Error('text entry interaction has no choice');
        }
    });
    return Interaction.extend(methods);
});