define([
    'taoQtiItemCreator/widgets/choices/Widget',
    'taoQtiItemCreator/widgets/choices/simpleChoice/orderInteraction/states/states'
], function(Widget, states){

    var SimpleChoiceWidget = Widget.clone();

    SimpleChoiceWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
    };

    return SimpleChoiceWidget;
});