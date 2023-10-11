define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/Stylesheet'
], function(editable, Stylesheet){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                href : 'css/tao-user-styles.css',
                title : '',
                type:'text/css',
                media:'all'
            };
        }
    });

    return Stylesheet.extend(methods);
});