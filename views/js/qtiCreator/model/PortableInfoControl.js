define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/editor/infoControlRegistry',
    'taoQtiItem/qtiItem/core/PortableInfoControl'
], function(_, editable, icRegistry, PortableInfoControl){

    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        getDefaultProperties : function(){

            var creator = icRegistry.getCreator(this.typeIdentifier);
            if(_.isFunction(creator.getDefaultProperties)){
                return creator.getDefaultProperties(this);
            }else{
                return {};
            }
        },
        afterCreate : function(){
            
            var typeId = this.typeIdentifier,
                creator = icRegistry.getCreator(typeId),
                manifest = icRegistry.getManifest(typeId);

            //set default markup (for initial rendering)
            creator.getMarkupTemplate();

            //set pci props
            this.properties = creator.getDefaultProperties();

            //set libs
            this.entryPoint = manifest.entryPoint;
            this.libraries = manifest.libraries;
            if(_.isArray(manifest.css)){

                //currently load css as libs (requirejs module)
                this.css = _.clone(manifest.css);

                //append stylesheets to item :
                var item = this.getRelatedItem(),
                    required = [];

                _.each(this.css, function(css){
                    if(!item.stylesheetExists(css)){
                        item.createStyleSheet(css);
                        required.push('css!' + icRegistry.getBaseUrl(typeId) + css);
                    }
                });

                if(required.length){
                    require(required);
                }
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

            var creator = icRegistry.getCreator(this.typeIdentifier),
                markupTpl = creator.getMarkupTemplate(),
                markupData = {};

            if(_.isFunction(creator.getMarkupData)){
                //overwrite the default data with the custom one
                markupData = creator.getMarkupData(this, markupData);
            }

            return markupTpl(markupData);
        },
        updateMarkup : function(){
            this.markup = this.renderMarkup();
        }
    });

    return PortableInfoControl.extend(methods);
});