define(['jquery', 'lodash', 'taoQtiItem/qtiItem/helper/simpleParser', 'taoQtiItem/qtiItem/core/Loader'], function ($, _, simpleParser, Loader) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    simpleParser = simpleParser && Object.prototype.hasOwnProperty.call(simpleParser, 'default') ? simpleParser['default'] : simpleParser;
    Loader = Loader && Object.prototype.hasOwnProperty.call(Loader, 'default') ? Loader['default'] : Loader;

    function load(xinclude, baseUrl, callback) {
        const href = xinclude.attr('href');
        if (href && baseUrl) {
            const fileUrl = `text!${baseUrl}${href}`;
            // reset the previous definition of the XML, to receive updated passage
            require.undef(fileUrl);
            // require xml
            require([fileUrl], function (stimulusXml) {
                const $wrapper = $.parseXML(stimulusXml);
                const $sampleXMLrootNode = $wrapper.children;
                const $stimulus = $('<include>').append($sampleXMLrootNode);
                const mathNs = 'm'; //for 'http://www.w3.org/1998/Math/MathML'
                const data = simpleParser.parse($stimulus, {
                    ns: {
                        math: mathNs
                    }
                });

                new Loader().loadElement(xinclude, data, function () {
                    if (_.isFunction(callback)) {
                        const loadedClasses = this.getLoadedClasses();
                        loadedClasses.push('_container'); //the _container class is always required
                        callback(xinclude, data, loadedClasses);
                    }
                });
            }, function () {
                //in case the file does not exist
                callback(xinclude, false, []);
            });
        }
    }

    var xincludeLoader = {
        load
    };

    return xincludeLoader;

});
