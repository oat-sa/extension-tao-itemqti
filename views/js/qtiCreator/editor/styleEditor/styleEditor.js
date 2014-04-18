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
            }()),
            // the button to disable custom styles
            customCssToggler = $('[data-custom-css]');

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
            $.post(getUri('save'), _.extend(itemConfig, { cssJson: JSON.stringify(style) }));
        };


        /**
         * Download CSS as file
         */
        var download = function() {
            verifyInit();
            $.fileDownload(getUri('download'), {
                preparingMessageHtml: __('We are preparing your CSS, please wait...'),
                failMessageHtml: __('There was a problem downloading your CSS, please try again.'),
                successCallback: function () { },
                httpMethod: 'POST',
                data: _.extend(itemConfig, { cssJson: JSON.stringify(style) })
            });
        };

        /**
         * Has the class been initialized
         *
         * @returns {boolean}
         */
        var verifyInit = function() {
            if(!itemConfig) {
                throw new Error('Missing itemConfig, did you call init()?')
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
            var itemObj = item.toArray(),
                stylesheets = [],
                stylesheet,
                attributes,
                title = __('Disable this style sheet temporarily'),
                deleteTxt = __('Delete this style sheet'),
                insertMarker = $('[data-custom-css="true"]');

            for(stylesheet in itemObj.stylesheets) {
                if(!itemObj.stylesheets.hasOwnProperty(stylesheet)) {
                    continue;
                }
                attributes = itemObj.stylesheets[stylesheet].attributes;
                stylesheets.push({
                    path: attributes.href,
                    label: (attributes.title || attributes.href.substring(attributes.href.lastIndexOf('/') + 1)),
                    title: title,
                    deleteTxt: deleteTxt
                });
            }
            insertMarker.before(cssTpl({ stylesheets: stylesheets }));
        };


        /**
         * Initialize class
         * @param config
         */
        var init = function(item, config) {
            itemConfig = config;

            listStylesheets(item);

            // initialize download button
            $('[data-role="css-download"]').on('click', download);
        };


        /**
         * Load an existing CSS file as JSON
         *
         */
        var load = function (stylesheet) {
        };

        // expose public functions
        return {
            apply: apply,
            save: save,
            load: load,
            erase: erase,
            init: init,
            create: create,
            hasStyle: hasStyle
        }
    }($));

    return styleEditor;
});