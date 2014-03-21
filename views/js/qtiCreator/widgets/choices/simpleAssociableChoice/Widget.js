define([
    'taoQtiItem/qtiCreator/widgets/choices/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/simpleAssociableChoice/states/states'
], function(Widget, states){

    var SimpleAssociableChoiceWidget = Widget.clone();

    SimpleAssociableChoiceWidget.initCreator = function(){
        
        Widget.initCreator.call(this);

        this.registerStates(states);
    };

    return SimpleAssociableChoiceWidget;
});