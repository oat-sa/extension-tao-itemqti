/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'uri',
    'util/url',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/model/Stylesheet',
    'tpl!taoQtiItem/qtiCreator/tpl/notifications/genericFeedbackPopup',
    'ui/dialog/confirm',
    'ui/resourcemgr',
    'jquery.fileDownload'
], function ($, _, __, uri, urlUtil, styleEditor, Stylesheet, genericFeedbackPopup, confirmDialog) {
    'use strict';

    var $doc = $(document);
    var MEDIA_MANAGER_PREFIX = 'taomedia://mediamanager/';
    var normalizeMime = function (mime) {
        return String(mime || '').split(';')[0].trim().toLowerCase();
    };

    var styleSheetToggler = (function () {
        var init = function (itemConfig) {
            const _createInfoBox = function (data) {
                var $messageBox = $(genericFeedbackPopup(data)),
                    closeTrigger = $messageBox.find('.close-trigger');

                $('body').append($messageBox);

                closeTrigger.on('click', function () {
                    $messageBox.fadeOut(function () {
                        $(this).remove();
                    });
                });

                setTimeout(function () {
                    closeTrigger.trigger('click');
                }, 4000);

                return $messageBox;
            };

            var cssToggler = $('#style-sheet-toggler'),
                uploader = $('#stylesheet-uploader'),
                customCssToggler = $('[data-custom-css]'),
                getContext = function (trigger) {
                    trigger = $(trigger);
                    const li = trigger.closest('li');
                    const stylesheetObj = li.data('stylesheetObj') || new Stylesheet({ href: li.data('css-res') });
                    const input = li.find('.style-sheet-label-editor');
                    const labelBox = input.prev('.file-label');
                    const label = input.val();

                    return {
                        li: li,
                        input: input,
                        label: label,
                        labelBox: labelBox,
                        isCustomCss: !!li.data('custom-css'),
                        isDisabled: li.find('.icon-preview').hasClass('disabled'),
                        stylesheetObj: stylesheetObj,
                        cssUri: stylesheetObj.attr('href')
                    };
                };

            /**
             * Upload custom stylesheets
             */
            uploader.on('click', function () {
                uploader.resourcemgr({
                    className: 'stylesheets',
                    appendContainer: '#mediaManager',
                    mediaSourcesUrl: itemConfig.mediaSourcesUrl,
                    searchUrl: itemConfig.searchUrl,
                    hideCriteria: true,
                    browseUrl: itemConfig.getFilesUrl,
                    uploadUrl: itemConfig.fileUploadUrl,
                    deleteUrl: itemConfig.fileDeleteUrl,
                    downloadUrl: itemConfig.fileDownloadUrl,
                    fileExistsUrl: itemConfig.fileExistsUrl,
                    params: {
                        uri: itemConfig.uri,
                        lang: itemConfig.lang,
                        filters: 'text/css'
                    },
                    pathParam: 'path',
                    select(e, files) {
                        const l = files.length;
                        for (let i = 0; i < l; i++) {
                            if (normalizeMime(files[i].mime) !== 'text/css') {
                                _createInfoBox({
                                    message: __('Only CSS stylesheets can be added to the item.'),
                                    type: 'error'
                                });
                                continue;
                            }
                            styleEditor.addStylesheet(files[i].file);
                        }
                    },
                    hooks: {
                        deleteFile(file) {
                            const cssRes = String(file).replace(/^\/+/, '');
                            const $style = $('#style-sheet-toggler')
                                .find('[data-css-res]')
                                .filter(function () {
                                    return String($(this).attr('data-css-res')).replace(/^\/+/, '') === cssRes;
                                });

                            if (file.startsWith(MEDIA_MANAGER_PREFIX)) {
                                if (!$style.length) {
                                    const assetUri = uri.decode(String(file).slice(MEDIA_MANAGER_PREFIX.length));

                                    return new Promise((resolve, reject) => {
                                        $.getJSON(urlUtil.route('index', 'ResourceRelations', 'tao'), {
                                            type: 'media',
                                            sourceId: assetUri
                                        })
                                            .done(response => {
                                                const relations = response && response.data && response.data.relations;
                                                const count = relations ? relations.length : 0;

                                                if (count > 0) {
                                                    confirmDialog(
                                                        __(
                                                            'This stylesheet is used in %s item(s). Remove it from those items before deleting it.'
                                                        ).replace('%s', count),
                                                        () => reject(),
                                                        () => reject()
                                                    );
                                                } else {
                                                    resolve();
                                                }
                                            })
                                            .fail(() => resolve());
                                    });
                                }

                                return new Promise((resolve, reject) => {
                                    confirmDialog(
                                        __(
                                            'This stylesheet is stored in the Media Library. Removing it from the item only removes the association, the file stays in the library. The item will be automatically saved after the removal, continue?'
                                        ),
                                        () => {
                                            deleteStylesheet($style);

                                            $('#item-editor-panel')
                                                .trigger('beforesave.qti-creator')
                                                .trigger('save.qti-creator');
                                            reject();
                                        },
                                        () => reject()
                                    );
                                });
                            }

                            if ($style.length) {
                                return new Promise((resolve, reject) => {
                                    confirmDialog(
                                        __(
                                            'As this stylesheet is attached to the item, the item will be automatically saved after the deletion, continue?'
                                        ),
                                        () => {
                                            $('#mediaManager').one('filedelete.resourcemgr', () => {
                                                deleteStylesheet($style);

                                                $('#item-editor-panel')
                                                    .trigger('beforesave.qti-creator')
                                                    .trigger('save.qti-creator');
                                            });
                                            resolve();
                                        },
                                        reject
                                    );
                                });
                            }
                        }
                    }
                });
            });

            /**
             * Confirm to save the item
             * @param {Object} trigger
             */
            const deleteStylesheet = function (trigger) {
                var context = getContext(trigger),
                    attr = context.isDisabled ? 'disabled-href' : 'href',
                    cssLinks = $('head link');

                styleEditor.getItem().removeStyleSheet(context.stylesheetObj);

                cssLinks.filter(`[${attr}*="${context.cssUri}"]`).remove();
                context.li.remove();

                $('.feedback-info').hide();
                _createInfoBox({
                    message: __('Style Sheet <b>%s</b> removed<br> Click <i>Add Style Sheet</i> to re-apply.').replace(
                        '%s',
                        context.label
                    ),
                    type: 'info'
                });

                $doc.trigger('customcssloaded.styleeditor', [styleEditor.getStyle()]);
            };

            /**
             * Modify stylesheet title (enable)
             * @param {Object} trigger
             */
            const initLabelEditor = function (trigger) {
                var context = getContext(trigger);
                context.labelBox.hide();
                context.input.show();
            };

            /**
             * Download current stylesheet
             *
             * @param {Object} trigger
             */
            const downloadStylesheet = function (trigger) {
                const context = getContext(trigger);
                const cssUri = context.cssUri;

                if (cssUri.startsWith(MEDIA_MANAGER_PREFIX)) {
                    const assetUri = uri.decode(cssUri.substring(MEDIA_MANAGER_PREFIX.length));
                    const route = urlUtil.route('getFile', 'MediaManager', 'taoMediaManager', { uri: assetUri });
                    const label = String(context.label || '').trim();
                    const fileName = label
                        ? /\.css$/i.test(label)
                            ? label
                            : `${label}.css`
                        : 'stylesheet.css';

                    fetch(route, { credentials: 'same-origin' })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(String(response.status));
                            }
                            return response.blob();
                        })
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            URL.revokeObjectURL(url);
                        })
                        .catch(() => {
                            _createInfoBox({
                                message: __('There was a problem downloading your CSS, please try again.'),
                                type: 'error'
                            });
                        });
                    return;
                }

                styleEditor.download(cssUri);
            };

            /**
             * Modify stylesheet title (save modification)
             * @param {Object} trigger
             * @returns {Boolean}
             */
            const saveLabel = function (trigger) {
                var context = getContext(trigger),
                    title = $.trim(context.input.val());

                if (!title) {
                    context.stylesheetObj.attr('title', '');
                    return false;
                }

                context.stylesheetObj.attr('title', title);
                context.input.hide();
                context.labelBox.html(title).show();
            };

            /**
             * Dis/enable style sheets
             * @param {Object} trigger
             */
            const handleAvailability = function (trigger) {
                const context = getContext(trigger);

                // custom styles are handled in a style element, not in a link
                if (context.isCustomCss || !context.label) {
                    if (context.isDisabled) {
                        $('#item-editor-user-styles')[0].disabled = false;
                        customCssToggler.removeClass('not-available');
                    } else {
                        $('#item-editor-user-styles')[0].disabled = true;
                        customCssToggler.addClass('not-available');
                    }
                } else {
                    // all other styles are handled via their link element
                    const linkDom = Object.values(document.styleSheets).find(
                        sheet => typeof sheet.href === 'string' && sheet.href.includes(context.label)
                    );
                    if (context.isDisabled) {
                        linkDom.disabled = false;
                    } else {
                        linkDom.disabled = true;
                    }
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
                } else if (className.indexOf('file-label') > -1) {
                    initLabelEditor(e.target);
                } else if (className.indexOf('icon-preview') > -1) {
                    handleAvailability(e.target);
                } else if (className.indexOf('icon-download') > -1) {
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
                saveLabel(e.target);
            });
        };

        return {
            init: init
        };
    })();

    return styleSheetToggler;
});
