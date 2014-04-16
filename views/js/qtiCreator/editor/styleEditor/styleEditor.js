/*

 Jérome is going to implement https://github.com/sabberworm/PHP-CSS-Parser on the server side.

 PHP mock-up for the controller (derived from my testing code, hence a bit dodgy)

 if(!empty($_POST['css'])) {

 $cssArr = json_decode($_POST['css'], 1);
 $cssStr = '';
 foreach($cssArr as $selector => $ruleSet) {
 $cssStr .= $selector . '{';
 foreach($ruleSet as $property => $value) {
 $cssStr .= $property . ':' . $value . ';';
 }
 $cssStr .= "}\n";
 }
 file_put_contents('/path/to/user/css', $cssStr);

 // Alternatively the above parser could be used. Since we don't support fancy stuff
 // this might be overkill though.
 }
 else if(!empty($_GET['action']) && $_GET['action'] === 'load-css') {
 // load CSS file and build array using above parser.
 // The result would be something like this:
 // $css = array(
 //     '.px' => array(
 //         'color' => 'firebrick',
 //         'font-style' => 'italic'
 //     )
 // );
 print json_encode($css);
 }


 */

/**
 * Note: This class supports basic CSS editing only. There is nothing fancy such as media queries etc.
 * Should we ever want to do this however, only the JS needs to be updated - the PHP parser supports this already
 */

define([
    'jquery',
    'lodash',
    'helpers',
    'i18n',
    'lib/jquery.fileDownload'
], function ($, _, helpers, __) {
    'use strict'

    var itemConfig;

    /**
     * generate Ajax URI
     * @param action
     * @returns {*}
     */
    var getUri = function(action) {
        return helpers._url(action, 'QtiCssAuthoring', 'taoQtiItem');
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
            }());

        /**
         * Create CSS and add it to DOM
         * Supports media queries that could come from an imported CSS
         *
         * @private
         */
        var _buildCss = function(style) {
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
            }
            else {
                style[selector][property] = value;
            }

            // apply rule
            _buildCss(style);

        };

        /**
         * Save the resulting CSS to a file
         */
        var save = function () {
            verifyInit();
            $.post(getUri('save'), _.extend(itemConfig, { cssJson: JSON.stringify(style) }));
        };


        /**
         * Download CSS as file
         */
        var download = function() {
            verifyInit();
            $('[data-role="css-download"]').on('click', function() {
                $.fileDownload(getUri('download'), {
                    preparingMessageHtml: __('We are preparing your CSS, please wait...'),
                    failMessageHtml: __('There was a problem downloading your CSS, please try again.'),
                    successCallback: function () { },
                    httpMethod: 'POST',
                    data: _.extend(itemConfig, { cssJson: JSON.stringify(style) })
                });
            });
        };

        var verifyInit = function() {
            if(!itemConfig) {
                throw new Error('Missing itemConfig, did you call init()?')
            }
            return true;
        };


        /**
         * initialize class
         * @param config
         */
        var init = function(config) {
            itemConfig = config;
            $('[data-role="css-download"]').on('click', download);
        };


        /**
         * Load an existing CSS file as JSON
         *
         */
        var load = function () {
            verifyInit();
            $.getJSON(getUri('load'), itemConfig).done(function (json) {
                _buildCss(json);
            })
        };

        // expose public functions
        return {
            apply: apply,
            save: save,
            load: load,
            init: init
        }
    }($));

    return styleEditor;
});