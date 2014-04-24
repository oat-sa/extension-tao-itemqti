define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/uploadInteraction/states/states'
], function(Widget, states){

    var UploadInteractionWidget = Widget.clone();

    UploadInteractionWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);

        //do some initialization, if needed
        
    };

    return UploadInteractionWidget;
});