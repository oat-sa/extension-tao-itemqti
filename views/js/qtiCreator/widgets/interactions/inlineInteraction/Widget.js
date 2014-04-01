define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget'
], function($, Widget){

    var InlineInteractionWidget = Widget.clone();

//    InlineInteractionWidget.initCreator = function(){
//
//        //remove the data attributes, so the widget won't no longer target it accidentaly
////        this.$original.removeAttr('data-serial data-identifier');
//
//        //exec init method
//        Widget.initCreator.call(this);
//    };
//
//    InlineInteractionWidget.destroy = function(){
//
//        if(this.element){
//            this.$original.attr({
//                'data-serial' : this.element.getSerial(),
//                'data-identifier' : this.element.id()
//            });
//        }
//
//        Widget.destroy.call(this);
//    };

    return InlineInteractionWidget;
});