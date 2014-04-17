define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor'
], function ($, styleEditor) {
    'use strict'

    var styleSheetToggler = (function () {

        var cssToggler = $('#style-sheet-toggler');

        // disable the custom style element
        if(!styleEditor.hasStyle()) {
            cssToggler.find('[data-custom-css]').addClass('not-available');
        }

        cssToggler.find('span.icon-preview').on('click', function() {
            var eye = $(this),
                li = eye.parent(),
                cssUri = li.data('css-res'),
                link,
                isDisabled = eye.hasClass('disabled'),
                attrTo = 'disabled-href',
                attrFrom = 'href',
                isCustomCss = !!li.data('custom-css');

            // custom styles are handled in a style element, not in a link
            if(isCustomCss) {
                if(isDisabled) {
                    styleEditor.create();
                    li.removeClass('not-available');
                }
                else {
                    styleEditor.erase();
                    li.addClass('not-available');
                    return false;
                }
            }
            // all other styles are handled via their link element
            else {
                if(isDisabled) {
                    attrTo = 'href';
                    attrFrom = 'disabled-href';
                }

                link = $('link[' + attrFrom + '$="' + cssUri + '"]');
                link.attr(attrTo, link.attr(attrFrom)).removeAttr(attrFrom);
            }

            // add some visual feed back to the triggers
            if(isDisabled) {
                eye.removeClass('icon-eye-slash').addClass('icon-preview');
            }
            else {
                eye.removeClass('icon-preview').addClass('icon-eye-slash');
            }
            eye.toggleClass('disabled');
            li.toggleClass('invalid-css');
        });
    })();

    return styleSheetToggler;
});

