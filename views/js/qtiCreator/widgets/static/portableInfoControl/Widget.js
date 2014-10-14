define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/portableInfoControl/states/states'
], function(Widget, states) {
    
    var InfoControlWidget = Widget.clone();
    
    InfoControlWidget.initCreator = function() {
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return InfoControlWidget;
});