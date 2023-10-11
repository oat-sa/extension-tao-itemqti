define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/choices/GapText'
], function(editable, Choice){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                fixed : false,
                matchMax : 1,
                matchMin : 0
            };
        }
    });
    return Choice.extend(methods);
});


