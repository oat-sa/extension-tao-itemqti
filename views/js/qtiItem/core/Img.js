define(['taoQtiItem/qtiItem/core/Element', 'lodash', 'taoQtiItem/qtiItem/helper/rendererConfig'], function(Element, _, rendererConfig){
    
    var Img = Element.extend({
        qtiClass : 'img',
        render : function(){
            
            var args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer||this.getRenderer(),
                defaultData = {},
                baseUrl = renderer.getOption('baseUrl')||'',
                src = this.attr('src');
            
            if(!src.match(/^http/i)){
                defaultData.attributes = {src : baseUrl + src};
            }
            
            return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
        }
    });
    
    return Img;
});
