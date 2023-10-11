define(['taoQtiItem/qtiCreator/model/mixin/editable', 'taoQtiItem/qtiItem/core/choices/SimpleChoice'], function(editable, Choice){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                'fixed' : false,
                'showHide' : 'show'
            };
        }
    });
    return Choice.extend(methods);
});


