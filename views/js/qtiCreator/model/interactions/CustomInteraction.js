define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiItem/core/interactions/CustomInteraction'
], function(_, editable, editableInteraction, ciRegistry, Interaction){
    
    var _throwMissingImplementationError = function(pci, fnName){
        throw fnName+' not available for pci of type '+pci.typeIdentifier;
    };
    
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        getDefaultPciProperties : function(){
            
            var pciCreator = ciRegistry.getCreator(this.typeIdentifier);
            if(_.isFunction(pciCreator.getDefaultPciProperties)){
                return pciCreator.getDefaultPciProperties(this);
            }else{
                return {};
            }
        },
        afterCreate : function(){
            var pciCreator = ciRegistry.getCreator(this.typeIdentifier);
            if(_.isFunction(pciCreator.afterCreate)){
                return pciCreator.afterCreate(this);
            }
        },
        createChoice : function(){
        
            var pciCreator = ciRegistry.getCreator(this.typeIdentifier);
            if(_.isFunction(pciCreator.createChoice)){
                return pciCreator.createChoice(this);
            }else{
                _throwMissingImplementationError(this, 'createChoice');
            }
        }
    });
    
    return Interaction.extend(methods);
});