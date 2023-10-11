define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiCreator/model/helper/portableElement',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/qtiItem/core/interactions/CustomInteraction'
], function(editable, editableInteraction, portableElement, ciRegistry, Interaction){
    "use strict";
    var _throwMissingImplementationError = function(pci, fnName){
        throw fnName + ' not available for pci of type ' + pci.typeIdentifier;
    };

    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, portableElement.getDefaultMethods(ciRegistry));
    Object.assign(methods, {
        createChoice : function(){

            var creator = ciRegistry.getCreator(this.typeIdentifier);
            if (typeof creator.createChoice === "function"){
                return creator.createChoice(this);
            }else{
                _throwMissingImplementationError(this, 'createChoice');
            }
        },
        getDefaultMarkupTemplateData : function(){
            return {
                responseIdentifier : this.attr('responseIdentifier')
            };
        }
    });

    return Interaction.extend(methods);
});