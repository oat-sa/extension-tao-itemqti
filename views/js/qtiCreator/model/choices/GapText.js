define([
    'lodash', 
    'taoQtiItem/qtiCreator/model/mixin/editable', 
    'taoQtiItem/qtiItem/core/choices/GapText'
], function(_, editable, Choice){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
               matchMax : 1,
               matchMin : 0 
            };
        }
    });
    return Choice.extend(methods);
});


