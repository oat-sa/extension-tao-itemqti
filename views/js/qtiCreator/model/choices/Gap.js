define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/choices/Gap'
], function(editable, Gap){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
               required : false
            };
        }
    });
    return Gap.extend(methods);
});


