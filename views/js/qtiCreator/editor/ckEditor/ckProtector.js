define([
    'jquery',
    'i18n'
], function($, __){
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
         * @param context optional
         * @param selectorParam optional
         */
        var protect = function(context, selectorParam) {
            if(selectorParam) {
                selector = selectorParam;
            }
            context.find(selector).each(function() {
                var widget = $(this),
                    iOffset = widget.offset(),
                    iWidth = widget.outerWidth(),
                    iHeight = widget.outerHeight(),
                    iLeft = iOffset.left,
                    iTop = iOffset.top,
                    cover = $('<button class="cke-cover-up">'),
                    wrapper;

                if(widget.parent('.cke-qti-wrapper').length) {
                    return false;
                }

                // avoid empty elements since they would be killed by CKE
                // &#8203; means zero-width-space
                widget.find('*').each(function() {
                    if(!this.innerHTML) {
                        this.innerHTML = '&#8203;'
                    }
                });

                widget.wrap($('<span class="cke-qti-wrapper"/>'));
                wrapper = widget.parent();

//                // button part of wrapper
//                cover.css({
//                    width: iWidth,
//                    height: iHeight,
//                    left: 0,
//                    top: 0
//                });
//                wrapper.append(cover);

                // button part of body
                cover.css({
                    width: iWidth,
                    height: iHeight,
                    left: iLeft,
                    top: iTop
                });
                $('body').append(cover);

                wrapper.css({
                    width: iWidth,
                    height: iHeight
                });
                wrapper.attr('contenteditable', false);
                wrapper.prop('cover', cover);

                cover.attr('title', __('Click to display interaction widget'));

                cover.on('click', function() {
                    unprotect(widget);
                    $(document).trigger('removeprotection.ckprotector', { context: context, widget: widget });
                })
            });
        };

        /**
         * Protect protection
         * Global selector can be overridden by any function
         *
         * @param protectedArea optional
         */
        var unprotect = function(protectedArea) {
            protectedArea = protectedArea || $(selector);
            protectedArea.each(function() {
                var interaction = $(this),
                    wrapper = interaction.parent('.cke-qti-wrapper');

                if(wrapper.length) {
                    wrapper.prop('cover').remove();
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


