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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * Utility module for cleaning empty Ruby Furigana tags from HTML content.
 */
define([], function() {
    'use strict';

    const rubyTagCleaner = {
        /**
         * Remove empty ruby tags from HTML content
         *
         * An empty ruby tag is defined as one that:
         * - Has no rt (ruby text/furigana) elements
         * - Has rt elements that are empty or contain only whitespace/non-breaking spaces
         *
         * @param {String} htmlContent - The HTML content to clean
         * @returns {String} - Cleaned HTML content with empty ruby tags removed
         */
        clean(htmlContent) {
            if (!htmlContent) {
                return htmlContent;
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            const rubyElements = [];
            const allElements = tempDiv.getElementsByTagName('*');

            for (let i = 0; i < allElements.length; i++) {
                const tagName = allElements[i].tagName.toLowerCase();
                if (tagName === 'qh5:ruby' || tagName === 'ruby') {
                    rubyElements.push(allElements[i]);
                }
            }

            rubyElements.forEach(function(ruby) {
                const rbElements = [];
                const rtElements = [];
                const children = ruby.children;

                for (let i = 0; i < children.length; i++) {
                    const tagName = children[i].tagName.toLowerCase();
                    if (tagName === 'qh5:rb' || tagName === 'rb') {
                        rbElements.push(children[i]);
                    } else if (tagName === 'qh5:rt' || tagName === 'rt') {
                        rtElements.push(children[i]);
                    }
                }

                let shouldRemove = false;

                if (rbElements.length === 0) {
                    shouldRemove = true;
                } else if (rtElements.length === 0) {
                    shouldRemove = true;
                } else if (rtElements.length > 0) {
                    let hasNonEmptyRt = false;
                    for (let j = 0; j < rtElements.length; j++) {
                        const raw = rtElements[j].textContent || '';
                        const normalized = raw.replace(/[\s\u00A0\u200B\uFEFF\u3000]+/g, '');
                        if (normalized !== '') {
                            hasNonEmptyRt = true;
                            break;
                        }
                    }
                    if (!hasNonEmptyRt) {
                        shouldRemove = true;
                    }
                }

                if (shouldRemove && rbElements.length > 0) {
                    const baseText = rbElements
                        .map(rb => rb.textContent || '')
                        .join('');
                    const textNode = document.createTextNode(baseText);
                    ruby.parentNode.replaceChild(textNode, ruby);
                } else if (shouldRemove) {
                    ruby.remove();
                }
            });

            return tempDiv.innerHTML;
        }
    };

    return rubyTagCleaner;
});
