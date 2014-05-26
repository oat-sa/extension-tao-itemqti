define([
    'lodash', 
    'taoQtiItem/qtiCreator/model/mixin/editable', 
    'taoQtiItem/qtiItem/core/choices/AssociableHotspot'
], function(_, editable, Choice){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
               matchMax : 0,
               matchMin : 0 
            };
        }
    });
    return Choice.extend(methods);
});


