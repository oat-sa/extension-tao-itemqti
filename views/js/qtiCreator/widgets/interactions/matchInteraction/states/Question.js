define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Question'
], function(stateFactory, Question, AssociateInteractionQuestionState){

    var MatchInteractionStateQuestion = stateFactory.extend(Question);

    MatchInteractionStateQuestion.prototype.initForm = AssociateInteractionQuestionState.prototype.initForm;

    return MatchInteractionStateQuestion;
});