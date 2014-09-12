define([
    'taoQtiItem/qtiItem/core/interactions/Interaction',
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig'
], function(Interaction, _, rendererConfig){

    var CustomInteraction = Interaction.extend({
        qtiClass : 'customInteraction',
        init : function(serial, attributes){

            this._super(serial, attributes);

            this.typeIdentifier = '';
            this.markup = '';
            this.properties = {};
            this.libraries = [];
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
                        pci : 'pci'
                    }
                };

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        toArray : function(){
            var arr = this._super();
            arr.markup = this.markup;
            arr.properties = this.properties;
            return arr;
        }
    });

    return CustomInteraction;
});

