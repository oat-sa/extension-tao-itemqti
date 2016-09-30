define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget'
], function($, Widget) {
    'use strict';
    
    var InfoControlWidget = Widget.clone();
    
    InfoControlWidget.initCreator = function() {
        
        //note : abstract widget class must not register states
        
        Widget.initCreator.call(this);
    };

    return InfoControlWidget;
});