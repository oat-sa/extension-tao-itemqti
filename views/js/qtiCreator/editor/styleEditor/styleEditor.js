define([
    'jquery',
    'lodash',
    'helpers',
    'i18n',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/cssToggler',
    'lib/jquery.fileDownload'
], function (
    $,
    _,
    helpers,
    __,
    cssTpl
    ) {
    'use strict'

    var itemConfig;

    /**
     * generate Ajax URI
     * @param action
     * @returns {*}
     */
    var _getUri = function(action) {
        return helpers._url(action, 'QtiCssAuthoring', 'taoQtiItem');
    };

    /**
     * Extract the file name from a path
     * @param path
     * @returns {*}
     * @private
     */
    var _basename = function(path) {
        return path.substring(path.lastIndexOf('/') + 1);
    };

    /**
     * Manage style rules as CSS rather than style attributes.
     * Must be used by all widgets that change the style of an item.
     */
    var styleEditor = (function ($, doc) {

        // stylesheet as object
        var style = {},
            // DOM element to hold the style
            $styleElem = (function () {
                var styleElem = $('<style>', { id : 'item-editor-user-styles' } );
                $('head').append(styleElem);
                return styleElem;
            }()),
            currentItem,
            common = {
                title: __('Disable this style sheet temporarily'),
                deleteTxt: __('Delete this style sheet'),
                editLabelTxt: __('Edit style sheet label'),
                listing: $('#style-sheet-toggler')
            },
            customStylesheet = '';

        /**
         * Create CSS and add it to DOM
         *
         */
        var create = function() {

            var key1, // first level key, could be selector or media query
                key2, // second level key, could be css property or selector
                mSelector, // selector inside a media query
                mProp, // property inside a media query
                css = '';

            // rebuild CSS
            for (key1 in style) {
                if (!style.hasOwnProperty(key1)) {
                    continue;
                }

                css += key1 + '{';
                for (key2 in style[key1]) {
                    if (!style[key1].hasOwnProperty(key2)) {
                        continue;
                    }
                    // in the case of a surrounding media query
                    if (_.isPlainObject(style[key1][key2])) {
                        for (mSelector in style[key1][key2]) {
                            css += key2 + '{';
                            for (mProp in style[key1][key2]) {
                                css += mProp + ':' + style[key1][key2][mSelector] + ';'
                            }
                            css += '}';
                        }
                    }
                    // regular selectors
                    else {
                        css += key2 + ':' + style[key1][key2] + ';'
                    }
                }
                css += '}\n';
            }

            $styleElem.text(css);
        };

        /**
         * Apply new rule to CSS
         *
         * @param {{string}} selector
         * @param {{string}} property
         * @param {{string}} value
         */
        var apply = function (selector, property, value) {
            style[selector] = style[selector] || {};

            if (!value) {
                delete(style[selector][property]);
                if(_.size(style[selector]) === 0) {
                    delete(style[selector]);
                }
            }
            else {
                style[selector][property] = value;
            }

            // apply rule
            create();

        };


        /**
         * Delete all custom styles
         */
        var erase = function() {
            $styleElem.text('');
        };

        /**
         * Save the resulting CSS to a file
         */
        var save = function () {
            if(_.isEmpty(style)){
                //@todo remove stylesheet from item
            }
            verifyInit();
            $.post(_getUri('save'), _.extend({}, itemConfig, { cssJson: JSON.stringify(style) }));
        };

        $(document).on('itemsave.qtiEdit', save);


        /**
         * Download CSS as file
         */
        var download = function() {
            verifyInit();
            $.fileDownload(_getUri('download'), {
                preparingMessageHtml: __('We are preparing your CSS, please wait...'),
                failMessageHtml: __('There was a problem downloading your CSS, please try again.'),
                successCallback: function () { },
                httpMethod: 'POST',
                data: _.extend({}, itemConfig, { cssJson: JSON.stringify(style) })
            });
        };


        /**
         * Has the class been initialized
         *
         * @returns {boolean}
         */
        var verifyInit = function() {
            if(!itemConfig) {
                throw new Error('Missing itemConfig, did you call styleEditor.init()?')
            }
            return true;
        };

        /**
         * Add a single stylesheet, the custom stylesheet will be loaded as object
         *
         * @param stylesheet
         * @returns {*} promise
         */
        var addStylesheet = function(stylesheet) {

            var fileName,
                link,
                stylesheets = [],
                listEntry;

            // argument is uri
            if(_.isString(stylesheet)) {
                stylesheet = currentItem.createStyleSheet(stylesheet);
            }

            fileName = _basename(stylesheet.attr('href'));
            link = $(stylesheet.render());

            // add other stylesheets to head
            $styleElem.before(link);

            stylesheets.push({
                path: stylesheet.attr('href'),
                label: (stylesheet.attr('title') || fileName),
                title: common.title,
                deleteTxt: common.deleteTxt,
                editLabelTxt: common.editLabelTxt
            });

            // create list entry
            listEntry = $(cssTpl({ stylesheets: stylesheets }));

            // initialize download button
            common.listing.append(listEntry);
        };


        /**
         * Add style sheets to toggler
         * @param item
         */
        var addItemStylesheets = function() {
            var currentStylesheet;

            for(var key in currentItem.stylesheets) {
                if(!currentItem.stylesheets.hasOwnProperty(key)) {
                    continue;
                }

                currentStylesheet = currentItem.stylesheets[key];

                if('tao-user-styles.css' === _basename(currentStylesheet.attr('href'))) {
                    customStylesheet = currentStylesheet.attr('href');
                    continue;
                }

                // add those that are loaded asynchronously
                addStylesheet(currentItem.stylesheets[key]);
            }


            $('[data-role="css-download"]').on('click', download);

            // if no custom css had been found, add empty stylesheet anyway
            if(!customStylesheet) {
                currentItem.createStyleSheet('style/custom/tao-user-styles.css');
            }



        };
        
        /**
         * retrieve the current item
         *
         * @returns {*}
         */
        var getItem = function() {
            return currentItem;
        };


        /**
         * Initialize class
         * @param config
         */
        var init = function(item, config) {
            // promise
            currentItem = item;
            itemConfig = config;

            var stylesheetUri = _getUri('load') + '?',
                resizerTarget = $('#item-editor-item-resizer').data('target');

            addItemStylesheets();

            currentItem.data('responsive', true);

            if(customStylesheet) {
                stylesheetUri += $.param(_.extend({}, itemConfig, { stylesheetUri: customStylesheet }));
                require(['json!' + stylesheetUri], function(_style) {

                    // copy style to global style
                    style = _style;

                    // apply rules
                    create();

                    // reset meta in case the width is set in the custom stylesheet
                    currentItem.data('responsive', style[resizerTarget] && style[resizerTarget].width);

                    // inform editors about custom sheet
                    $(doc).trigger('customcssloaded.styleeditor', style);
                })
            }


            $(doc).on('itemsave.qtiEdit', save);

        };

        // expose public functions
        return {
            apply: apply,
            save: save,
            erase: erase,
            init: init,
            create: create,
            getItem: getItem,
            addStylesheet: addStylesheet
        }
    }($, document));

    return styleEditor;
});