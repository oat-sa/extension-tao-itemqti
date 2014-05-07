define([
'taoQtiItem/qtiCreator/widgets/interactions/Widget',
'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/states/states'
], function(Widget, states){
    
    var SliderInteractionWidget = Widget.clone();
    
    SliderInteractionWidget.initCreator = function(){
        Widget.initCreator.call(this);
        this.registerStates(states);
    };
    
    return SliderInteractionWidget;
});