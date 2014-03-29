define(['taoQtiItem/qtiItem/core/Element', 'lodash'], function(Element, _){
    
    var QtiObject = Element.extend({
        qtiClass : 'object',
        getMediaType : function(){
            var type = 'undefined';
            var mimetype = this.attr('type');
            if(mimetype !== ''){
                if(mimetype.indexOf('video') === 0){
                    type = 'video';
                }else if(mimetype.indexOf('audio') === 0){
                    type = 'audio';
                }else if(mimetype.indexOf('image') === 0){
                    type = 'image';
                }else{
                    type = 'object';
                }
            }
            return type;
        },
        render : function(data, $container, subclass, renderer){
            
            renderer = renderer||this.getRenderer();
            
            var defaultData = {};

            switch(this.getMediaType()){
                case 'video':
                    defaultData.video = true;
                    break;
                case 'audio':
                    defaultData.audio = true;
                    break;
                case 'image':
                default:
                    defaultData.object = true;
            }
            
            return this._super(_.merge(defaultData, data || {}), $container, subclass, renderer);
        }
    });
    
    return QtiObject;
});
