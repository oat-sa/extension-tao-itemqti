define([
    'taoQtiItem/qtiItem/core/interactions/Interaction',
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig'
], function(Interaction, _, rendererConfig){
    
    var CustomInteraction = Interaction.extend({
        qtiClass : 'customInteraction',
        defaultNsName : 'pci',
        defaultNsUri : 'http://www.imsglobal.org/xsd/portableCustomInteraction',
        init : function(serial, attributes){

            this._super(serial, attributes);

            this.typeIdentifier = '';
            this.markup = '';
            this.properties = {};
            this.libraries = [];
            this.markupNs = {
                name : 'html5',
                uri : ''
            };
            //note : if the uri is defined, it will be set the uri in the xml on xml serialization,
            //which may trigger xsd validation, which is troublesome for html5 (use xhtml5 maybe ?)
        },
        is : function(qtiClass){
            return (qtiClass === 'customInteraction') || this._super(qtiClass);
        },
        render : function(){

            var args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                defaultData = {
                    typeIdentifier : this.typeIdentifier,
                    markup : this.markup,
                    properties : this.properties,
                    libraries : this.libraries,
                    ns : {
                        pci : 'pci:'
                    }
                };

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        toArray : function(){
            var arr = this._super();
            arr.markup = this.markup;
            arr.properties = this.properties;
            return arr;
        },
        prop : function(name, value){
            if(name){
                if(value !== undefined){
                    this.properties[name] = value;
                }else{
                    if(typeof(name) === 'object'){
                        for(var prop in name){
                            this.prop(prop, name[prop]);
                        }
                    }else if(typeof(name) === 'string'){
                        if(this.properties[name] === undefined){
                            return undefined;
                        }else{
                            return this.properties[name];
                        }
                    }
                }
            }
            return this;
        },
        removeProp : function(propNames){
            var _this = this;
            if(typeof(propNames) === 'string'){
                propNames = [propNames];
            }
            _.each(propNames, function(propName){
                delete _this.attributes[propName];
            });
            return this;
        },
        getNamespace : function(){

            if(this.ns && this.ns.name && this.ns.uri){
                return _.clone(this.ns);
            }else{
                
                var relatedItem = this.getRelatedItem();
                if(relatedItem){
                    var namespaces = relatedItem.getNamespaces();
                    for(ns in namespaces){
                        if(namespaces[ns].indexOf('portableCustomInteraction') > 0){
                            return {
                                name : ns,
                                uri : namespaces[ns]
                            };
                        }
                    }
                    //if no ns found in the item, set the default one!
                    relatedItem.namespaces[this.defaultNsName] = this.defaultNsUri;
                    return {
                        name : this.defaultNsName,
                        uri : this.defaultNsUri
                    };
                }
            }

            return {};
        },
        setNamespace : function(name, uri){
            this.ns = {
                name : name,
                uri : uri
            };
        }
    });

    return CustomInteraction;
});

