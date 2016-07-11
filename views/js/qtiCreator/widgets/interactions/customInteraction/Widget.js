define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'lodash'
], function(Widget, ciRegistry, _){

    var CustomInteractionWidget = Widget.clone();

    CustomInteractionWidget.initCreator = function(){

        //note : abstract widget class must not register states

        Widget.initCreator.call(this);
    };

    CustomInteractionWidget.createToolbar = function(options){

        var creator = ciRegistry.getAuthoringData(this.element.typeIdentifier);
        options = _.defaults(options || {}, {title : creator.label});

        return Widget.createToolbar.call(this, options);
    };

    return CustomInteractionWidget;
});