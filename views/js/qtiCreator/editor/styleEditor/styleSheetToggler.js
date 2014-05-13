define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'i18n',
    'helpers',
    'lodash',
    'ui/resourcemgr'
], function ($, styleEditor, __, helpers, _) {
    'use strict'

    var styleSheetToggler = (function () {

        var init = function (itemConfig) {

            var cssToggler = $('#style-sheet-toggler'),
                uploader = $('#stylesheet-uploader'),
                customCssToggler = $('[data-custom-css]'),
                getContext = function (trigger) {
                    trigger = $(trigger);
                    var li = trigger.closest('li'),
                        stylesheetObj = li.data('stylesheetObj');

                    return {
                        li: li,
                        isCustomCss: !!li.data('custom-css'),
                        isDisabled: li.find('.icon-preview').hasClass('disabled'),
                        stylesheetObj: stylesheetObj,
                        cssUri: stylesheetObj.attr('href')
                    }

                };


            /**
             * Upload custom stylesheets
             */
            uploader.on('click', function () {

                uploader.resourcemgr({
                    appendContainer: '#item-editor-panel',
                    root: '/',
                    browseUrl: helpers._url('files', 'ItemContent', 'taoItems'),
                    uploadUrl: helpers._url('upload', 'ItemContent', 'taoItems'),
                    deleteUrl: helpers._url('delete', 'ItemContent', 'taoItems'),
                    downloadUrl: helpers._url('download', 'ItemContent', 'taoItems'),
                    params: {
                        uri: itemConfig.uri,
                        lang: itemConfig.lang,
                        filters: 'text/css'
                    },
                    pathParam: 'path',
                    select: function (e, uris) {
                        var i, l = uris.length;
                        for (i = 0; i < l; i++) {
                            styleEditor.addStylesheet(uris[i]);
                        }
                    }
                });
            });

            /**
             * Delete existing style sheet resp. custom styles
             */
            var deleteStylesheet = function (trigger) {
                var context = getContext(trigger),
                    attr = context.isDisabled ? 'disabled-href' : 'href';

                if (confirm(__('Are you sure you want to delete this stylesheet?\nWarning: This action cannot be undone!'))) {
                    styleEditor.getItem().remove();
                    $('link[' + attr + '$="' + context.cssUri + '"]').remove();
                    context.li.remove();
                }
            };


            /**
             * Modify stylesheet title (enable)
             */
            var initLabelEditor = function (trigger) {
                var label = $(trigger),
                    input = label.next('.style-sheet-label-editor');
                label.hide();
                input.show();
            };

            /**
             * Download current stylesheet
             *
             * @param trigger
             */
            var downloadStylesheet = function(trigger) {
                styleEditor.download(getContext(trigger).cssUri);
            };

            /**
             * Modify stylesheet title (save modification)
             */
            var saveLabel = function (trigger) {
                var input = $(trigger),
                    context = getContext(trigger),
                    label = input.prev('.file-label'),
                    title = $.trim(input.val());

                if (!title) {
                    context.stylesheetObj.attr('title', '');
                    return false;
                }

                context.stylesheetObj.attr('title', title);
                input.hide();
                label.html(title).show();
            };

            /**
             * Dis/enable style sheets
             */
            var handleAvailability = function (trigger) {
                var context = getContext(trigger),
                    link,
                    attrTo = 'disabled-href',
                    attrFrom = 'href';

                // custom styles are handled in a style element, not in a link
                if (context.isCustomCss) {
                    if (context.isDisabled) {
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
                    if (context.isDisabled) {
                        attrTo = 'href';
                        attrFrom = 'disabled-href';
                    }

                    link = $('link[' + attrFrom + '$="' + context.cssUri + '"]');
                    link.attr(attrTo, link.attr(attrFrom)).removeAttr(attrFrom);
                }

                // add some visual feed back to the triggers
                $(trigger).toggleClass('disabled');
            };

            /**
             * Distribute click events
             */
            cssToggler.on('click', function (e) {
                var target = e.target,
                    className = target.className;

                // distribute click actions
                if (className.indexOf('icon-bin') > -1) {
                    deleteStylesheet(e.target);
                }
                else if (className.indexOf('file-label') > -1) {
                    initLabelEditor(e.target);
                }
                else if (className.indexOf('icon-preview') > -1) {
                    handleAvailability(e.target)
                }
                else if(className.indexOf('icon-download') > -1) {
                    downloadStylesheet(e.target);
                }
            });


            /**
             * Handle renaming on enter
             */
            cssToggler.on('keydown', 'input', function (e) {
                if (e.keyCode === 13) {
                    $(e.target).trigger('blur');
                }
            });

            /**
             * Handle renaming on blur
             */
            cssToggler.on('blur', 'input', function (e) {
                saveLabel(e.target)
            });


        };

        return {
            init: init
        }

    })();

    return styleSheetToggler;
});

