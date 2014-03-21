define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/states/Correct'
], function(stateFactory, Correct){

    var ChoiceInteractionStateCorrect = stateFactory.create(Correct, function(){
        this.widget.$container.find('[data-edit="correct"]').show();
    }, function(){
        this.widget.$container.find('[data-edit="correct"]').hide();
    });

    return ChoiceInteractionStateCorrect;
});