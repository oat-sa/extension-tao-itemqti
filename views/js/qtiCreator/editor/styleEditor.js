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
  'jquery'
], function($){
  'use strict'

    /**
     * Manage style rules as CSS rather than style attributes.
     * Must be used by all widgets that change the style of an item.
     */
    var styleEditor = (function($) {

            // stylesheet as object
        var style = {},
            // DOM element to hold the style
            $styleElem = (function() {
                var styleElem = $('<style>');
                $('head').append(styleElem);
                return styleElem;
            }());

        /**
         * Create CSS and add it to DOM
         *
         * @private
         */
        var _buildCss = function(style) {
            var css = '',
                selector,
                property;

            // rebuild CSS
            for (selector in style) {
                if (!style.hasOwnProperty(selector)) {
                    continue;
                }
                css += selector + '{';
                for(property in style[selector]){
                    if (!style[selector].hasOwnProperty(property)) {
                        continue;
                    }
                    css += property + ':' + style[selector][property] + ';'
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
        var apply = function(selector, property, value) {

            style[selector] = style[selector] || {};

            if(!value) {
                delete(style[selector][property])
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
        var save = function() {
            alert('This is not the correct URL yet!')
            $.post('/style.php', { css: JSON.stringify(style) });
        };

        /**
         * Load an existing CSS file as JSON
         */
        var load = function() {
            alert('This is not the correct URL yet!')
            $.getJSON('/style.php', { action: 'load-css' }).done(function(json) {
                _buildCss(json);
            })
        };

        // expose public functions
        return {
            apply: apply,
            save: save,
            load: load
        }
    }($));

    return styleEditor;
});