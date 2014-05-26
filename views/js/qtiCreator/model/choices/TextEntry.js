define(['lodash', 'taoQtiItem/qtiCreator/model/mixin/editable', 'taoQtiItem/qtiItem/core/choices/TextEntry'], function(_, editable, Choice){
    debugger;
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                'fixed' : false,
                'showHide' : 'show'
            };
        }
    });
    return Choice.extend(methods);
});