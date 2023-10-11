define(['taoQtiItem/qtiCreator/model/mixin/editable', 'taoQtiItem/qtiItem/core/choices/SimpleAssociableChoice'], function(editable, Choice){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                'fixed' : false,
                'showHide' : 'show',
                'matchMax' : 0,
                'matchMin' : 0
            };
        }
    });
    return Choice.extend(methods);
});