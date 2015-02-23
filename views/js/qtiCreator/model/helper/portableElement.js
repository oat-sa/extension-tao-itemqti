define(['lodash', 'jquery'], function(_, $){
    "use strict";
    
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


    function getDefaultMethods(registry){

        return {
            getDefaultAttributes : function(){
                return {};
            },
            getDefaultProperties : function(){

                var creator = registry.getCreator(this.typeIdentifier);
                if(_.isFunction(creator.getDefaultProperties)){
                    return creator.getDefaultProperties(this);
                }else{
                    return {};
                }
            },
            afterCreate : function(){

                var typeId = this.typeIdentifier,
                    creator = registry.getCreator(typeId),
                    manifest = registry.getManifest(typeId),
                    item = this.getRelatedItem();
                
                //add required resource
                //@todo need afterCreate() to return a promise
                var _this = this;
                registry.addRequiredResources(typeId, item.data('uri'), function(res){
                    if(res.success){
                        $(document).trigger('resourceadded.qti-creator', [typeId, res.resources, _this]);
                    }else{
                        throw 'resource addition failed';
                    }
                });

                //set default markup (for initial rendering)
                creator.getMarkupTemplate();

                //set pci props
                this.properties = creator.getDefaultProperties();

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
                
                //@todo fix this !
                if(manifest.response){//for custom interaciton only
                    //create response
                    this.createResponse({
                        baseType : manifest.response.baseType,
                        cardinality : manifest.response.cardinality
                    });
                }else{
                    //the attribute is mendatory for info control
                    this.attr('title', manifest.label);
                }

                //set markup
                this.markup = this.renderMarkup();

                //set pci namespace to item
                this.getNamespace();

                //after create
                if(_.isFunction(creator.afterCreate)){
                    return creator.afterCreate(this);
                }
            },
            renderMarkup : function(){

                var creator = registry.getCreator(this.typeIdentifier),
                    markupTpl = creator.getMarkupTemplate(),
                    markupData = this.getDefaultMarkupTemplateData();

                if(_.isFunction(creator.getMarkupData)){
                    //extends the default data with the custom one
                    markupData = creator.getMarkupData(this, markupData);
                }

                return markupTpl(markupData);
            },
            updateMarkup : function(){
                this.markup = this.renderMarkup();
            }
        };
    }

    return {
        getDefaultMethods : getDefaultMethods
    };
});
