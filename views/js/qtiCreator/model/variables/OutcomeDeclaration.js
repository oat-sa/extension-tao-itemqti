define(['taoQtiItem/qtiCreator/model/mixin/editable', 'taoQtiItem/qtiItem/core/variables/OutcomeDeclaration'], function(editable, OutcomeDeclaration){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    return OutcomeDeclaration.extend(methods);
});
