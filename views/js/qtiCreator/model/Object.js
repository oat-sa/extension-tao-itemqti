define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Object'
], function(editable, Object){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                data : '',
                type : ''
            };
        }
    });
    return Object.extend(methods);
});