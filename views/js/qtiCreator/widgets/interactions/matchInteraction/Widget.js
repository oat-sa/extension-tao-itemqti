define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/states/states'
], function(Widget, states){

    var MatchInteractionWidget = Widget.clone();

    MatchInteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);
        this.registerStates(states);
    };
    
    return MatchInteractionWidget;
});