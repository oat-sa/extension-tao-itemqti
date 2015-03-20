define([
    'jquery',
    'tpl!taoQtiItem/qtiCreator/editor/elementSelector/tpl/popup'
], function($, popupTpl){

    function init(options){

        var $anchor = options.attachTo;
        var $container = options.container;
        var positions = computePosition($anchor, $container);
        var $element = $(popupTpl({
            popup : positions.popup,
            arrow : positions.arrow
        }));

        //only one 
        $anchor.find('.contextual-popup').remove();

        //style and attach the form
        $anchor.append($element);

        //add popup content
        $element.append('stuffing');
    }
    
    function computePosition($anchor, $container){
        
        var popupWidth = 500;
        var arrowWidth = 6;
        var marginTop = 10;
        var marginLeft = 15;
        var _anchor = {top : $anchor.offset().top, left : $anchor.offset().left, w : $anchor.innerWidth(), h : $anchor.innerHeight()};
        var _container = {top : $container.offset().top, left : $container.offset().left, w : $container.innerWidth()};
        var _popup = {
            top : _anchor.h + marginTop,
            left : -popupWidth / 2,
            w : popupWidth
        };

        var offset = _anchor.left - _container.left;
        //do we have enough space on the left ?
        if(offset + marginLeft < _popup.w / 2){
            _popup.left = -offset + marginLeft;
        }else if(_container.w - (offset + _anchor.w + marginLeft) < _popup.w / 2){
            _popup.left = -offset + _container.w - marginLeft - _popup.w;
        }
        
        var _arrow = {
            left : -_popup.left + _anchor.w / 2 - arrowWidth,
            leftCover : -_popup.left + _anchor.w / 2 - arrowWidth - 6
        };
        
        return {
            popup : _popup,
            arrow : _arrow
        };
    }
    
    return {
        init : init
    };
});