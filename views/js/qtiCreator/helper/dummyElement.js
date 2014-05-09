define([
    'jquery'
], function ($) {
    'use strict'


    var dummyElement = (function () {

        var types = {
            maths: {
                css: {
                    backgroundImage: 'url(../../taoQtiItem/views/img/qtiIconsPng/icon-maths.png)',
                    width : 50,
                    height : 18
                },
                text: ' '
            },
            image: {
                css: {
                    backgroundImage: 'url(../../taoQtiItem/views/img/qtiIconsPng/icon-image.png)',
                    width : 150,
                    height : 100
                },
                text: 'Image'
            },
            video: {
                css: {
                    backgroundImage: 'url(../../taoQtiItem/views/img/qtiIconsPng/icon-video.png)',
                    width : 200,
                    height : 150
                },
                text: 'Video'
            },
            media: {
                css: {
                    backgroundImage: 'url(../../taoQtiItem/views/img/qtiIconsPng/icon-media.png)',
                    width : 150,
                    height : 100
                },
                text: 'Media'
            }
        };

        /**
         * create dummy element
         *
         * Examples:
         *
         * 1. Generic placeholder
         * dummyElement.get();
         * -> <span class="dummy-element"></span>
         *
         * 2. Pre-defined placeholder
         * dummyElement.get('math|images|video|...')
         * -> <span style="background-image: url(...); width: 200px; height: 150px; background-size: auto;" class="dummy-element">Image</span>
         *
         * 3. Freestyle
         * works almost like $('<element>'), except that 'element' and 'css' (both optionally) are part of an object
         * dummyElement.get({ element: 'div', text: 'Whatever', class: 'foo bar', css: { color: 'red'}})
         * <div class="dummy-element foo bar" style="color: red">Whatever</div>
         *
         *
         * @param arg {} | string
         * @returns {*|HTMLElement}
         */
        var get = function (arg) {
            var options = {
                element: 'span',
                'class': 'dummy-element',
                css: {}
            },
            element,
            $element,
            css;
            if(arg) {
                if($.isPlainObject(arg)) {
                    // class names must be added to 'dummy-element'
                    if(arg.class) {
                        options.class += ' ' + arg.class;
                        delete(arg.class);
                    }
                    // 'deep' required to copy CSS correctly
                    options = $.extend(true, {}, options, arg);
                }
                else if (types[arg]) {
                    options = $.extend({}, options, types[arg]);
                }
            }


            element = '<' + options.element + '>';
            delete(options.element);

            css = options.css;
            delete(options.css);

            // don't scale background-picture on large elements
            if(css.height && css.height > 100) {
                css['background-size'] = 'auto';
            }

            $element = $(element, options).css(css);

            return $element;
        };

        return {
            get: get
        }

    }());
    return dummyElement;
});


