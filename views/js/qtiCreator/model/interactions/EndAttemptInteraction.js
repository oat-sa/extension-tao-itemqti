define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/EndAttemptInteraction',
    'i18n'
], function(editable, editableInteraction, Interaction, __){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                title : __('End Attempt')
            };
        },
        afterCreate : function(){
            this.createResponse({
                baseType:'boolean',
                cardinality:'single'
            });
        },
        createChoice : function(){
            throw new Error('end attempt interaction has no choice');
        }
    });
    return Interaction.extend(methods);
});