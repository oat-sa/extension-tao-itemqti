define([
    'taoQtiItemCreator/widgets/interactions/Widget',
    'taoQtiItemCreator/widgets/interactions/choiceInteraction/states/states'
], function(Widget, states){

    var ChoiceInteractionWidget = Widget.clone();

    ChoiceInteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
    };
    
    return ChoiceInteractionWidget;
});