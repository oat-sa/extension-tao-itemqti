define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/PrintedVariable'
], function(_, editable, PrintedVariable){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        // getDefaultAttributes : function(){
        //     return {
        //         src : '',
        //         alt : ''
        //     };
        // }
    });
    return PrintedVariable.extend(methods);
});