define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/states'
], function(Widget, states){

    var MediaInteractionWidget = Widget.clone();

    MediaInteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);
        
        //do some initialization, if needed
        this.functionToInitMyInteractionCreatorWidget();
    };
    
    MediaInteractionWidget.functionToInitMyInteractionCreatorWidget = function(){
        //put some code here...
    };
    
    return MediaInteractionWidget;
});