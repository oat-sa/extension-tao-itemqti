define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiItem/core/interactions/CustomInteraction'
], function(_, editable, editableInteraction, ciRegistry, Interaction){

    var _throwMissingImplementationError = function(pci, fnName){
        throw fnName + ' not available for pci of type ' + pci.typeIdentifier;
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

            //set default markup (for initial rendering)
            pciCreator.getMarkupTemplate();

            //set pci props
            this.properties = pciCreator.getDefaultPciProperties();

            //set libs
            var manifest = ciRegistry.getManifest(this.typeIdentifier);
            this.libraries = manifest.libraries;
            this.libraries[this.typeIdentifier + '.entryPoint'] = manifest.entryPoint;
            if(_.isArray(manifest.css)){
                //currently load css as libs (requirejs module)
                for(var i in manifest.css){
                    this.libraries[this.typeIdentifier + '.stylesheet' + i] = manifest.css[i];
                }
            }
            
            //create response
            this.createResponse({
                baseType : manifest.response.baseType,
                cardinality : manifest.response.cardinality
            });
            
            //set markup
            this.markup = this.renderMarkup();

            //after create
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
        },
        renderMarkup : function(){
            
            var pciCreator = ciRegistry.getCreator(this.typeIdentifier),
                markupTpl = pciCreator.getMarkupTemplate(),
                markupData = {
                responseIdentifier : this.attr('responseIdentifier')
            };
            
            if(_.isFunction(pciCreator.getMarkupData)){
                //overwrite the default data with the custom one
                markupData = pciCreator.getMarkupData(this, markupData);
            }
            
            return markupTpl(markupData);
        }
    });

    return Interaction.extend(methods);
});