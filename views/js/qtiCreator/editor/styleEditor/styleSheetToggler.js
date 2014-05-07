define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'i18n',
    'ui/resourcemgr'
], function ($, styleEditor, __, resourcemgr) {
    'use strict'

    var styleSheetToggler = (function () {

        var init = function() {

            var cssToggler = $('#style-sheet-toggler'),
                uploader = $('#stylesheet-uploader'),
                customCssToggler = $('[data-custom-css]'),
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


//            uploader.resourcemgr({
//                type : 'text/css',
//                create : function (e){
//
//                },
//                select : function(e, uris){
//                    var i, l = uris.length;
//                    for(i = 0; i < l; i++) {
//                        styleEditor.addStylesheet(uris[i]);
//                    }
//                }
//            });

            /**
             * Delete existing style sheet resp. custom styles
             */
            cssToggler.find('span.icon-bin').on('click', function() {
                var context = getContext(this),
                    attr = context.isDisabled ? 'disabled-href' : 'href';

                if(confirm(__('Are you sure you want to delete this stylesheet?\nWarning: This action cannot be undone!'))) {
                    styleEditor.getItem().remove();
                    $('link[' + attr + '$="' + context.cssUri + '"]').remove();
                    context.li.remove();
                }
            });


            /**
             * Modify stylesheet title (enable)
             */
            cssToggler.find('span.file-label').on('click', function() {
                var label = $(this),
                    input = label.next('.style-sheet-label-editor');
                label.hide();
                input.show();
            });


            /**
             * Modify stylesheet title (edit)
             */
            cssToggler.find('.style-sheet-label-editor').on('blur', function() {
                var input = $(this),
                    label = input.prev('.file-label'),
                    title = $.trim(input.val());

                if(!title) {
                    styleEditor.getItem().attr('title', '');
                    return false;
                }

                styleEditor.getItem().attr('title', title);
                input.hide();
                label.html(title).show();
            }).on('keydown', function(e) {
                var c = e.keyCode;
                if(c === 13) {
                    $(this).trigger('blur');
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
                        styleEditor.create();
                        customCssToggler.removeClass('not-available');
                    }
                    else {
                        styleEditor.erase();
                        customCssToggler.addClass('not-available');
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

