define([
    'lodash',
    'taoQtiItem/qtiCreator/core/model/mixin/editable',
    'taoQtiItem/qtiItem/core/ResponseProcessing'
], function(_, editable, ResponseProcessing){
    
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {};
        }
    });
    
    return ResponseProcessing.extend(methods);
});