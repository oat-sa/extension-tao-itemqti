define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/states'
], function(Widget, states){

    var ChoiceInteractionWidget = Widget.clone();

    ChoiceInteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
        
        this.$container.find('.qti-choice > .pseudo-label-box input').prop('disabled', 'disabled');
    };
    
    return ChoiceInteractionWidget;
});