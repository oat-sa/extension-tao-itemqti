define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Include'
], function(editable, Include){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        afterCreate : function(){
            this.getNamespace();
        }
    });
    return Include.extend(methods);
});