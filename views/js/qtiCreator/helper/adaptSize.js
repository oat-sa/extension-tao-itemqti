define([
    'jquery',
    'lodash'
], function ($, _) {
    'use strict'


    var adaptSize = (function () {

        var height = function(elements, animate) {
            _resize(elements, { height: 0 }, animate);
        };

        var width = function(elements, animate) {
            _resize(elements, { width: 0 }, animate);
        };

        var both = function(elements, animate) {
            _resize(elements, { height: 0, width: 0 }, animate);
        };

        var _resize = function(elements, dimensions, animate) {

            var dimension;

            // elements are selector
            if(_.isString(elements)) {
                elements = $(elements);
            }


            elements.each(function () {
                var element = $(this);
                for(dimension in dimensions) {
                    // all dimensions need to be reset and freshly measured
                    element[dimension]('auto');
                }
            });

            elements.each(function () {
                var element = $(this);
                for(dimension in dimensions) {
                    dimensions[dimension] = Math.max(dimensions[dimension], element[dimension]());
                }
            });

            if(!!animate) {
                elements.animate(dimensions, 200);
            }
            else {
                elements.css(dimensions);
            }
        };

        return {
            width: width,
            height: height,
            both: both
        }

    })();
    return adaptSize;
});