define([
    'jquery',
    'lodash',
    'helpers',
    'i18n',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/cssToggler',
    'lib/jquery.fileDownload'
], function ($, _, helpers, __, cssTpl) {
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
    var styleEditor = (function ($) {

        // stylesheet as object
        var style = {},
            // DOM element to hold the style
            $styleElem = (function () {
                var styleElem = $('<style>', { id : 'item-editor-user-styles' } );
                $('head').append(styleElem);
                return styleElem;
            }()),
            // the button to disable custom styles
            customCssToggler = $('[data-custom-css]'),
            currentItem;

        /**
         * Create CSS and add it to DOM
         * Supports media queries that could come from an imported CSS
         *
         * @param simulated true when called from style toggler
         */
        var create = function(simulated) {
            // simulated to boolean
            simulated = !!simulated;

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
            if(!simulated) {
                customCssToggler.removeClass('not-available');
            }
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
            create(false);

        };


        /**
         * Delete all custom styles
         *
         * @param simulated true when called from style toggler
         */
        var erase = function(simulated) {
            simulated = !!simulated;
            $styleElem.text('');

            if(!simulated) {
                customCssToggler.addClass('not-available');
            }
        };

        /**
         * Save the resulting CSS to a file
         */
        var save = function () {
            verifyInit();
            $.post(_getUri('save'), _.extend({}, itemConfig, { cssJson: JSON.stringify(style) }));
        };


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
         * Load an existing CSS file as JSON
         *
         * @param uri
         */
        var load = function (uri) {
            $.getJSON(_getUri('load'), _.extend({}, itemConfig, { uri:uri }))
                .done(function(json) {
                    //style = json;
                    // apply rule
                    create(false);
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
         * Are there any custom styles available?
         *
         * @returns {boolean}
         */
        var hasStyle = function() {
            return _.size(style) !== 0;
        };


        /**
         * Add style sheets to toggler
         * @param item
         */
        var listStylesheets = function(item) {

            // extract stylesheets
            var stylesheets = [],
                key,
                stylesheet,
                title = __('Disable this style sheet temporarily'),
                deleteTxt = __('Delete this style sheet'),
                insertMarker = $('[data-custom-css="true"]'),
                fileName,
                hasCustomCss = false,
                link;

            for(key in item.stylesheets) {
                stylesheet = item.stylesheets[key];
                fileName = _basename(stylesheet.attr('href')),
                link = $(stylesheet.render());

                if(!item.stylesheets.hasOwnProperty(key)) {
                    continue;
                }

                if(fileName === 'tao-user-styles.css') {
                    load(link.attr('href'));
                    customCssToggler.data('css-res', link.attr('href'))
                    hasCustomCss = true;
                }
                else {
                    $styleElem.before(link);

                    stylesheets.push({
                        path: stylesheet.attr('href'),
                        label: (stylesheet.attr('title') || fileName),
                        title: title,
                        deleteTxt: deleteTxt
                    });
                }
            }

            if(!hasCustomCss) {
                item.createStyleSheet('css/custom/tao-user-styles.css');
            }

            insertMarker.before(cssTpl({ stylesheets: stylesheets }));
        };

        /**
         * retrieve the style object
         *
         * @returns {{}}
         */
        var getStyle = function() {
            return style;
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
            currentItem = item;
            itemConfig = config;

            listStylesheets(item);

            // initialize download button
            $('[data-role="css-download"]').on('click', download);


            $(document).on('itemsave.qtiEdit', save);
        };

        // expose public functions
        return {
            apply: apply,
            save: save,
            load: load,
            erase: erase,
            init: init,
            create: create,
            hasStyle: hasStyle,
            getStyle: getStyle,
            getItem: getItem
        }
    }($));

    return styleEditor;
});