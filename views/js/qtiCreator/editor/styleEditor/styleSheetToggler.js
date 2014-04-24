define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'i18n'
], function ($, styleEditor, __) {
    'use strict'

    var styleSheetToggler = (function () {

        var init = function() {

            var cssToggler = $('#style-sheet-toggler'),
                uploader = $('stylesheet-uploader'),
                getContext = function(icon) {
                    icon = $(icon);
                    var li = icon.parent(),
                        cssUri = li.data('css-res'),
                        isDisabled = li.find('.icon-preview').hasClass('disabled'),
                        isCustomCss = !!li.data('custom-css');

                    return {
                        icon: icon,
                        li: li,
                        cssUri: cssUri,
                        isCustomCss: isCustomCss,
                        isDisabled: isDisabled
                    }

                };

            // disable the custom style element
            if(!styleEditor.hasStyle()) {
                cssToggler.find('[data-custom-css]').addClass('not-available');
            }


            /**
             * Delete existing style sheet resp. custom styles
             */
            cssToggler.find('span.icon-bin').on('click', function() {
                var context = getContext(this),
                    attr = context.isDisabled ? 'disabled-href' : 'href';

                if(confirm(__('Are you sure you want to delete this stylesheet?\nWarning: This action cannot be undone!'))) {
                    if(context.isCustomCss) {
                        styleEditor.erase(false);
                    }
                    else {
                        $('link[' + attr + '$="' + context.cssUri + '"]').remove();
                        context.li.remove();
                    }
                }
            });




            /**
             * Dis/enable style sheets
             */
            cssToggler.find('span.icon-preview').on('click', function() {
                var context = getContext(this),
                    link,
                    attrTo = 'disabled-href',
                    attrFrom = 'href';

                // custom styles are handled in a style element, not in a link
                if(context.isCustomCss) {
                    if(context.isDisabled) {
                        styleEditor.create(true);
                    }
                    else {
                        styleEditor.erase(true);
                    }
                }
                // all other styles are handled via their link element
                else {
                    if(context.isDisabled) {
                        attrTo = 'href';
                        attrFrom = 'disabled-href';
                    }

                    link = $('link[' + attrFrom + '$="' + context.cssUri + '"]');
                    link.attr(attrTo, link.attr(attrFrom)).removeAttr(attrFrom);
                }

                // add some visual feed back to the triggers
                context.icon.toggleClass('disabled');
            });
        };

        return {
            init: init
        }

    })();

    return styleSheetToggler;
});

