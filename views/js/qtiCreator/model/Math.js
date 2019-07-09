define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Math'
], function(_, editable, MathModel){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {};
        },
        afterCreate : function(){
            this.getNamespace();
        }
    });
    return MathModel.extend(methods);
});
