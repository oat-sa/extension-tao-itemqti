define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Choice',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/Choice'
], function(stateFactory, Choice, SimpleAssociableChoice){

    var GapTextStateChoice = stateFactory.extend(Choice);

    GapTextStateChoice.prototype.initForm = function(){
        SimpleAssociableChoice.prototype.initForm.call(this);
    };

    return GapTextStateChoice;
});