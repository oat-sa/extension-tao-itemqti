define([
    'taoQtiItem/qtiCreator/widgets/choices/Widget',
    'taoQtiItem/qtiCreator/widgets/choices/gap/states/states'
], function(Widget, states){

    var GapWidget = Widget.clone();

    GapWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
        
    };

    return GapWidget;
});