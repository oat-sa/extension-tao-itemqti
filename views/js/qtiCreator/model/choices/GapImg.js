/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/choices/GapImg'
], function(editable, Choice){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {

        /**
         * Set the default values for the model
         * @returns {Object} the default attributes
         */
        getDefaultAttributes : function(){
            return {
                matchMin : 0,
                matchMax : 1
            };
        }
    });
    return Choice.extend(methods);
});


