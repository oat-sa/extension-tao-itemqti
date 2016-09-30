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

    InfoControlWidget.buildContainer = function(){

        var $tool = $(this.element.data('pic').dom);
        $tool.wrap('<span class="widget-box widget-student-tool">');

        this.$container = $tool.parent();
        this.$container.css({
            display : 'inline-block',
            float : 'left'
        });
        this.$container.append($('<span class="overlay">').css({
            display : 'inline-block'
        }));
    };

    return InfoControlWidget;
});