/**
 * Attach WProofreader to Text Entry authoring inputs that appear after the bundle's initial autoSearch
 * (e.g. correct-response row shown only in edit-correct, map rows appended dynamically).
 */
define(['jquery', 'tao/ckeditor/wproofreaderBootstrap'], function ($, wproofreaderBootstrap) {
    'use strict';

    var INIT_ATTR = 'data-tao-wsc-text-entry-init';

    /**
     * @param {JQuery|HTMLElement} $root
     * @returns {void}
     */
    function attachInScope($root) {
        if (!wproofreaderBootstrap.enabled || !$root || !$root.length) {
            return;
        }

        wproofreaderBootstrap.whenReady().then(function () {
            $root
                .find('input.text-entry-authoring-spellcheck')
                .filter(':visible')
                .each(function () {
                    var el = this;

                    if (el.getAttribute(INIT_ATTR) === '1') {
                        return;
                    }

                    wproofreaderBootstrap.initContainer(el);
                    el.setAttribute(INIT_ATTR, '1');
                });
        });
    }

    return {
        attachInScope: attachInScope
    };
});
