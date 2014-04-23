define([
    'jquery'
], function($){
    'use strict'

    /**
     * Protect / unprotect an element to avoid edition by CK EDITOR
     *
     * @returns {{protect: protect, init: init, unprotect: unprotect}}
     */
    var ckeProtector = (function() {

        var selector = '.widget-box';

        /**
         * Retrieve selector from the outside
         *
         * @returns {string}
         */
        var getSelector = function() {
            return selector;
        };

        /**
         * Protect elements from being edited by CKeditor.
         * Global selector can be overridden by any function
         *
         * @param selectorParam optional
         */
        var protect = function(selectorParam) {
            if(selectorParam) {
                selector = selectorParam;
            }
            $(selector).each(function() {
                var interaction = $(this),
                    cover = $('<button class="cke-cover-up">'),
                    wrapper;

                if(interaction.parent('.cke-qti-wrapper').length) {
                    return false;
                }

                interaction.wrap($('<span class="cke-qti-wrapper"/>'));
                wrapper = interaction.parent();
                wrapper.append(cover);

                wrapper.width(interaction.outerWidth());
                wrapper.height(interaction.outerHeight());
                wrapper.attr('contenteditable', false);

                cover.on('mousedown', function() {
                    this.blur();
                    return false;
                });
            });
        };

        /**
         * Protect protection
         * Global selector can be overridden by any function
         *
         * @param selectorParam optional
         */
        var unprotect = function(selectorParam) {
            if(selectorParam) {
                selector = selectorParam;
            }
            $(selector).each(function() {
                var interaction = $(this),
                    wrapper = interaction.parent('.cke-qti-wrapper');

                if(wrapper.length) {
                    wrapper.find('button.cke-cover-up').remove();
                    interaction.unwrap();
                }
            });
        };

        return {
            protect: protect,
            unprotect: unprotect,
            getSelector: getSelector
        }
    }());
    return ckeProtector;
});


