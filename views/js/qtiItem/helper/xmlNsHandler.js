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
define([], function(){
    'use strict';

    /**
     * Elements that need to be prefixed
     *
     * @see http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd
     * @type {string}
     */
    var prefixed = 'article|aside|bdi|figure|footer|header|nav|rb|rp|rt|rtc|ruby|section';


    /**
     * Find a possibly existing prefix
     *
     * @param namespaces
     * @param html5Ns
     * @returns {*}
     */
    function getPrefix(namespaces, html5Ns) {
        var key;
        for(key in namespaces) {
            if(namespaces[key] === html5Ns) {
                return key;
            }
        }
        return 'qh5';
    }

    return {

        /**
         * Remove prefix to make sure elements are properly displayed
         *
         * @param body
         */
        stripNs : function stripNs(body) {
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
        restoreNs : function restoreNs(xml, namespaces) {
            var xmlRe     = new RegExp('(<(' + prefixed + ')[^>]*>|<\\/(' + prefixed + ')>)', 'gi');
            var tagRe     = new RegExp('((<)(' + prefixed + ')([^>]*)(>)|(<\\/)(' + prefixed + ')(>))', 'i');
            var xmlMatch  = xml.match(xmlRe);
            var imsXsd    = 'http://www.imsglobal.org/xsd';
            var html5Ns   = imsXsd + '/imsqtiv2p2_html5_v1p0';
            var prefix    = getPrefix(namespaces, html5Ns);
            var prefixAtt = 'xmlns:' + prefix + '="' + html5Ns + '"';
            var i         = xmlMatch ? xmlMatch.length : 0;
            var tagMatch;

            if(!xmlMatch) {
                return xml;
            }

            while(i--) {
                tagMatch = xmlMatch[i].match(tagRe);
                xml = xml.replace(xmlMatch[i],
                    tagMatch[5]
                        ? '<' + prefix + ':' + tagMatch[3] + tagMatch[4] + '>'
                        : '</' + prefix + ':' + tagMatch[7] + '>'
                );
            }

            // we found matches but no namespace has been set
            if(xmlMatch.length && xml.indexOf(prefixAtt) === -1) {
                xml = xml.replace('<assessmentItem', '<assessmentItem ' + prefixAtt);
            }

            // make sure the item is set to qti 2.2
            xml = xml.replace('xmlns="' + imsXsd + '/imsqti_v2p1"', 'xmlns="' + imsXsd + '/imsqti_v2p2"');
            xml = xml.replace(
                'xsi:schemaLocation="' + imsXsd + '/imsqti_v2p1 imsqti_v2p1.xsd"',
                'xsi:schemaLocation="' + imsXsd + '/imsqti_v2p2 ' + imsXsd + '/qti/qtiv2p2/imsqti_v2p2.xsd"'
            );

            return xml;
        }
    };
});
