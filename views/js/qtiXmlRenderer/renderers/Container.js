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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA
 */

define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/container'], function(tpl){
    /**
     * Elements that need to be prefixed
     *
     * @see http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd
     * @type {string}
     */
    const prefixed = 'article|aside|bdi|figure|footer|header|nav|rb|rp|rt|rtc|ruby|section';
    const defaultNsName = 'qh5';
    const defaultNsUri = 'http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0';
    const xhtmlEntities = function(html){
        //@todo : check other names entities
        return html.replace(/&nbsp;/g, '&#160;');
    };
    const xhtmlEncode = function(encodedStr){

        let returnValue = '';

        if(encodedStr){
            //<br...> are replaced by <br... />
            returnValue = encodedStr;
            returnValue = returnValue.replace(/<br([^>]*)?>/ig, '<br />');
            returnValue = returnValue.replace(/<hr([^>]*)?>/ig, '<hr />');

            //<img...></img> are replaced by <img... />
            returnValue = returnValue.replace(/<img([^>]*)?\s?[^\/]>\s?(<\/img>)+/ig,
                function($0, $1, $2) {
                    return $0.replace('>', ' />').replace($2, '');
                });
            //<img...> are replaced by <img... />
            returnValue = returnValue.replace(/(<img([^>]*)?\s?[^\/]>)+/ig,
                function($0){
                    return $0.replace('>', ' />');
                });
            //<rt></rt> are replaced by <rt>&nbsp;</rt>
            returnValue = returnValue.replace(/(<rt(|\s+[^>]*)><\/rt\s*>)+/ig,
                function($0){
                    return $0.replace('</rt', '&nbsp;</rt');
                });
            // merge sibling tags strong, em, sub, sup
            returnValue = mergeSiblings(returnValue);
        }

        return returnValue;
    };

    return {
        qtiClass : '_container',
        template : tpl,
        getData:function(container, data){

            data.body = xhtmlEntities(data.body);
            data.body = xhtmlEncode(data.body);
            const openRegEx = new RegExp(`(<(${prefixed}))`, 'gi');
            if (openRegEx.test(data.body)) {
                const relatedItem = container.rootElement;
                const namespaces = relatedItem.getNamespaces();
                if (!namespaces[defaultNsName]) {
                    //if no ns found in the item, set the default one!
                    relatedItem.namespaces[defaultNsName] = defaultNsUri;
                }
            }
            return data;
        }
    };

    /**
     * Merges specified sibling html tags into one
     * @param {string} html
     * @returns {string}
     */
    function mergeSiblings(html) {
        if (typeof html !== 'string' || html.length <= 0) {
            return html;
        }
        const tagsToMerge = [
            'strong',
            'em',
            'sub',
            'sup'
        ];
        tagsToMerge.forEach(function(tag) {
            let regex = new RegExp(`<\\/${tag}>(\\s*)<${tag}>`, 'gi');
            html = html.replace(regex, "$1");
        });
        return html;
    }
});
