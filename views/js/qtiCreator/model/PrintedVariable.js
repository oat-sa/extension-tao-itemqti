define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/PrintedVariable'
], function(_, editable, PrintedVariable){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                format:           '%2g',
                powerForm:        false,
                base:             10,
                index:            -1,
                delimiter:        ';',
                field:            '',
                mappingIndicator: '='
            };
        }
    });
    return PrintedVariable.extend(methods);
});