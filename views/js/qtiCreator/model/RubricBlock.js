define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/RubricBlock'
], function(editable, RubricBlock){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                'view' : ['candidate'],
                'use' : ''
            };
        }
    });
    return RubricBlock.extend(methods);
});


