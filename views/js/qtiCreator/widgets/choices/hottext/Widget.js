define([
    'taoQtiItem/qtiCreator/widgets/choices/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/hottext/states/states'
], function(Widget, states){

    var HottextWidget = Widget.clone();

    HottextWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
        
    };

    return HottextWidget;
});