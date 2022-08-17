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
 * Copyright (c) 2015-2021 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 *
 * @author dieter <dieter@taotesting.com>
 */

define([
    'jquery',
    'lodash',
    'i18n',
    'util/urlParser',
    'core/promise',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/cssToggler',
    'jquery.fileDownload'
], function ($, _, __, UrlParser, Promise, cssTpl) {
    'use strict';

    let itemConfig;

    /**
     * qtiItemCreator config provided from QtiCreator
     * used for generation of the ajax uri
     */
    let globalConfig;

    /**
     * generate Ajax URI
     * @param {String} action
     * @returns {*}
     */
    const _getUri = function (action) {
        return globalConfig[`${action}CssUrl`];
    };

    /**
     * Extract the file name from a path
     * @param {String} path
     * @returns {*}
     * @private
     */
    const _basename = function (path) {
        return path.substring(path.lastIndexOf('/') + 1);
    };

    // stylesheet as object
    let style = {};
    // DOM element to hold the style
    const $styleElem = (function () {
        let styleElem = $('#item-editor-user-styles');
        if (!styleElem.length) {
            styleElem = $('<style>', { id: 'item-editor-user-styles' });
            $('head').append(styleElem);
        } else {
            styleElem.empty();
        }
        return styleElem;
    })();
    let currentItem;
    const common = {
        title: __('Disable this stylesheet temporarily'),
        deleteTxt: __('Remove this stylesheet'),
        editLabelTxt: __('Edit stylesheet label'),
        downloadTxt: __('Download this stylesheet'),
        preparingMessageHtml: __('Preparing CSS, please wait…'),
        failMessageHtml: __('There was a problem downloading your CSS, please try again.'),
        isInValidLocalTxt: __('This stylesheet has not been found on the server. you may want to delete this reference')
    };
    let customStylesheet = null;
    const customStylesheetHref = 'style/custom/tao-user-styles.css';

    /**
     * Delete all custom styles
     * @returns {Boolean}
     */
    const erase = function () {
        style = {};
        $styleElem.text('');
        return false;
    };

    /**
     * Create CSS and add it to DOM
     *
     * @param {Boolean} dontAppend whether or not to append the stylesheet to the DOM. This is used by the iframe preview
     * @returns {String}
     */
    const create = function (dontAppend) {
        let key1, // first level key, could be selector or media query
            key2, // second level key, could be css property or selector
            mSelector, // selector inside a media query
            mProp, // property inside a media query
            css = '';

        if (_.isEmpty(style)) {
            return erase();
        }

        // rebuild CSS
        for (key1 in style) {
            if (!Object.prototype.hasOwnProperty.call(style, key1)) {
                continue;
            }

            css += `${key1}{`;
            for (key2 in style[key1]) {
                if (!Object.prototype.hasOwnProperty.call(style[key1], key2)) {
                    continue;
                }
                // in the case of a surrounding media query
                if (_.isPlainObject(style[key1][key2])) {
                    for (mSelector in style[key1][key2]) {
                        css += `${key2}{`;
                        for (mProp in style[key1][key2]) {
                            css += `${mProp}:${style[key1][key2][mSelector]};`;
                        }
                        css += '}';
                    }
                } else { // regular selectors
                    css += `${key2}:${style[key1][key2]};`;
                }
            }
            css += '}\n';
        }

        if (!dontAppend) {
            $styleElem.text(css);
        }
        return css;
    };

    /**
     * Apply rule to CSS
     *
     * @param {{string}} selector
     * @param {{string}} property
     * @param {{string}} value
     */
    const apply = function (selector, property, value) {
        style[selector] = style[selector] || {};

        // delete this rule
        if (!value) {
            delete style[selector][property];
            if (_.size(style[selector]) === 0) {
                delete style[selector];
            }
        } else { // add this rule
            style[selector][property] = value;
        }

        // apply rule
        create();

        /**
         * Fires a change notification on the item style
         * @event taoQtiItem/qtiCreator/editor/styleEditor/styleEditor#stylechange.qti-creator
         * @property {Object} [detail] An object providing some additional detail on the event
         * @property {Boolean} [detail.initializing] Tells if the stylechange occurs at init time
         */
        $(document).trigger('stylechange.qti-creator');
    };

    /**
     * Has the class been initialized
     *
     * @returns {boolean}
     */
    const verifyInit = function verifyInit() {
        if (!itemConfig) {
            throw new Error('Missing itemConfig, did you call styleEditor.init()?');
        }
        return true;
    };

    /**
     * Save the resulting CSS to a file
     *TODO saving mechanism should be indenpendant, ie. moved into the itemCreator, in order to configure endpoint, etc.
     * @returns {Promise}
     */
    const save = function save() {
        return new Promise(function (resolve, reject) {
            verifyInit();
            const isStyles = _.size(style) > 0;
            if (!isStyles && !customStylesheet) {
                return resolve();
            }
            if (isStyles && !customStylesheet) {
                customStylesheet = currentItem.createStyleSheet(customStylesheetHref);
            }
            if (!isStyles && customStylesheet) {
                currentItem.removeStyleSheet(customStylesheet);
                customStylesheet = null;
            }
            $.post(
                _getUri('save'),
                _.extend({}, itemConfig, {
                    cssJson: JSON.stringify(style),
                    stylesheetUri: customStylesheetHref
                })
            )
                .done(resolve)
                .fail(function (xhr, status, err) {
                    reject(err);
                });
        });
    };

    /**
     * Download CSS as file
     * @param {String} uri
     */
    const download = function (uri) {
        verifyInit();
        $.fileDownload(_getUri('download'), {
            preparingMessageHtml: common.preparingMessageHtml,
            failMessageHtml: common.failMessageHtml,
            successCallback: function () {},
            httpMethod: 'POST',
            data: _.extend({}, itemConfig, { stylesheetUri: uri })
        });
    };

    /**
     * Add a single stylesheet, the custom stylesheet will be loaded as object
     *
     * @param {String | Object} stylesheet
     */
    const addStylesheet = function (stylesheet) {
        let listEntry, fileName;
        const loadStylesheet = function (link, stylesheetLoad, isLocal, isValid) {
            // in the given scenario we cannot test whether a remote stylesheet really exists
            // this would require to pipe all remote css via php curl
            const isInvalidLocal = isLocal && !isValid,
                tplData = {
                    path: stylesheetLoad.attr('href'),
                    label: stylesheetLoad.attr('title') || fileName,
                    title: common.title,
                    deleteTxt: common.deleteTxt,
                    downloadTxt: common.downloadTxt,
                    editLabelTxt: isInvalidLocal ? common.isInValidLocalTxt : common.editLabelTxt
                };

            // create list entry
            listEntry = $(cssTpl(tplData));

            listEntry.data('stylesheetObj', stylesheetLoad);

            // initialize download button
            $('#style-sheet-toggler').append(listEntry);

            if (isInvalidLocal) {
                listEntry.addClass('not-available');
                listEntry.find('[data-role="css-download"], .style-sheet-toggler').css('visibility', 'hidden');
                return;
            }

            $styleElem.before(link);

            // time difference between loading the css file and applying the styles
            setTimeout(
                function () {
                    let isInit = false;

                    $(document).trigger('customcssloaded.styleeditor', [style]);
                    $(window).trigger('resize');
                    if (currentItem.pendingStylesheetsInit) {
                        isInit = true;
                        currentItem.pendingStylesheetsInit--;
                    }

                    /**
                     * Fires a change notification on the item style
                     * @event taoQtiItem/qtiCreator/editor/styleEditor/styleEditor#stylechange.qti-creator
                     * @property {Object} [detail] An object providing some additional detail on the event
                     * @property {Boolean} [detail.initializing] Tells if the stylechange occurs at init time
                     */
                    $(document).trigger('stylechange.qti-creator', [{ initializing: isInit }]);
                },
                isLocal ? 500 : 3500
            );
        };

        // argument is uri
        if (_.isString(stylesheet)) {
            stylesheet = currentItem.createStyleSheet(stylesheet);
        }

        fileName = _basename(stylesheet.attr('href'));
        // link with cache buster
        const link = (function () {
            const _link = $(stylesheet.render()),
                _href = _link.attr('href'),
                _sep = _href.indexOf('?') > -1 ? '&' : '?';
            _link.attr('href', _href + _sep + new Date().getTime().toString());
            return _link;
        })();

        // cache css before applying allows for a pretty good guess
        // when the stylesheet is loaded and the buttons in the style editor
        // can be changed
        const parser = new UrlParser(link.attr('href'));
        if (parser.checkCORS()) {
            $.when($.ajax(link.attr('href'))).then(
                function () {
                    loadStylesheet(link, stylesheet, true, true);
                },
                // add file to list even on failure to be able to remove it from the item
                function () {
                    loadStylesheet(link, stylesheet, true, false);
                }
            );
        } else {
            // otherwise load it with a big timeout and hope for the best
            // unfortunately this dirty way is the only possibility in cross domain environments
            loadStylesheet(link, stylesheet, false);
        }
    };

    /**
     * Add style sheets to toggler
     */
    const addItemStylesheets = function () {
        let key;
        let currentStylesheet;
        currentItem.pendingStylesheetsInit = _.size(currentItem.stylesheets);

        for (key in currentItem.stylesheets) {
            if (!Object.prototype.hasOwnProperty.call(currentItem.stylesheets, key)) {
                continue;
            }

            currentStylesheet = currentItem.stylesheets[key];

            if ('tao-user-styles.css' === _basename(currentStylesheet.attr('href'))) {
                customStylesheet = currentStylesheet;
                continue;
            }

            // add those that are loaded synchronously
            addStylesheet(currentItem.stylesheets[key]);
        }
    };

    /**
     * Remove orphaned stylesheets. These would be present if previously another item has been edited
     */
    const removeOrphanedStylesheets = function () {
        // rich passage styles loaded as link with [data-serial] attribute
        // see taoMediaManager/views/js/richPassage/xincludeRendererAddStyles.js
        $('link[data-serial]').remove();
        customStylesheet = null;
        erase();
    };

    const removeStylesheetOnDeletePassage = function (passageSerial) {
        if (passageSerial) {
            $(`link[data-serial='${passageSerial}']`).remove();
        }
    };

    /**
     * retrieve the current item
     *
     * @returns {*}
     */
    const getItem = function () {
        return currentItem;
    };

    /**
     * Initialize class
     * @param {Object} item
     * @param {Object} config
     */
    const init = function (item, config) {
        let resizerTarget;
        let href;

        globalConfig = config;
        // promise
        currentItem = item;

        //prepare config object (don't pass all of them, otherwise, $.param will break)
        itemConfig = {
            uri: config.uri,
            lang: config.lang,
            baseUrl: config.baseUrl
        };

        removeOrphanedStylesheets();

        addItemStylesheets();

        resizerTarget = $('#item-editor-item-resizer').data('target');
        currentItem.data('responsive', true);

        if (customStylesheet) {
            href = customStylesheet.attr('href');
            $.when($.getJSON(_getUri('load'), _.extend({}, itemConfig, { stylesheetUri: href }))).then(function (
                _style
            ) {
                // copy style to global style
                style = _style;
                // apply rules
                create();
                // reset meta in case the width is set in the custom stylesheet
                if (style.length) {
                    currentItem.data('responsive', !!(style[resizerTarget] && style[resizerTarget].width));
                }
                // inform editors about custom sheet
                $(document).trigger('customcssloaded.styleeditor', [style]);
            });
        }
    };

    const getStyle = function () {
        return style;
    };

    const cleanCache = function () {
        removeOrphanedStylesheets();
        $(document).off('customcssloaded.styleeditor');
    };

    return {
        apply: apply,
        save: save,
        download: download,
        erase: erase,
        init: init,
        create: create,
        getItem: getItem,
        getStyle: getStyle,
        addStylesheet: addStylesheet,
        cleanCache: cleanCache,
        removeStylesheetOnDeletePassage: removeStylesheetOnDeletePassage
    };
});
