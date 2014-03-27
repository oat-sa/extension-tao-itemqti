define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/dtdHandler'
], function ($, _, dtdHandler) {
    'use strict'

    /**
     * Extends taoQtiItem/qtiCreator/editor/dtdHandler
     * to retrieve a collection of jQuery elements within a given context
     */
    var targetFinder = (function ($, _, dh) {

        /**
         * Inherit functions from parent class
         */
        var inheritedFunctions = (function () {
            var fns = {}, fn;
            for (fn in dh) {
                if (!dh.hasOwnProperty(fn)) {
                    continue;
                }
                if (!(dh[fn] instanceof Function)) {
                    continue;
                }
                fns[fn] = dh[fn];
            }
            return fns;
        }());

        /**
         * Find potential targets within a given context
         *
         * @param child
         * @param context (string|DOM element|jQuery element), defaults to document.body
         * @returns {*}
         */
        var getTargetsFor = function (child, context) {
            var parentSelector = dh.getParentsOf(child).join(',');
            context = context || document.body;
            context = $(context);
            return context.find(parentSelector).not('[data-edit],[data-edit] *');
        };

        /**
         * return both parent and own functions
         */
        return _.extend(inheritedFunctions, {
            getTargetsFor: getTargetsFor
        });

    }(jQuery, _, dtdHandler));

    return targetFinder;
});

