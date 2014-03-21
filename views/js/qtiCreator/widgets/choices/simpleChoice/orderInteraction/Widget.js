define([
    'taoQtiItem/qtiCreator/widgets/choices/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/simpleChoice/orderInteraction/states/states'
], function(Widget, states){

    var SimpleChoiceWidget = Widget.clone();

    SimpleChoiceWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
    };

    return SimpleChoiceWidget;
});