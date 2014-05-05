define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/states'
], function(Widget, states){

    var MediaInteractionWidget = Widget.clone();

    MediaInteractionWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
        
        //do some initialization, if needed
        this.functionToInitMyInteractionCreatorWidget();
    };
    
    MediaInteractionWidget.functionToInitMyInteractionCreatorWidget = function(){
        //put some code here...
    };
    
    return MediaInteractionWidget;
});