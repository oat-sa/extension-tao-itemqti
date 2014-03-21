define(['lodash', 'taoQtiItemCreator/core/model/mixin/editable', 'taoQtiItem/core/choices/SimpleChoice'], function(_, editable, Choice){
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


