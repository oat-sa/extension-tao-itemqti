define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Img'
], function(_, editable, Img){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                src : '',
                alt : '',
                width: '100%'
            };
        },
        afterCreate : function(){
            this.data('responsive', true);
        }
    });
    return Img.extend(methods);
});