define([
    'jquery',
    'helpers',
    'core/dataattrhandler'
], function(
    $,
    _,
    dataAttrHandler
    ){

    'use strict';


    var init = function($trigger, options) {

        var defaults = {
            top: null,     // || pixels relative to the top border of the sidebar
            right: 2       // pixels relative to the left border of the sidebar
        };

        options = _.assign(defaults, (options || {}));

        // open the popup
        var open = function($trigger, $popup) {

            var $sidebar = $popup.parents('.item-editor-sidebar-wrapper');
            var top = _.isNull(options.top) ? $trigger.offset().top - $sidebar.offset().top - ($popup.height() / 2) : options.top;
            var $popupTitle = $popup.find('.sidebar-popup-title');
            var maxHeight = parseInt($sidebar.find('.item-editor-sidebar').css('max-height'), 10) - 2;
            if($popupTitle.length) {
                maxHeight -= $popupTitle.height();
            }

            $trigger.trigger('beforeopen.popup', { popup: $popup, trigger: $trigger });
            $popup.show();


            $popup.css({
                top: Math.max($sidebar.offset().top, top),
                right: $sidebar.width() + options.right
            });

            $popup.find('.sidebar-popup-content').css({ maxHeight: maxHeight });

            $trigger.trigger('open.popup', { popup: $popup, trigger: $trigger });
        };

        // close the popup
        var close = function($trigger, $popup) {
            $trigger.trigger('beforeclose.popup', { popup: $popup, trigger: $trigger });
            $popup.hide();
            $trigger.trigger('close.popup', { popup: $popup, trigger: $trigger });
        };

        // find popup, assign basic actions, add it to trigger props
        $trigger.each(function() {
            var _trigger = $(this),
                $popup = options.popup || (function() {
                    return dataAttrHandler.getTarget('popup', _trigger);
                }()),
                $closer = $popup.find('.closer'),
                $dragger = $popup.find('.dragger');

            if(!$popup || !$popup.length) {
                throw new Error('No popup found');
            }

            // close popup by clicking on x button
            if($closer.length) {
                $closer.on('click', function() {
                    close(_trigger, $popup);
                });
            }

            // drag popup
            if($dragger.length){
                $popup.draggable({
                    handle : $dragger
                });
            }

            // assign popup to trigger to avoid future DOM operations
            _trigger.prop('popup', $popup);
        });

        // toggle popup
        $trigger.on('click', function(e) {
            var _trigger = $(e.target),
                $popup   = _trigger.prop('popup');

            // in case the trigger is an <a>
            e.preventDefault();

            // toggle popup
            if($popup.is(':visible')) {
                close(_trigger, $popup);
            }
            else {
                open(_trigger, $popup);
            }
        })
    };


    function reorderZindex() {

    }



    return {
        init: init,
        reorderZindex: reorderZindex
    };

});


