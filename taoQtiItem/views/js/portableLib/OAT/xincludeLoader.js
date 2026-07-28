/**
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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

/**
 * Helper for loading xinclude elements for PCI
 */
define(function () {
    'use strict';

    function convertXMLToHTML(xmlNode, baseUrl) {
        const htmlNode = document.createElement(xmlNode.nodeName);
        Array.from(xmlNode.attributes).forEach(attr => {
            let attrValue = attr.value;
            if (attrValue.startsWith('taomedia://')) {
                attrValue = baseUrl + attrValue;
            }
            htmlNode.setAttribute(attr.name, attrValue);
        });
        xmlNode.childNodes.forEach(childNode => {
            if (childNode.nodeType === Node.ELEMENT_NODE) {
                htmlNode.appendChild(convertXMLToHTML(childNode, baseUrl));
            } else if (childNode.nodeType === Node.TEXT_NODE) {
                htmlNode.appendChild(document.createTextNode(childNode.nodeValue));
            }
        });

        return htmlNode;
    }

    function parseXmlToDom(xmlString, baseUrl) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        return convertXMLToHTML(xmlDoc.documentElement, baseUrl);
    }

    function loadXIncludeElement(xiIncludeElementHref, baseUrl) {
        if (!xiIncludeElementHref || !baseUrl) {
            return Promise.reject(new Error('href or baseUrl is missing'));
        }
        return new Promise((resolve, reject) => {
            const fileUrl = `text!${baseUrl}${xiIncludeElementHref}`;
            require.undef(fileUrl);
            require([fileUrl], stimulusXml => {
                const data = parseXmlToDom(stimulusXml, baseUrl);
                resolve(data);
            }, () => {
                reject(new Error('File not found'));
            });
        });
    }

    function processContentItem(contentItem, baseUrl) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentItem;
        const xiIncludeElements = tempDiv.querySelectorAll('xi\\:include');

        const xiIncludePromises = Array.from(xiIncludeElements).flatMap(xiElement => {
            const xiIncludeElementHref = xiElement.getAttribute('href');
            if (!xiIncludeElementHref) {
                return [];
            }
            return loadXIncludeElement(xiIncludeElementHref, baseUrl).then(newContent => {
                xiElement.replaceWith(newContent);
            });
        });

        return Promise.all(xiIncludePromises).then(() => tempDiv.innerHTML);
    }

    return {
        name: 'xincludeLoader',
        loadXIncludeElement,
        parseXmlToDom,
        loadByElementPages(pages, baseUrl) {
            if (!baseUrl) {
                return Promise.reject(new Error('baseUrl is missing'));
            }
            function containsXIInclude(contentItem) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = contentItem;
                const xiIncludeElements = tempDiv.querySelectorAll('xi\\:include');
                return xiIncludeElements.length > 0;
            }
            const pageUpdatePromises = pages.map(page => {
                const hasXIInclude = page.content.some(containsXIInclude);
                if (!hasXIInclude) {
                    return Promise.resolve(page);
                }
                const contentPromises = page.content.map(contentItem => processContentItem(contentItem, baseUrl));
                return Promise.all(contentPromises).then(updatedContentItems => {
                    page.content = updatedContentItems;
                    return page;
                });
            });

            return Promise.all(pageUpdatePromises);
        }
    };
});
