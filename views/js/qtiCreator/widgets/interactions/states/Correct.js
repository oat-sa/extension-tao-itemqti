define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct'
], function(stateFactory, Correct){

    var ChoiceInteractionStateCorrect = stateFactory.create(Correct, function(){
        this.widget.$container.find('[data-edit="correct"]').show();
    }, function(){
        this.widget.$container.find('[data-edit="correct"]').hide();
    });

    return ChoiceInteractionStateCorrect;
});