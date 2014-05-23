define([
    'jquery'
], function ($) {
    'use strict';

    var sizeFinder = (function () {

        /**
         * Show elements temporarily
         *
         * @param $elements
         * @private
         */
        var _show = function ($elements) {
            var $element;

            $elements.each(function () {
                $element = $(this);
                $element.data('originalProperties', {
                    position: $element.css('position'),
                    left: $element.css('left'),
                    display: $element.css('display')
                });

                $element.css({
                    position: 'relative',
                    left: '-10000px'
                }).show();
            });
        };


        /**
         * Hide elements after size has been taken
         *
         * @param $elements
         * @private
         */
        var _hide = function ($elements) {
            var $element,
                originalProperties;

            $elements.each(function () {
                $element = $(this);
                originalProperties = $element.data('originalProperties');

                $element.css({
                    position: originalProperties.position,
                    left: originalProperties.left
                }).hide();

                $element.removeData('originalProps');
            })

        };


        /**
         * Measure the outer size of the container while all elements are displayed
         *
         * @param $element
         * @returns {{width: *, height: *}}
         * @private
         */
        var _measure = function ($element) {
            return {
                width: $element.outerWidth(),
                height: $element.outerHeight()
            }
        };


        /**
         * Return the size value, also trigger an event for convenience
         *
         * @param $container
         * @param selectors
         * @returns {{width: *, height: *}}
         */
        var measure = function ($container, selectors) {
            var children = ['img', 'video'],
                $elements = $(),
                size,
                i;

            if (selectors) {
                children = children.concat(selectors);
            }
            i = children.length;

            if (!($container instanceof $)) {
                $container = $($container);
            }

            $elements = $elements.add($container);
            while (i--) {
                $elements = $elements.add($(children[i]));
            }

            _show($elements);
            size = _measure($container);
            _hide($elements);
            $container.trigger('measured.sizeFinder', size);
            return size;
        };

        return {
            measure: measure
        };

    }());
    return sizeFinder;
});