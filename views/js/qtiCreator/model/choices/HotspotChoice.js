define(['lodash', 'taoQtiItem/qtiCreator/model/mixin/editable', 'taoQtiItem/qtiItem/core/choices/HotspotChoice'], function(_, editable, Choice){
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            console.log("model/c/h", 'getDefaultAttributes');
            return {
                'fixed' : false,
                'showHide' : 'show'
            };
        }
    });
    return Choice.extend(methods);
});


