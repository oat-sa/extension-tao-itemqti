import $ from 'jquery';
import _ from 'lodash';
import simpleParser from 'taoQtiItem/qtiItem/helper/simpleParser';
import Loader from 'taoQtiItem/qtiItem/core/Loader';

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

export default {
    load
};
