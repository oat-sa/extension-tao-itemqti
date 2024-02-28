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

define(
    ['jquery', 'lodash',],
    function ($, _) {
        'use strict';

        const xincludeLoader = {
            name: 'xincludeLoader',
            load: function load(xincludeElement, baseUrl) {
                const self = this;
                const href = xincludeElement.attr('href');

                // Return a new Promise
                return new Promise((resolve, reject) => {
                    if (href && baseUrl) {
                        const fileUrl = `text!${baseUrl}${href}`;
                        // reset the previous definition of the XML, to receive updated passage
                        require.undef(fileUrl);
                        // require xml
                        require([fileUrl], function (stimulusXml) {
                            const data = self.parseXmlToDom(stimulusXml);
                            resolve({ xinclude: xincludeElement, data }); // Resolve with an object containing xinclude and data
                        }, function () {
                            // In case the file does not exist, reject the promise
                            reject(new Error('File not found'));
                        });
                    } else {
                        reject(new Error('href or baseUrl is missing'));
                    }
                });
            },
            parseXmlToDom: function parseXmlToDom(xmlString) {
                // Parse the XML string into a document object
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, "application/xml");

                // Function to recursively convert XML to HTML
                function convertXMLToHTML(xmlNode) {
                    // Create a corresponding HTML element for the XML node
                    const htmlNode = document.createElement(xmlNode.nodeName);

                    // Copy attributes
                    for (let i = 0; i < xmlNode.attributes.length; i++) {
                        const attr = xmlNode.attributes[i];
                        htmlNode.setAttribute(attr.name, attr.value);
                    }

                    // Recursively convert child nodes
                    xmlNode.childNodes.forEach(childNode => {
                        if (childNode.nodeType === Node.ELEMENT_NODE) {
                            htmlNode.appendChild(convertXMLToHTML(childNode));
                        } else if (childNode.nodeType === Node.TEXT_NODE) {
                            htmlNode.appendChild(document.createTextNode(childNode.nodeValue));
                        }
                    });

                    return htmlNode;
                }

                // Convert the XML document to HTML
                return convertXMLToHTML(xmlDoc.documentElement);
            },
            loadByElementPages: function loadByElementPages(pages, baseUrl) {
                return pages.map(page => {
                    const contentPromises = page.content.map(contentItem => {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = contentItem;
                        const xiIncludeElements = tempDiv.querySelectorAll('xi\\:include');

                        const xiIncludePromises = Array.from(xiIncludeElements).map(xiIncludeElement => {
                            const $xiIncludeElement = $(xiIncludeElement);
                            return xincludeLoader.load($xiIncludeElement, baseUrl).then(newContent => {
                                $xiIncludeElement.replaceWith(newContent.data);
                            });
                        });

                        return Promise.all(xiIncludePromises).then(() => tempDiv.innerHTML);
                    });

                    return Promise.all(contentPromises).then(updatedContentItems => {
                        page.content = updatedContentItems;
                        return page;
                    });
                });
            }
        };
        return xincludeLoader;
    });
