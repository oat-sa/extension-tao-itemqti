define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/SliderInteraction'
], function(editable, editableInteraction, Interaction){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                'lowerBound': 0.0,
                'upperBound': 100.0,
                'orientation': 'horizontal',
                'reverse': false,
                'step': 1,
                'stepLabel': false
            };
        },
        afterCreate : function(){
            this.createResponse({
                baseType: 'integer',
                cardinality: 'single'
            });
        },
        createChoice : function(){
            throw "sliderInteraction does not have any choices";
        }
    });
    return Interaction.extend(methods);
});


