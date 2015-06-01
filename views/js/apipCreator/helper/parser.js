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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([], function () {
    'use strict';

    /**
     * QTI Item xml document
     * @type object
     */
    var itemXML;

    /**
     * Convert string to XML document.
     * @param {string} string XML string.
     * @returns {object} XML document 
     */
    function stringToXml(string) {
        var xmlDoc,
            parser;

        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(string, "text/xml");
        } else {
            // IE
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(string);
        }
        return xmlDoc;
    }

    /**
     * Parse the xml string or xml document. 
     * Attribute <i>serial</i> will be added for each node. The value of attribute is node name plus node number (e.g. 'div1', 'div1' etc.).
     * 
     * @param {String | Object} xml - the qti apip xml string or xml document to be parsed
     * @returns {Object} XML documents
     */
    function parse(xml) {
        var tagNames = {};
        
        if (typeof xml === 'string') {
            itemXML = stringToXml(xml);
        } else {
            itemXML = xml;
        }
        $(itemXML).find('*').each(function (key, element) {
            if (!tagNames[element.localName]) {
                tagNames[element.localName] = 0;
            }
            tagNames[element.localName]++;
            $(element).attr('serial', (element.localName + tagNames[element.localName]));
        });
        return itemXML;
    }

    return {
        parse : parse,
        stringToXml : stringToXml
    };
});