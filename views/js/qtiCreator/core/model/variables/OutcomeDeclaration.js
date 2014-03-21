define(['lodash', 'taoQtiItemCreator/core/model/mixin/editable', 'taoQtiItem/core/variables/OutcomeDeclaration'], function(_, editable, OutcomeDeclaration){
    var methods = {};
    _.extend(methods, editable);
    return OutcomeDeclaration.extend(methods);
});
