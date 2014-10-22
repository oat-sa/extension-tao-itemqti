define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiItem/core/interactions/CustomInteraction'
], function(_, $, editable, editableInteraction, ciRegistry, Interaction){

    var _throwMissingImplementationError = function(pci, fnName){
        throw fnName + ' not available for pci of type ' + pci.typeIdentifier;
    };
    
    function _addNsDir(typeIdentifier, file){
        return typeIdentifier + '/' + file.replace(/^\.\//, '');
    }
    
    function addNamespaceDirectory($typeIdentifier, $file){
        if(_.isString($file)){
            return _addNsDir($typeIdentifier, $file);
        }else if(_.isArray($file)){
            return _.map($file, function($f){
                return _addNsDir($typeIdentifier, $f);
            });
        }
    }
    
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        getDefaultProperties : function(){

            var pciCreator = ciRegistry.getCreator(this.typeIdentifier);
            if(_.isFunction(pciCreator.getDefaultProperties)){
                return pciCreator.getDefaultProperties(this);
            }else{
                return {};
            }
        },
        afterCreate : function(){
            
            var typeId = this.typeIdentifier,
                pciCreator = ciRegistry.getCreator(typeId),
                manifest = ciRegistry.getManifest(typeId),
                item = this.getRelatedItem();
            
            //add required resource
            //@todo need afterCreate() to return a promise
            var _this = this;
            ciRegistry.addRequiredResources(typeId, item.data('uri'), function(res){
                if(res.success){
                    $(document).trigger('resourceadded.qti-creator', [typeId, res.resources, _this]);
                }else{
                    throw 'resource addition failed';
                }
            });
            
            //set default markup (for initial rendering)
            pciCreator.getMarkupTemplate();

            //set pci props
            this.properties = pciCreator.getDefaultProperties();

            //set hook entry point
            this.entryPoint = addNamespaceDirectory(typeId, manifest.entryPoint);
            
            //set libs
            if(_.isArray(manifest.libraries)){
                this.libraries = addNamespaceDirectory(typeId, manifest.libraries);
            }
        
            if(_.isArray(manifest.css)){
                this.css = addNamespaceDirectory(typeId, manifest.css);
                _.each(this.css, function(css){
                    if(!item.stylesheetExists(css)){
                        item.createStyleSheet(css);
                    }
                });
            }
            
            //create response
            this.createResponse({
                baseType : manifest.response.baseType,
                cardinality : manifest.response.cardinality
            });

            //set markup
            this.markup = this.renderMarkup();

            //set pci namespace to item
            this.getNamespace();

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
        },
        updateMarkup : function(){
            this.markup = this.renderMarkup();
        }
    });

    return Interaction.extend(methods);
});