define(['jquery', 'store', 'jqueryui'], function ($, store) {
    'use strict'

    var base = (function () {


        var elements = {
            scope: $('#item-editor-scope'),
            toolbar: $('#item-editor-toolbar'),
            sidebars: $('.item-editor-sidebar'),
            interactionBar: $('#item-editor-interaction-bar'),
            itemWidgetBar: $('#item-editor-item-widget-bar'),
            itemBar: $('#item-editor-item-bar'),
            widgetBar: $('#item-editor-widget-bar'),
            itemPanel: $('#item-editor-panel'),
            items: $('.item-editor-item'),
            overlay: $('#item-editor-overlay'),
            widget: $(),
            block: $()
        };

        /**
         * Set sidebar and item container to the same height
         */
        var adaptColumnHeight = function() {
            var height = 0;

            elements.sidebars.add(elements.itemPanel).each(function() {
                height = Math.max($(this).height(), height);
            }).height(height);
        };
        adaptColumnHeight();

        var setActiveItem = function () {
            elements.item = $('.item-editor-item:visible');
            elements.dropArea = elements.item.find('.item-editor-drop-area');
        };

        var getActiveItem = function () {
            return elements.item;
        };
        setActiveItem();

        /**
         * Set the active widget
         * @param jWidget
         */
        var setActiveWidget = function (jWidget) {
            elements.widget = jWidget;
        };

        var getActiveWidget = function () {
            return elements.widget;
        };

        /**
         * Set the active block
         * @param jBlock
         */
        var setActiveBlock = function (jBlock) {
            elements.block = jBlock;
        };

        var getActiveBlock = function () {
            return elements.block;
        };


        var defaults = {
            width: elements.itemPanel.width() - parseInt(elements.item.css('border-left'), 10) - parseInt(elements.item.css('border-right'), 10),
            minWidth: 768,
            maxWidth: 1200
        };

        var setup = (function () {

            return {
                set: function () {
                    var setup = $.extend({}, defaults, store.get('item-editor'));
                    if (arguments.length === 1 && $.isPlainObject(arguments[0])) {
                        setup = $.extend({}, setup, arguments[0])
                    }
                    else {
                        setup[arguments[0]] = arguments[1];
                    }
                    return store.set('item-editor', setup);
                },
                getAll: function () {
                    return $.extend({}, defaults, store.get('item-editor'));
                },
                get: function (key) {
                    var setup = this.getAll();
                    return setup[key] || null;
                }
            }
        }());

        return $.extend(elements, {
            setup: setup,
            setActiveItem: setActiveItem,
            getActiveItem: getActiveItem,
            setActiveWidget: setActiveWidget,
            getActiveWidget: getActiveWidget,
            setActiveBlock: setActiveBlock,
            getActiveBlock: getActiveBlock,
            adaptColumnHeight: adaptColumnHeight
        });
    }());

    return base;
});