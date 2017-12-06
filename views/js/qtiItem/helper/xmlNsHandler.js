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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 */

/**
 * XML namespace handling
 */
define([
], function(){
    'use strict';


    /**
     * Default prefix
     *
     * @see http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd
     * @type {string}
     */
    var defaultPrefix = 'qh5';

    /**
     * Default namespace
     *
     * @type {string}
     */
    var defaultNs = 'http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0';

    /**
     * Elements that need to be prefixed
     *
     * @see http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd
     * @type {string}
     */
    var prefixed = ['article','aside','bdi','figure','footer','header','nav','rb','rp','rt','rtc','ruby','section'].join('|');

    return {

        /**
         * Remove prefix to make sure elements are properly displayed
         *
         * @param body
         */
        stripNs : function(body) {
            var pattern    = '([\\w]+)\\:(' + prefixed + ')';
            var openRegEx  = new RegExp('(<' + pattern + ')', 'gi');
            var closeRegEx = new RegExp('(<\\/' + pattern + '>)', 'gi');
            return body.replace(openRegEx, '<$3').replace(closeRegEx, '</$3>');
        },

        /**
         * Add a prefix to those elements that require one
         *
         * @param xml
         * @param namespaces
         * @returns {*}
         */
        restoreNs : function restoreNameSpaces(xml, namespaces) {
            var xmlRe    = new RegExp('(<(' + prefixed + ')[^>]*>|<\\/(' + prefixed + ')>)', 'gi');
            var tagRe    = new RegExp('((<)(' + prefixed + ')([^>]*)(>)|(<\\/)(' + prefixed + ')(>))', 'i');
            var xmlMatch = xml.match(xmlRe);
            var i        = xmlMatch.length || 0;
            var tagMatch;
            var prefix   = (function() {
                var key;
                for(key in namespaces) {
                    if(/https?:\/\/([\w]+\.)?imsglobal.org\/xsd\/[\w]+html5/.test(namespaces[key])){
                        break;
                    }
                }
                return key;
            }(namespaces));

            // we found matches but no namespace has been set
            if(i && !prefix) {
                prefix = defaultPrefix;
                xml = xml.replace('<assessmentItem', '<assessmentItem xmlns:' + prefix + '="' + defaultNs + '"');
            }

            while(i--) {
                tagMatch = xmlMatch[i].match(tagRe);
                xml = xml.replace(xmlMatch[i],
                    tagMatch[5]
                        ? '<' + prefix + ':' + tagMatch[3] + tagMatch[4] + '>'
                        : '</' + prefix + ':' + tagMatch[7] + '>'
                )
            }
            return xml;
        }
    };
});
