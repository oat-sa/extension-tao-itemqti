define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Img'
], function(editable, Img){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                src : '',
                alt : ''
            };
        },
        afterCreate : function(){
            this.data('responsive', true);
        }
    });
    return Img.extend(methods);
});