define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/choices/Hottext'
], function(editable, Choice){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
               fixed : false
            };
        }
    });
    return Choice.extend(methods);
});