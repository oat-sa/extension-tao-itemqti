define([
    'taoQtiItem/qtiItem/core/Element',
    'lodash',
    'taoQtiItem/qtiItem/helper/rendererConfig'
], function(Element, _, rendererConfig){

    var Img = Element.extend({
        qtiClass : 'img',
        render : function(){

            var args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                defaultData = {};

            if(this.relatedItem && this.relatedItem.assets && this.relatedItem.assets.img && this.relatedItem.assets.img[this.attr('src')]){
                this.attr('src', this.relatedItem.assets.img[this.attr('src')]);
            }

            defaultData.attributes = {
                src : renderer.resolveUrl(this.attr('src'))
            };

            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        },
        isEmpty : function(){
            return (!this.attr('src'));
        }
    });

    return Img;
});
