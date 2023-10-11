define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/portableElementRegistry/ciRegistry'
], function(Widget, ciRegistry){

    var CustomInteractionWidget = Widget.clone();

    CustomInteractionWidget.initCreator = function(){

        //note : abstract widget class must not register states

        Widget.initCreator.call(this);
    };

    CustomInteractionWidget.createToolbar = function(options){

        var creator = ciRegistry.getAuthoringData(this.element.typeIdentifier);
        options = Object.assign({ title: creator.label }, options || {});

        return Widget.createToolbar.call(this, options);
    };

    return CustomInteractionWidget;
});