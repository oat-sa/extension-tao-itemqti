define(['lodash', 'taoQtiItem/qtiCreator/core/model/mixin/editable', 'taoQtiItem/qtiItem/core/variables/OutcomeDeclaration'], function(_, editable, OutcomeDeclaration){
    var methods = {};
    _.extend(methods, editable);
    return OutcomeDeclaration.extend(methods);
});
