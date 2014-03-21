define([
    'taoQtiItemCreator/widgets/interactions/Widget',
    'taoQtiItemCreator/widgets/interactions/associateInteraction/states/states'
], function(Widget, states){

    var AssociateInteractionWidget = Widget.clone();

    AssociateInteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
    };
    
    return AssociateInteractionWidget;
});