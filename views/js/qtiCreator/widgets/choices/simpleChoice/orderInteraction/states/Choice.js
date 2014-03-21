define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/choiceInteraction/states/Choice'
], function(stateFactory, Choice){
    
    //@todo merge both simpleChoices together
    var SimpleChoiceStateChoice = stateFactory.clone(Choice);
    
    return SimpleChoiceStateChoice;
});